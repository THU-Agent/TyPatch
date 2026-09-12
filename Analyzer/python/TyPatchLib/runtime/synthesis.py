#!/usr/bin/env python3
"""Run patch-to-rule synthesis one commit at a time with resumable status.

This is a thin runner around the official
``python -m TyPatchLib.Synthesizer.cli synthesize`` entry point. It does not
change synthesis semantics; it only isolates each commit in a separate
subprocess so API hangs or transient endpoint failures do not block a whole
batch.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import csv
import json
import os
import re
import shlex
import signal
import subprocess
import sys
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class CommitRow:
    commit: str
    label: str
    raw: str


@dataclass(frozen=True)
class CommitResult:
    """One completed work item; status persistence is owned by the caller."""

    status_row: dict[str, Any]
    counter: str
    summary_line: str


_PRINT_LOCK = threading.Lock()


def runner_print(message: str) -> None:
    """Keep progress lines readable when multiple commit workers are active."""
    with _PRINT_LOCK:
        print(message, flush=True)


_TRANSIENT_ERROR_PATTERNS = (
    re.compile(
        r"\b(?:api\s*)?connection\s+(?:error|reset|aborted|refused|closed)\b"
        r"|\b(?:api)?connect(?:ion)?error\b"
        r"|\bconnect\s+error\b"
        r"|\bfailed to connect\b"
        r"|\bremote\s*protocol\s*error\b"
        r"|\bserver disconnected\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:api|read|write|connect|connection|request|pool)\s*timeout"
        r"(?:\s*(?:error|exception))?\b"
        r"|\btimeout(?:error|exception)\b"
        r"|\btimed out\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b429\b|\brate[\s_-]*limit(?:ed|ing)?\b|\btoo many requests\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:error|status|code|http|response)[^0-9\n]{0,24}5\d\d\b"
        r"|\b5\d\d\s+(?:internal server error|bad gateway|service unavailable|gateway timeout)\b"
        r"|\b(?:internal server error|bad gateway|service unavailable|gateway timeout)\b"
        r"|\b(?:internalservererror|badgateway|serviceunavailable|gatewaytimeout)\b"
        r"|\b5xx\b",
        re.IGNORECASE,
    ),
)


def build_env(typatch_root: Path, args: argparse.Namespace) -> dict[str, str]:
    env = os.environ.copy()
    if "OPENAI_BASE_URL" not in env and "BASE_URL" in env:
        env["OPENAI_BASE_URL"] = env["BASE_URL"]
    if args.api_timeout_sec is not None:
        env["OPENAI_TIMEOUT_SEC"] = str(args.api_timeout_sec)
    if args.api_max_retries is not None:
        env["OPENAI_MAX_RETRIES"] = str(args.api_max_retries)
    if args.api_retry_backoff_sec is not None:
        env["OPENAI_RETRY_BACKOFF_SEC"] = str(args.api_retry_backoff_sec)

    analyzer_python = typatch_root / "Analyzer/python"
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = (
        str(analyzer_python)
        if not existing
        else str(analyzer_python) + os.pathsep + existing
    )
    return env


def read_commits(path: Path, *, offset: int, limit: int | None) -> list[CommitRow]:
    rows: list[CommitRow] = []
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        commit, _, label = line.partition(",")
        rows.append(CommitRow(commit=commit.strip(), label=label.strip(), raw=line))
    if offset:
        rows = rows[offset:]
    if limit is not None:
        rows = rows[:limit]
    return rows


def load_report(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except Exception as exc:  # noqa: BLE001
        return {"verdict": "report_parse_error", "parse_error": repr(exc)}


def _generation_report_sections(
    report: dict[str, Any],
) -> list[tuple[str, dict[str, Any]]]:
    """Return the candidate-generation section from a synthesis report."""
    generation = report.get("generation")
    if isinstance(generation, dict):
        return [("generation", generation)]
    return []


def first_failure(report: dict[str, Any] | None) -> str:
    if not report:
        return ""
    for _section_name, section in _generation_report_sections(report):
        if section.get("abort_reason"):
            return str(section["abort_reason"])
        if section.get("schema_error"):
            return str(section["schema_error"])
    lowering = report.get("lowering") or {}
    if lowering.get("error"):
        return str(lowering["error"])
    failed = [
        f"{item.get('check', 'unknown')}:{item.get('code', '')}"
        for item in report.get("sanity_findings") or []
        if item and not item.get("passed", False)
    ]
    if failed:
        return "; ".join(failed)
    return str(report.get("parse_error", ""))


def _transient_error_texts(report: dict[str, Any] | None) -> list[tuple[str, str]]:
    """Return report fields that may contain transport/service failures.

    Only error-bearing fields are inspected.  In particular, ordinary abort
    prose is not retried merely because the verdict is ``abort``; its reason
    must also match a known transient transport or service failure.
    """
    if not report:
        return []

    texts: list[tuple[str, str]] = []
    for section_name, section in _generation_report_sections(report):
        for key, value in section.items():
            if key not in {"abort_reason", "error", "schema_error"} and not key.endswith(
                "_error"
            ):
                continue
            # ``abort=True`` means the model deliberately returned an abort
            # object.  That is a semantic outcome even if its prose happens
            # to mention a timeout-like bug; transport failures leave this
            # flag false and put the exception in abort_reason/error.
            if key == "abort_reason" and section.get("abort") is True:
                continue
            if value:
                texts.append((f"{section_name}.{key}", str(value)))

    return texts


def transient_failure_reason(report: dict[str, Any] | None) -> str:
    """Describe a retryable report-level failure, or return an empty string."""
    for source, message in _transient_error_texts(report):
        if any(pattern.search(message) for pattern in _TRANSIENT_ERROR_PATTERNS):
            return f"{source}: {message}"
    return ""


def transient_log_failure_reason(log_path: Path) -> str:
    """Describe a retryable transport/service failure found in an attempt log."""
    try:
        text = log_path.read_text(errors="replace")
    except OSError:
        return ""
    for line in reversed(text.splitlines()):
        if any(pattern.search(line) for pattern in _TRANSIENT_ERROR_PATTERNS):
            return "log: " + line[-500:]
    return ""


def retryable_failure_reason(
    report: dict[str, Any] | None,
    *,
    log_path: Path,
    status: str,
    timeout_sec: int,
) -> str:
    if status == "timeout":
        return f"runner timeout after {timeout_sec}s"
    if report and report.get("verdict") == "report_parse_error":
        return "report_parse_error: " + str(report.get("parse_error", ""))
    return transient_failure_reason(report) or transient_log_failure_reason(log_path)


def should_skip(report_path: Path, args: argparse.Namespace) -> tuple[bool, str]:
    if args.force:
        return False, ""
    report = load_report(report_path)
    if report is None:
        return False, ""
    verdict = str(report.get("verdict", ""))
    if getattr(args, "transient_max_retries", 0) and transient_failure_reason(report):
        return False, verdict
    if args.retry_failed and verdict != "synth_ok":
        return False, verdict
    if args.skip_existing == "any":
        return True, verdict
    if args.skip_existing == "synth_ok" and verdict == "synth_ok":
        return True, verdict
    return False, verdict


def append_status(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "index",
        "commit",
        "label",
        "status",
        "attempts",
        "returncode",
        "verdict",
        "elapsed_sec",
        "report_path",
        "log_path",
        "failure",
    ]
    write_header = not path.exists()
    with path.open("a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        if write_header:
            writer.writeheader()
        writer.writerow({key: row.get(key, "") for key in fieldnames})


def write_single_commit(path: Path, row: CommitRow) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    line = row.commit if not row.label else f"{row.commit},{row.label}"
    path.write_text(line + "\n")


def run_command(
    command: list[str],
    *,
    cwd: Path,
    env: dict[str, str],
    timeout_sec: int,
    log_path: Path,
) -> tuple[str, int | None, float]:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    start = time.monotonic()
    with log_path.open("w") as log:
        log.write("[runner] command: " + shlex.join(command) + "\n")
        log.flush()
        proc = subprocess.Popen(
            command,
            cwd=str(cwd),
            env=env,
            stdout=log,
            stderr=subprocess.STDOUT,
            text=True,
            start_new_session=True,
        )
        try:
            returncode = proc.wait(timeout=timeout_sec)
            return "finished", returncode, time.monotonic() - start
        except subprocess.TimeoutExpired:
            log.write(f"\n[runner] timeout after {timeout_sec}s; terminating process group\n")
            log.flush()
            try:
                os.killpg(proc.pid, signal.SIGTERM)
                proc.wait(timeout=20)
            except Exception:  # noqa: BLE001
                try:
                    os.killpg(proc.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                proc.wait()
            return "timeout", None, time.monotonic() - start


def synthesis_command(
    args: argparse.Namespace,
    commit_file: Path,
) -> list[str]:
    command = [
        args.python,
        "-m",
        "TyPatchLib.Synthesizer.cli",
        "synthesize",
        "--commits",
        str(commit_file),
        "--repo",
        str(args.repo),
        "--out-dir",
        str(args.out_dir),
        "--report-dir",
        str(args.report_dir),
    ]
    if args.kernel_source is not None:
        command.extend(["--kernel-source", str(args.kernel_source)])
    return command


def process_commit(
    *,
    args: argparse.Namespace,
    env: dict[str, str],
    typatch_root: Path,
    run_dir: Path,
    index: int,
    row: CommitRow,
) -> CommitResult:
    """Process one commit without mutating the shared status TSV.

    Every path touched here contains either the full commit id or the unique
    input index.  ``run_rows`` rejects duplicate commits in parallel mode so
    workers cannot race on report or output artifacts.
    """
    report_path = args.report_dir / f"{row.commit}.json"
    skip, existing_verdict = should_skip(report_path, args)
    if skip:
        status_row = {
            "index": index,
            "commit": row.commit,
            "label": row.label,
            "status": "skipped",
            "attempts": 0,
            "returncode": "",
            "verdict": existing_verdict,
            "elapsed_sec": "0.000",
            "report_path": str(report_path),
            "log_path": "",
            "failure": first_failure(load_report(report_path)),
        }
        return CommitResult(
            status_row=status_row,
            counter="skipped",
            summary_line=f"{index:04d} {row.commit[:12]} skipped {existing_verdict}",
        )

    single_commit = run_dir / "single_commits" / f"{index:04d}_{row.commit}.txt"
    write_single_commit(single_commit, row)
    command = synthesis_command(args, single_commit)
    max_attempts = args.transient_max_retries + 1
    commit_start = time.monotonic()
    attempts = 0
    transient_reason = ""
    status = "finished"
    returncode: int | None = None
    report: dict[str, Any] | None = None
    verdict = ""
    failure = ""
    log_path = run_dir / "logs" / f"{index:04d}_{row.commit[:12]}.attempt_01.log"

    for attempt in range(1, max_attempts + 1):
        attempts = attempt
        log_path = (
            run_dir
            / "logs"
            / f"{index:04d}_{row.commit[:12]}.attempt_{attempt:02d}.log"
        )
        # Never let a report or artifact from an earlier attempt (or a forced
        # rerun) masquerade as the result of this subprocess.
        report_path.unlink(missing_ok=True)
        (args.out_dir / f"{row.commit}.ts").unlink(missing_ok=True)
        (args.out_dir / f"{row.commit}.ir.json").unlink(missing_ok=True)
        runner_print(
            f"{index:04d} {row.commit[:12]} running "
            f"attempt={attempt}/{max_attempts} {row.label}"
        )
        status, returncode, _ = run_command(
            command,
            cwd=typatch_root,
            env=env,
            timeout_sec=args.commit_timeout_sec,
            log_path=log_path,
        )
        report = load_report(report_path)
        verdict = str((report or {}).get("verdict", ""))
        failure = first_failure(report)
        transient_reason = retryable_failure_reason(
            report,
            log_path=log_path,
            status=status,
            timeout_sec=args.commit_timeout_sec,
        )
        if not transient_reason or attempt >= max_attempts:
            break
        runner_print(
            f"{index:04d} {row.commit[:12]} transient_retry "
            f"attempt={attempt}/{max_attempts} reason={transient_reason}"
        )
        if args.transient_retry_backoff_sec:
            time.sleep(args.transient_retry_backoff_sec)

    elapsed = time.monotonic() - commit_start
    if transient_reason:
        counter = "failed"
        status = "transient_exhausted"
        failure = (
            f"transient retries exhausted after {attempts} attempt(s): "
            f"{transient_reason}"
        )
    elif status == "timeout":
        # A timeout is always transient above, so this is defensive only.
        counter = "timeout"
        failure = failure or f"runner timeout after {args.commit_timeout_sec}s"
    elif returncode == 0 and verdict:
        counter = "completed"
    else:
        counter = "failed"
        failure = failure or "synthesis returned without a readable report"

    status_row = {
        "index": index,
        "commit": row.commit,
        "label": row.label,
        "status": status,
        "attempts": attempts,
        "returncode": "" if returncode is None else returncode,
        "verdict": verdict,
        "elapsed_sec": f"{elapsed:.3f}",
        "report_path": str(report_path),
        "log_path": str(log_path),
        "failure": failure,
    }
    return CommitResult(
        status_row=status_row,
        counter=counter,
        summary_line=(
            f"{index:04d} {row.commit[:12]} {status} rc={returncode} "
            f"verdict={verdict or '-'} attempts={attempts} elapsed={elapsed:.1f}s"
        ),
    )


def validate_parallel_rows(rows: list[CommitRow], jobs: int) -> None:
    """Reject only the artifact collision that parallel execution introduces."""
    if jobs < 1:
        raise ValueError("--jobs must be at least 1")
    if jobs == 1:
        return
    seen: set[str] = set()
    duplicates: list[str] = []
    for row in rows:
        if row.commit in seen and row.commit not in duplicates:
            duplicates.append(row.commit)
        seen.add(row.commit)
    if duplicates:
        raise ValueError(
            "parallel mode requires unique commits because output paths are "
            "commit-keyed; duplicates: " + ", ".join(duplicates)
        )


def run_rows(
    *,
    rows: list[CommitRow],
    args: argparse.Namespace,
    env: dict[str, str],
    typatch_root: Path,
    run_dir: Path,
    status_tsv: Path,
) -> dict[str, int]:
    """Run selected rows and serialize status writes in the caller thread."""
    validate_parallel_rows(rows, args.jobs)
    counters = {
        "completed": 0,
        "skipped": 0,
        "failed": 0,
        "timeout": 0,
    }

    def record(result: CommitResult) -> None:
        append_status(status_tsv, result.status_row)
        counters[result.counter] += 1
        runner_print(result.summary_line)

    indexed_rows = list(enumerate(rows, start=args.offset + 1))
    if args.jobs == 1:
        for index, row in indexed_rows:
            record(
                process_commit(
                    args=args,
                    env=env,
                    typatch_root=typatch_root,
                    run_dir=run_dir,
                    index=index,
                    row=row,
                )
            )
        return counters

    with concurrent.futures.ThreadPoolExecutor(
        max_workers=min(args.jobs, len(indexed_rows) or 1),
        thread_name_prefix="synthesis",
    ) as executor:
        futures = [
            executor.submit(
                process_commit,
                args=args,
                env=env,
                typatch_root=typatch_root,
                run_dir=run_dir,
                index=index,
                row=row,
            )
            for index, row in indexed_rows
        ]
        for future in concurrent.futures.as_completed(futures):
            record(future.result())
    return counters


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--commits", required=True, type=Path)
    parser.add_argument("--repo", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--report-dir", required=True, type=Path)
    parser.add_argument("--typatch-root", type=Path, default=Path.cwd())
    parser.add_argument("--python", default=sys.executable)
    parser.add_argument("--run-dir", type=Path, default=None)
    parser.add_argument("--status-tsv", type=Path, default=None)
    parser.add_argument("--commit-timeout-sec", type=int, default=600)
    parser.add_argument("--api-timeout-sec", type=int, default=None)
    parser.add_argument("--api-max-retries", type=int, default=None)
    parser.add_argument("--api-retry-backoff-sec", type=float, default=None)
    parser.add_argument(
        "--transient-max-retries",
        type=int,
        default=0,
        help=(
            "retry a whole commit this many times when its report records a "
            "transient connection/timeout/429/5xx failure"
        ),
    )
    parser.add_argument(
        "--transient-retry-backoff-sec",
        type=float,
        default=5.0,
        help="seconds to wait between whole-commit transient retry attempts",
    )
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument(
        "--jobs",
        type=int,
        default=1,
        help=(
            "maximum concurrent commit subprocesses; default 1 preserves "
            "the original serial behavior"
        ),
    )
    parser.add_argument(
        "--skip-existing",
        choices=("any", "synth_ok", "none"),
        default="any",
        help="whether to skip commits with existing reports",
    )
    parser.add_argument(
        "--retry-failed",
        action="store_true",
        help="rerun existing non-synth_ok reports while still skipping synth_ok",
    )
    parser.add_argument("--force", action="store_true", help="rerun all selected commits")
    parser.add_argument("--kernel-source", type=Path, default=None)
    args = parser.parse_args()
    if args.transient_max_retries < 0:
        parser.error("--transient-max-retries must be non-negative")
    if args.transient_retry_backoff_sec < 0:
        parser.error("--transient-retry-backoff-sec must be non-negative")
    if args.jobs < 1:
        parser.error("--jobs must be at least 1")

    typatch_root = args.typatch_root.resolve()
    run_dir = args.run_dir or (args.report_dir.parent / "synthesis_runner")
    status_tsv = args.status_tsv or (run_dir / "status.tsv")
    env = build_env(typatch_root, args)

    args.out_dir.mkdir(parents=True, exist_ok=True)
    args.report_dir.mkdir(parents=True, exist_ok=True)
    run_dir.mkdir(parents=True, exist_ok=True)

    rows = read_commits(args.commits, offset=args.offset, limit=args.limit)
    try:
        validate_parallel_rows(rows, args.jobs)
    except ValueError as exc:
        parser.error(str(exc))
    runner_print(
        f"selected={len(rows)} jobs={args.jobs} "
        f"report_dir={args.report_dir} status={status_tsv}"
    )
    counters = run_rows(
        rows=rows,
        args=args,
        env=env,
        typatch_root=typatch_root,
        run_dir=run_dir,
        status_tsv=status_tsv,
    )

    runner_print(
        "Summary: "
        + json.dumps({"selected": len(rows), **counters}, sort_keys=True)
    )
    return (
        0
        if counters["failed"] == 0
        and counters["timeout"] == 0
        else 1
    )


if __name__ == "__main__":
    raise SystemExit(main())
