#!/usr/bin/env python3
"""Scope, shard, execute, and merge TyPatch typestate scans.

Rules are grouped by kernel/module scope. Each group is partitioned into
process-level shards with isolated ``TYPATCH_WORK_ROOT`` and ``TSBug.db``
instances, then the shard and group databases are merged deterministically.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import re
import shutil
import signal
import sqlite3
import subprocess
import sys
import time
from dataclasses import asdict
from pathlib import Path
from typing import Any, Iterable, Sequence

from .scan_common import (
    LinkTarget,
    ScopeGroup,
    append_jsonl,
    atomic_write_json,
    build_scan_environment,
    group_rules_by_scope,
    now_iso,
    partition_targets_lpt,
    prepare_rules,
    read_link_targets,
    read_table_counts,
    select_targets,
    sha256_file,
    write_counts,
    write_filtered_compile_db,
)


_COMPLETED_RE = re.compile(r"^CompletedTarget:\s*(.*)$")
_MAX_RSS_RE = re.compile(r"^Maximum resident set size \(kbytes\):\s*(\d+)\s*$")
_ELAPSED_TIME_RE = re.compile(
    r"^Elapsed \(wall clock\) time \(h:mm:ss or m:ss\):\s*(\S.*?)\s*$"
)


def parse_sharded_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rules-dir", required=True, type=Path)
    parser.add_argument("--compile-db", required=True, type=Path)
    parser.add_argument("--typestate-bin", required=True, type=Path)
    parser.add_argument("--typatch-root", required=True, type=Path)
    parser.add_argument("--work-dir", required=True, type=Path)
    parser.add_argument("--source-name", default="")
    parser.add_argument("--shards", type=int, default=4)
    parser.add_argument(
        "--jobs",
        type=int,
        default=0,
        help="concurrent shard processes; default is --shards",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=8,
        help=(
            "targets per typestate process; 1 gives strict per-target "
            "resume granularity"
        ),
    )
    parser.add_argument(
        "--target-ordinals",
        type=Path,
        help="optional file containing 1-based compile-DB target ordinals",
    )
    parser.add_argument(
        "--target-timeout-sec",
        type=float,
        default=0.0,
        help=(
            "real per-batch wall-clock timeout in seconds; 0 disables. On "
            "expiry the scanner process group is terminated and the target is "
            "recorded separately so ordinary resume does not immediately "
            "repeat it"
        ),
    )
    parser.add_argument(
        "--no-resume",
        action="store_true",
        help="ignore valid done markers and rerun all selected targets",
    )
    return parser.parse_args(argv)


def chunked(
    items: Sequence[LinkTarget], size: int
) -> list[list[LinkTarget]]:
    if size <= 0:
        raise ValueError("batch size must be positive")
    return [
        list(items[index : index + size])
        for index in range(0, len(items), size)
    ]


def marker_path(done_dir: Path, target: LinkTarget) -> Path:
    return done_dir / f"{target.ordinal:06d}_{target.target_hash[:12]}.json"


def marker_is_valid(
    path: Path,
    *,
    target: LinkTarget,
    manifest_hash: str,
    binary_hash: str,
) -> bool:
    if not path.exists():
        return False
    try:
        marker = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return False
    return (
        marker.get("target_hash") == target.target_hash
        and marker.get("manifest_hash") == manifest_hash
        and marker.get("typestate_sha256") == binary_hash
        and marker.get("returncode") == 0
    )


def write_done_marker(
    path: Path,
    *,
    target: LinkTarget,
    manifest_hash: str,
    binary_hash: str,
    shard_index: int,
    batch_index: int,
) -> None:
    atomic_write_json(
        path,
        {
            **asdict(target),
            "manifest_hash": manifest_hash,
            "typestate_sha256": binary_hash,
            "shard_index": shard_index,
            "batch_index": batch_index,
            "returncode": 0,
            "completed_at": now_iso(),
        },
    )


def timeout_marker_path(timeout_dir: Path, target: LinkTarget) -> Path:
    return timeout_dir / f"{target.ordinal:06d}_{target.target_hash[:12]}.json"


def timeout_marker_is_valid(
    path: Path,
    *,
    target: LinkTarget,
    manifest_hash: str,
    binary_hash: str,
) -> bool:
    """A timeout marker is valid only for the same target, rules, and binary.

    A changed binary or rewritten rule set can make a previously slow target
    tractable again, so an old timeout must not suppress a rerun.
    """

    if not path.exists():
        return False
    try:
        marker = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return False
    return (
        marker.get("target_hash") == target.target_hash
        and marker.get("manifest_hash") == manifest_hash
        and marker.get("typestate_sha256") == binary_hash
        and marker.get("status") == "timed_out"
    )


def write_timeout_marker(
    timeout_dir: Path,
    *,
    target: LinkTarget,
    manifest_hash: str,
    binary_hash: str,
    shard_index: int,
    batch_index: int,
    reason: str,
    timeout_sec: float,
    elapsed_sec: float,
) -> None:
    """Record a timed-out target separately from completed targets."""

    atomic_write_json(
        timeout_marker_path(timeout_dir, target),
        {
            **asdict(target),
            "manifest_hash": manifest_hash,
            "typestate_sha256": binary_hash,
            "shard_index": shard_index,
            "batch_index": batch_index,
            "status": "timed_out",
            "reason": reason,
            "timeout_sec": timeout_sec,
            "elapsed_sec": round(elapsed_sec, 3),
            "timed_out_at": now_iso(),
        },
    )
    append_jsonl(
        timeout_dir / "events.jsonl",
        {
            **asdict(target),
            "status": "timed_out",
            "reason": reason,
            "timeout_sec": timeout_sec,
            "elapsed_sec": round(elapsed_sec, 3),
            "shard_index": shard_index,
            "batch_index": batch_index,
            "timed_out_at": now_iso(),
        },
    )


def collect_completed_target_hashes(
    work_dir: Path, *, manifest_hash: str, binary_hash: str
) -> set[str]:
    """Return target hashes with a valid done marker in any shard."""

    done_hashes: set[str] = set()
    for marker in work_dir.glob("shards/*/done/*.json"):
        try:
            payload = json.loads(marker.read_text())
        except (OSError, json.JSONDecodeError):
            continue
        if (
            payload.get("manifest_hash") == manifest_hash
            and payload.get("typestate_sha256") == binary_hash
            and payload.get("returncode") == 0
            and isinstance(payload.get("target_hash"), str)
        ):
            done_hashes.add(payload["target_hash"])
    return done_hashes


def terminate_process_group(proc: "subprocess.Popen[Any]") -> None:
    """Terminate a timed-out scanner and every process it forked.

    The batch command is ``/usr/bin/time typestate ...``; the analysis work
    runs in a grandchild. ``start_new_session=True`` puts the whole tree in its
    own process group so a single ``killpg`` reaps it, escalating SIGTERM to
    SIGKILL if needed. Killing only the direct child would orphan the typestate
    process, which could keep writing the shard DB.
    """

    try:
        pgid = os.getpgid(proc.pid)
    except (ProcessLookupError, OSError):
        pgid = None
    for sig in (signal.SIGTERM, signal.SIGKILL):
        if pgid is not None:
            try:
                os.killpg(pgid, sig)
            except (ProcessLookupError, OSError):
                pgid = None
        else:
            try:
                proc.send_signal(sig)
            except (ProcessLookupError, OSError):
                pass
        try:
            proc.wait(timeout=10)
            return
        except subprocess.TimeoutExpired:
            continue


def execute_batch_process(
    command: Sequence[str],
    *,
    stdout: Any,
    stderr: Any,
    run_kwargs: dict[str, Any],
    timeout_sec: float,
) -> tuple[int, bool]:
    """Run one batch, optionally under a real wall-clock timeout.

    Returns ``(returncode, timed_out)``. With a timeout, ``Popen`` starts a
    fresh session so expiry can terminate the entire scanner process group.
    """

    if timeout_sec and timeout_sec > 0:
        popen_kwargs = dict(run_kwargs)
        popen_kwargs.pop("check", None)
        proc = subprocess.Popen(
            command,
            stdout=stdout,
            stderr=stderr,
            start_new_session=True,
            **popen_kwargs,
        )
        try:
            proc.communicate(timeout=timeout_sec)
            return int(proc.returncode), False
        except subprocess.TimeoutExpired:
            terminate_process_group(proc)
            return 124, True
    proc = subprocess.run(command, stdout=stdout, stderr=stderr, **run_kwargs)
    return int(proc.returncode), False


def parse_batch_stdout(
    path: Path,
) -> list[str]:
    completed: list[str] = []
    if not path.exists():
        return completed
    for raw_line in path.read_text(errors="replace").splitlines():
        match = _COMPLETED_RE.match(raw_line)
        if match:
            completed.append(match.group(1))
    return completed


def parse_time_output(path: Path) -> dict[str, Any]:
    metrics: dict[str, Any] = {
        "max_rss_kb": None,
        "elapsed_time_text": None,
        "time_log_path": str(path) if path.exists() else None,
    }
    if not path.exists():
        return metrics
    for raw_line in path.read_text(errors="replace").splitlines():
        match = _MAX_RSS_RE.match(raw_line)
        if match:
            metrics["max_rss_kb"] = int(match.group(1))
            continue
        match = _ELAPSED_TIME_RE.match(raw_line)
        if match:
            metrics["elapsed_time_text"] = match.group(1)
    return metrics


def build_batch_command(
    *, typestate_bin: Path, manifest: Path, time_log_path: Path
) -> tuple[list[str], Path | None]:
    command = [str(typestate_bin), "--rules", str(manifest)]
    time_bin = shutil.which("time")
    if time_bin == "/usr/bin/time":
        return (
            [time_bin, "-v", "-o", str(time_log_path), *command],
            time_log_path,
        )
    return command, None


def run_batch(
    *,
    shard_index: int,
    batch_index: int,
    batch: Sequence[LinkTarget],
    source_compile_db: Path,
    shard_root: Path,
    manifest: Path,
    typestate_bin: Path,
    typatch_root: Path,
    manifest_hash: str,
    binary_hash: str,
    target_timeout_sec: float = 0.0,
    timeout_root: Path | None = None,
) -> dict[str, Any]:
    analysis_root = shard_root / "analysis"
    compile_db_path = analysis_root / "Database/SourceInfo/compile.db"
    done_dir = shard_root / "done"
    failure_dir = shard_root / "failures"
    log_dir = shard_root / "logs"
    progress_dir = shard_root / "progress"
    for directory in (done_dir, failure_dir, log_dir, progress_dir):
        directory.mkdir(parents=True, exist_ok=True)

    write_filtered_compile_db(
        source_compile_db,
        compile_db_path,
        (target.row_id for target in batch),
    )
    batch_tag = f"batch_{batch_index:05d}"
    stdout_path = log_dir / f"{batch_tag}.stdout.log"
    stderr_path = log_dir / f"{batch_tag}.stderr.log"
    time_log_path = log_dir / f"{batch_tag}.time.log"
    command, active_time_log_path = build_batch_command(
        typestate_bin=typestate_bin,
        manifest=manifest,
        time_log_path=time_log_path,
    )
    env = build_scan_environment(
        typatch_root=typatch_root,
        analysis_root=analysis_root,
    )

    current = {
        "shard_index": shard_index,
        "batch_index": batch_index,
        "targets": [target.to_json() for target in batch],
        "command": command,
        "time_log_path": str(active_time_log_path)
        if active_time_log_path is not None
        else None,
        "started_at": now_iso(),
    }
    atomic_write_json(progress_dir / "current.json", current)
    started = time.monotonic()
    timed_out = False
    run_kwargs: dict[str, Any] = {
        "cwd": typatch_root,
        "env": env,
        "check": False,
    }
    with stdout_path.open("w") as stdout, stderr_path.open("w") as stderr:
        returncode, timed_out = execute_batch_process(
            command,
            stdout=stdout,
            stderr=stderr,
            run_kwargs=run_kwargs,
            timeout_sec=target_timeout_sec,
        )
    elapsed = time.monotonic() - started
    time_metrics = (
        parse_time_output(active_time_log_path)
        if active_time_log_path is not None
        else {
            "max_rss_kb": None,
            "elapsed_time_text": None,
            "time_log_path": None,
        }
    )
    completed_names = parse_batch_stdout(stdout_path)
    targets_by_name: dict[str, list[LinkTarget]] = {}
    for target in batch:
        targets_by_name.setdefault(target.target_file, []).append(target)

    completed_targets: list[LinkTarget] = []
    for name in completed_names:
        candidates = targets_by_name.get(name, [])
        if candidates:
            completed_targets.append(candidates.pop(0))
    for target in completed_targets:
        write_done_marker(
            marker_path(done_dir, target),
            target=target,
            manifest_hash=manifest_hash,
            binary_hash=binary_hash,
            shard_index=shard_index,
            batch_index=batch_index,
        )

    timed_out_targets: list[LinkTarget] = []
    if timed_out:
        timeout_dir = timeout_root if timeout_root is not None else shard_root / "timeouts"
        timeout_dir.mkdir(parents=True, exist_ok=True)
        completed_set = set(completed_targets)
        for target in batch:
            if target in completed_set:
                continue
            timed_out_targets.append(target)
            write_timeout_marker(
                timeout_dir,
                target=target,
                manifest_hash=manifest_hash,
                binary_hash=binary_hash,
                shard_index=shard_index,
                batch_index=batch_index,
                reason="target_timeout",
                timeout_sec=target_timeout_sec,
                elapsed_sec=elapsed,
            )

    batch_result = {
        "shard_index": shard_index,
        "batch_index": batch_index,
        "returncode": returncode,
        "timed_out": timed_out,
        "elapsed_sec": round(elapsed, 3),
        "elapsed_time_text": time_metrics["elapsed_time_text"],
        "max_rss_kb": time_metrics["max_rss_kb"],
        "time_log_path": time_metrics["time_log_path"],
        "target_count": len(batch),
        "completed_count": len(completed_targets),
        "completed_ordinals": [
            target.ordinal for target in completed_targets
        ],
        "timed_out_count": len(timed_out_targets),
        "timed_out_ordinals": [target.ordinal for target in timed_out_targets],
        "remaining_ordinals": [
            target.ordinal
            for target in batch
            if target not in completed_targets
        ],
        "stdout": str(stdout_path),
        "stderr": str(stderr_path),
        "finished_at": now_iso(),
    }
    append_jsonl(shard_root / "telemetry/batches.jsonl", batch_result)
    if returncode != 0:
        atomic_write_json(
            failure_dir / f"{batch_tag}.json", batch_result
        )
    current_path = progress_dir / "current.json"
    if current_path.exists():
        current_path.unlink()
    return batch_result


def _finalize_shard_summary(
    *,
    shard_index: int,
    shard_root: Path,
    assigned_targets: int,
    skipped_done: int,
    skipped_timed_out: int,
    attempted_targets: int,
    results: Sequence[dict[str, Any]],
) -> dict[str, Any]:
    db_path = shard_root / "analysis/Database/BugInfo/TSBug.db"
    counts = read_table_counts(db_path)
    write_counts(shard_root / "table_counts.tsv", counts)
    # A timed-out batch is recorded separately and does not turn the whole scan
    # into a hard failure.
    failed_batches = [
        result
        for result in results
        if result["returncode"] != 0 and not result.get("timed_out")
    ]
    summary = {
        "shard_index": shard_index,
        "assigned_targets": assigned_targets,
        "resumed_targets": skipped_done,
        "resumed_timed_out_targets": skipped_timed_out,
        "attempted_targets": attempted_targets,
        "completed_targets": skipped_done
        + sum(result["completed_count"] for result in results),
        "timed_out_targets": sum(
            result.get("timed_out_count", 0) for result in results
        ),
        "batch_count": len(results),
        "failed_batch_count": len(failed_batches),
        "elapsed_sec": round(
            sum(result["elapsed_sec"] for result in results), 3
        ),
        "db_path": str(db_path),
        "typestate_reports": dict(counts).get("typestate_reports", 0),
    }
    atomic_write_json(shard_root / "summary.json", summary)
    return summary


def run_shard(
    *,
    shard_index: int,
    targets: Sequence[LinkTarget],
    args: argparse.Namespace,
    manifest: Path,
    manifest_hash: str,
    binary_hash: str,
    timeout_root: Path | None = None,
) -> dict[str, Any]:
    shard_root = args.work_dir / "shards" / f"{shard_index:03d}"
    done_dir = shard_root / "done"
    done_dir.mkdir(parents=True, exist_ok=True)
    timeout_dir = timeout_root if timeout_root is not None else args.work_dir / "timeouts"
    selected: list[LinkTarget] = []
    skipped_done = 0
    skipped_timed_out = 0
    for target in targets:
        marker = marker_path(done_dir, target)
        if not args.no_resume and marker_is_valid(
            marker,
            target=target,
            manifest_hash=manifest_hash,
            binary_hash=binary_hash,
        ):
            skipped_done += 1
            continue
        if not args.no_resume and timeout_marker_is_valid(
            timeout_marker_path(timeout_dir, target),
            target=target,
            manifest_hash=manifest_hash,
            binary_hash=binary_hash,
        ):
            # Do not immediately repeat a timeout under the same binary/rules.
            skipped_timed_out += 1
            continue
        selected.append(target)

    results: list[dict[str, Any]] = []
    for batch_index, batch in enumerate(
        chunked(selected, args.batch_size), start=1
    ):
        result = run_batch(
            shard_index=shard_index,
            batch_index=batch_index,
            batch=batch,
            source_compile_db=args.compile_db,
            shard_root=shard_root,
            manifest=manifest,
            typestate_bin=args.typestate_bin,
            typatch_root=args.typatch_root,
            manifest_hash=manifest_hash,
            binary_hash=binary_hash,
            target_timeout_sec=args.target_timeout_sec,
            timeout_root=timeout_root,
        )
        results.append(result)

    return _finalize_shard_summary(
        shard_index=shard_index,
        shard_root=shard_root,
        assigned_targets=len(targets),
        skipped_done=skipped_done,
        skipped_timed_out=skipped_timed_out,
        attempted_targets=len(selected),
        results=results,
    )


def _quote_ident(name: str) -> str:
    return '"' + name.replace('"', '""') + '"'


def _table_schemas(connection: sqlite3.Connection) -> dict[str, str]:
    rows = connection.execute(
        "select name, sql from sqlite_master where type='table' "
        "and name not like 'sqlite_%' order by name"
    ).fetchall()
    return {str(name): str(sql) for name, sql in rows if sql}


def _table_columns(
    connection: sqlite3.Connection, table: str
) -> list[tuple[str, int]]:
    rows = connection.execute(
        f"pragma table_info({_quote_ident(table)})"
    ).fetchall()
    return [(str(row[1]), int(row[5])) for row in rows]


def _copy_table(
    source: sqlite3.Connection,
    destination: sqlite3.Connection,
    table: str,
) -> tuple[int, int]:
    columns = [
        name
        for name, primary_key in _table_columns(source, table)
        if not (name == "id" and primary_key)
    ]
    if not columns:
        return 0, 0
    quoted_columns = ", ".join(_quote_ident(column) for column in columns)
    placeholders = ", ".join("?" for _ in columns)
    source_rows = source.execute(
        f"select {quoted_columns} from {_quote_ident(table)}"
    )
    before = destination.total_changes

    if table == "typestate_reports" and {
        "bug_key",
        "canonical_site_key",
        "object_key",
        "actions_json",
        "call_stk",
        "call_depth",
    }.issubset(columns):
        sql = (
            f"insert into {_quote_ident(table)} ({quoted_columns}) "
            f"values ({placeholders}) "
            "on conflict(bug_key, canonical_site_key, object_key, "
            "actions_json) do update set "
            "call_stk = excluded.call_stk, "
            "call_depth = excluded.call_depth "
            "where excluded.call_depth < typestate_reports.call_depth"
        )
    else:
        sql = (
            f"insert or ignore into {_quote_ident(table)} "
            f"({quoted_columns}) values ({placeholders})"
        )

    raw_count = 0
    while True:
        batch = source_rows.fetchmany(1000)
        if not batch:
            break
        raw_count += len(batch)
        destination.executemany(sql, batch)
    return raw_count, destination.total_changes - before


def merge_databases(
    shard_dbs: Iterable[Path], output_db: Path
) -> dict[str, Any]:
    """Merge isolated shard databases and deduplicate canonical reports."""

    shard_dbs = [path for path in shard_dbs if path.is_file()]
    if not shard_dbs:
        raise FileNotFoundError("no shard TSBug.db files found")
    output_db.parent.mkdir(parents=True, exist_ok=True)
    for suffix in ("", "-wal", "-shm"):
        path = Path(str(output_db) + suffix)
        if path.exists():
            path.unlink()

    per_shard: list[dict[str, Any]] = []
    with sqlite3.connect(output_db) as destination:
        destination.execute("pragma journal_mode = WAL")
        destination.execute("pragma synchronous = NORMAL")
        for shard_db in shard_dbs:
            shard_summary: dict[str, Any] = {
                "db": str(shard_db),
                "tables": {},
            }
            with sqlite3.connect(f"file:{shard_db}?mode=ro", uri=True) as source:
                for table, create_sql in _table_schemas(source).items():
                    exists = destination.execute(
                        "select 1 from sqlite_master where type='table' and name=?",
                        (table,),
                    ).fetchone()
                    if not exists:
                        destination.execute(create_sql)
                    raw_count, inserted_or_updated = _copy_table(
                        source, destination, table
                    )
                    shard_summary["tables"][table] = {
                        "raw_rows": raw_count,
                        "inserted_or_updated": inserted_or_updated,
                    }
                destination.commit()
            per_shard.append(shard_summary)
        destination.execute("pragma optimize")
        destination.commit()

    counts = read_table_counts(output_db)
    return {
        "output_db": str(output_db),
        "shard_count": len(shard_dbs),
        "shards": per_shard,
        "table_counts": dict(counts),
        "typestate_reports": dict(counts).get("typestate_reports", 0),
        "finished_at": now_iso(),
    }


def merge_shard_run(run_dir: Path) -> dict[str, Any]:
    output_db = run_dir / "merged/Database/BugInfo/TSBug.db"
    shard_dbs = sorted(
        run_dir.glob("shards/*/analysis/Database/BugInfo/TSBug.db")
    )
    summary = merge_databases(shard_dbs, output_db)
    atomic_write_json(run_dir / "merged/merge_summary.json", summary)
    write_counts(
        run_dir / "merged/table_counts.tsv",
        list(summary["table_counts"].items()),
    )
    print(json.dumps(summary, indent=2, sort_keys=True))
    return summary


def sharded_main(argv: Sequence[str] | None = None) -> int:
    args = parse_sharded_args(argv)
    args.rules_dir = args.rules_dir.resolve()
    args.compile_db = args.compile_db.resolve()
    args.typestate_bin = args.typestate_bin.resolve()
    args.typatch_root = args.typatch_root.resolve()
    args.work_dir = args.work_dir.resolve()
    if args.target_ordinals is not None:
        args.target_ordinals = args.target_ordinals.resolve()

    if args.shards <= 0:
        raise ValueError("--shards must be positive")
    if args.batch_size <= 0:
        raise ValueError("--batch-size must be positive")
    if args.target_timeout_sec < 0:
        raise ValueError("--target-timeout-sec must be non-negative")
    jobs = args.jobs or args.shards
    if jobs <= 0:
        raise ValueError("--jobs must be positive")
    for path, kind in (
        (args.rules_dir, "directory"),
        (args.compile_db, "file"),
        (args.typestate_bin, "file"),
        (args.typatch_root, "directory"),
    ):
        if kind == "directory" and not path.is_dir():
            raise FileNotFoundError(path)
        if kind == "file" and not path.is_file():
            raise FileNotFoundError(path)

    args.work_dir.mkdir(parents=True, exist_ok=True)
    shared_root = args.work_dir / "shared"
    shared_root.mkdir(parents=True, exist_ok=True)
    manifest, rule_rows, manifest_hash = prepare_rules(args.rules_dir, shared_root)
    binary_hash = sha256_file(args.typestate_bin)
    all_targets = read_link_targets(args.compile_db)
    targets = select_targets(
        all_targets,
        ordinal_file=args.target_ordinals,
    )
    if not targets:
        raise ValueError("no link targets selected")

    timeout_root = args.work_dir / "timeouts"
    timeout_root.mkdir(parents=True, exist_ok=True)

    assignments = partition_targets_lpt(targets, args.shards)
    schedule_payload = {
        "schedule": "lpt",
        "mode": "fixed_shards",
        "shards": [
            {
                "shard_index": index,
                "estimated_cost": sum(target.estimated_cost for target in shard),
                "targets": [target.to_json() for target in shard],
            }
            for index, shard in enumerate(assignments)
        ],
    }
    atomic_write_json(args.work_dir / "schedule.json", schedule_payload)
    metadata = {
        "source_name": args.source_name,
        "rules_dir": str(args.rules_dir),
        "rule_count": len(rule_rows),
        "manifest": str(manifest),
        "manifest_hash": manifest_hash,
        "compile_db": str(args.compile_db),
        "compile_db_sha256": sha256_file(args.compile_db),
        "target_count": len(targets),
        "typestate_bin": str(args.typestate_bin),
        "typestate_sha256": binary_hash,
        "typatch_root": str(args.typatch_root),
        "shards": args.shards,
        "jobs": jobs,
        "batch_size": args.batch_size,
        "schedule": "lpt",
        "target_timeout_sec": args.target_timeout_sec,
        "timeout_root": str(timeout_root),
        "started_at": now_iso(),
    }
    atomic_write_json(args.work_dir / "metadata.json", metadata)

    started = time.monotonic()
    summaries: list[dict[str, Any]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as executor:
        futures = [
            executor.submit(
                run_shard,
                shard_index=shard_index,
                targets=shard_targets,
                args=args,
                manifest=manifest,
                manifest_hash=manifest_hash,
                binary_hash=binary_hash,
                timeout_root=timeout_root,
            )
            for shard_index, shard_targets in enumerate(assignments)
        ]
        for future in concurrent.futures.as_completed(futures):
            summaries.append(future.result())
    summaries.sort(key=lambda item: item["shard_index"])
    elapsed = time.monotonic() - started

    failed_batches = sum(
        summary["failed_batch_count"] for summary in summaries
    )
    completed_targets = sum(
        summary["completed_targets"] for summary in summaries
    )
    # Read durable timeout markers so resumed runs report the full total.
    timeout_marker_files = sorted(timeout_root.glob("*.json"))
    timed_out_ordinals: list[int] = []
    for marker in timeout_marker_files:
        try:
            payload = json.loads(marker.read_text())
        except (OSError, json.JSONDecodeError):
            continue
        ordinal = payload.get("ordinal")
        if isinstance(ordinal, int):
            timed_out_ordinals.append(ordinal)
    timed_out_ordinals = sorted(set(timed_out_ordinals))
    # Authoritative coverage from durable per-target done markers, so a resumed
    # run reports total completed targets rather than only this run's new work.
    completed_targets_durable = len(
        collect_completed_target_hashes(
            args.work_dir,
            manifest_hash=manifest_hash,
            binary_hash=binary_hash,
        )
    )
    final_summary: dict[str, Any] = {
        "returncode": 0 if failed_batches == 0 else 1,
        "elapsed_sec": round(elapsed, 3),
        "mode": "fixed_shards",
        "target_timeout_sec": args.target_timeout_sec,
        "selected_targets": len(targets),
        "completed_targets": completed_targets,
        "completed_targets_durable": completed_targets_durable,
        "timed_out_targets": len(timed_out_ordinals),
        "timed_out_ordinals": timed_out_ordinals,
        "failed_batch_count": failed_batches,
        "shards": summaries,
        "finished_at": now_iso(),
    }

    try:
        merge_shard_run(args.work_dir)
        merge_returncode = 0
    except (OSError, sqlite3.DatabaseError, ValueError) as exc:
        print(f"merge failed: {exc}", file=sys.stderr)
        merge_returncode = 1
    final_summary["merge_returncode"] = merge_returncode
    final_summary["merged_db"] = str(
        args.work_dir / "merged/Database/BugInfo/TSBug.db"
    )
    if merge_returncode != 0:
        final_summary["returncode"] = 1

    atomic_write_json(args.work_dir / "summary.json", final_summary)
    print(json.dumps(final_summary, indent=2, sort_keys=True))
    return int(final_summary["returncode"])


def parse_scoped_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run typestate rules over their kernel/module scan scopes."
    )
    parser.add_argument("--rules-dir", required=True, type=Path)
    parser.add_argument("--scope-map", type=Path)
    parser.add_argument("--compile-db", required=True, type=Path)
    parser.add_argument("--typestate-bin", required=True, type=Path)
    parser.add_argument("--typatch-root", required=True, type=Path)
    parser.add_argument("--work-dir", required=True, type=Path)
    parser.add_argument("--source-name", default="")
    parser.add_argument("--shards", type=int, default=4)
    parser.add_argument("--jobs", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument(
        "--target-timeout-sec",
        type=float,
        default=0.0,
        help="per-target wall-clock budget; 0 disables the budget",
    )
    parser.add_argument("--no-resume", action="store_true")
    return parser.parse_args(argv)


def load_scope_map(path: Path | None) -> dict[str, Any]:
    return {} if path is None else json.loads(path.read_text())


def stage_group_rules(group: ScopeGroup, group_rules_dir: Path) -> None:
    group_rules_dir.mkdir(parents=True, exist_ok=True)
    for rule in group.rules:
        shutil.copy2(rule, group_rules_dir / rule.name)
        ir_sibling = rule.with_suffix(".ir.json")
        if ir_sibling.exists():
            shutil.copy2(ir_sibling, group_rules_dir / ir_sibling.name)


def write_ordinals_file(
    path: Path, target_ids: tuple[int, ...], id_to_ordinal: dict[int, int]
) -> int:
    ordinals = sorted(
        id_to_ordinal[row_id]
        for row_id in target_ids
        if row_id in id_to_ordinal
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(str(ordinal) for ordinal in ordinals) + "\n")
    return len(ordinals)


def run_scope_group(
    group: ScopeGroup,
    *,
    args: argparse.Namespace,
    id_to_ordinal: dict[int, int],
    total_targets: int,
) -> dict[str, Any]:
    group_dir = args.work_dir / "groups" / group.name
    group_rules_dir = group_dir / "rules"
    stage_group_rules(group, group_rules_dir)

    is_all_targets = len(group.target_ids) >= total_targets
    ordinals_path = group_dir / "target_ordinals.txt"
    target_count = write_ordinals_file(
        ordinals_path, group.target_ids, id_to_ordinal
    )
    group_shards = max(1, min(args.shards, target_count or 1))
    command = [
        sys.executable,
        "-m",
        "TyPatchLib.runtime.scan",
        "sharded",
        "--rules-dir",
        str(group_rules_dir),
        "--compile-db",
        str(args.compile_db),
        "--typestate-bin",
        str(args.typestate_bin),
        "--typatch-root",
        str(args.typatch_root),
        "--work-dir",
        str(group_dir),
        "--source-name",
        f"{args.source_name}:{group.name}".strip(":"),
        "--shards",
        str(group_shards),
        "--batch-size",
        str(args.batch_size),
        "--target-timeout-sec",
        str(args.target_timeout_sec),
    ]
    if args.jobs:
        command.extend(["--jobs", str(min(args.jobs, group_shards))])
    if not is_all_targets:
        command.extend(["--target-ordinals", str(ordinals_path)])
    if args.no_resume:
        command.append("--no-resume")

    started = time.monotonic()
    result = subprocess.run(command, check=False)
    group_db = group_dir / "merged/Database/BugInfo/TSBug.db"
    return {
        "group": group.name,
        "level": "kernel" if is_all_targets else "module",
        "rule_count": len(group.rules),
        "target_count": target_count,
        "returncode": result.returncode,
        "elapsed_sec": round(time.monotonic() - started, 3),
        "merged_db": str(group_db),
        "merged_db_exists": group_db.is_file(),
    }


def scoped_main(argv: Sequence[str] | None = None) -> int:
    args = parse_scoped_args(argv)
    args.rules_dir = args.rules_dir.resolve()
    args.compile_db = args.compile_db.resolve()
    args.typestate_bin = args.typestate_bin.resolve()
    args.typatch_root = args.typatch_root.resolve()
    args.work_dir = args.work_dir.resolve()
    if args.scope_map is not None:
        args.scope_map = args.scope_map.resolve()
    args.work_dir.mkdir(parents=True, exist_ok=True)

    rules = sorted(args.rules_dir.glob("*.ts"))
    if not rules:
        raise ValueError(f"no .ts rules under {args.rules_dir}")
    link_targets = read_link_targets(args.compile_db)
    if not link_targets:
        raise ValueError("compile.db has no link targets")
    id_to_ordinal = {target.row_id: target.ordinal for target in link_targets}
    groups = group_rules_by_scope(
        rules,
        load_scope_map(args.scope_map),
        link_targets,
    )

    plan_payload = {
        "rules_dir": str(args.rules_dir),
        "scope_map": str(args.scope_map) if args.scope_map else None,
        "compile_db": str(args.compile_db),
        "total_targets": len(link_targets),
        "group_count": len(groups),
        "groups": [
            {
                "name": group.name,
                "rule_count": len(group.rules),
                "target_count": len(group.target_ids),
            }
            for group in groups
        ],
        "started_at": now_iso(),
    }
    atomic_write_json(args.work_dir / "scope_plan.json", plan_payload)
    print(json.dumps(plan_payload, indent=2, sort_keys=True))

    started = time.monotonic()
    group_results = [
        run_scope_group(
            group,
            args=args,
            id_to_ordinal=id_to_ordinal,
            total_targets=len(link_targets),
        )
        for group in groups
    ]
    group_dbs = [
        Path(result["merged_db"])
        for result in group_results
        if result["merged_db_exists"]
    ]
    merged_db = args.work_dir / "merged/Database/BugInfo/TSBug.db"
    merge_summary: dict[str, Any] = {}
    if group_dbs:
        merge_summary = merge_databases(group_dbs, merged_db)

    failed = [result for result in group_results if result["returncode"] != 0]
    final = {
        "returncode": 0 if not failed else 1,
        "elapsed_sec": round(time.monotonic() - started, 3),
        "group_count": len(groups),
        "failed_group_count": len(failed),
        "groups": group_results,
        "merged_db": str(merged_db),
        "typestate_reports": merge_summary.get("typestate_reports", 0),
        "finished_at": now_iso(),
    }
    atomic_write_json(args.work_dir / "summary.json", final)
    print(json.dumps(final, indent=2, sort_keys=True))
    return int(final["returncode"])


def main(argv: Sequence[str] | None = None) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    if not arguments or arguments[0] not in {"scoped", "sharded"}:
        print(
            "usage: python -m TyPatchLib.runtime.scan {scoped|sharded} ...",
            file=sys.stderr,
        )
        return 2
    mode = arguments.pop(0)
    return scoped_main(arguments) if mode == "scoped" else sharded_main(arguments)


if __name__ == "__main__":
    raise SystemExit(main())
