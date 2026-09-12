#!/usr/bin/env python3
"""Run the TyPatch artifact from repair commits or frozen rule pools."""

from __future__ import annotations

import argparse
import os
import shlex
import subprocess
import sys
import time
from pathlib import Path
from typing import Sequence


REPO_ROOT = Path(__file__).resolve().parents[3]


def env_path(name: str, default: str) -> Path:
    return Path(os.environ.get(name, default))


def require_file(path: Path, label: str) -> Path:
    path = path.resolve()
    if not path.is_file():
        raise ValueError(f"missing {label}: {path}")
    return path


def require_dir(path: Path, label: str) -> Path:
    path = path.resolve()
    if not path.is_dir():
        raise ValueError(f"missing {label}: {path}")
    return path


def run_command(
    command: Sequence[str],
    *,
    dry_run: bool,
    accepted_codes: tuple[int, ...] = (0,),
) -> int:
    print("+ " + shlex.join(str(item) for item in command), flush=True)
    if dry_run:
        return 0
    completed = subprocess.run(command, cwd=REPO_ROOT, check=False)
    if completed.returncode not in accepted_codes:
        raise RuntimeError(
            f"command exited with {completed.returncode}: {shlex.join(command)}"
        )
    return completed.returncode


def default_compile_db(data_root: Path) -> Path:
    return data_root / "compile/Database/SourceInfo/compile.db"


def default_kernel_root(data_root: Path) -> Path:
    return data_root / "linux-v6.16"


def default_typestate_bin() -> Path:
    """Resolve the released backend without requiring C++ build sources.

    The public artifact ships a prebuilt backend under ``bin/typestate``.
    ``TYPATCH_TYPESTATE_BIN`` remains an escape hatch for platform-specific
    builds or a mounted binary in a container.
    """
    return env_path(
        "TYPATCH_TYPESTATE_BIN", str(REPO_ROOT / "bin/typestate")
    )


def resolve_scan_paths(args: argparse.Namespace) -> None:
    args.data_root = require_dir(
        env_path("TYPATCH_DATA", "/artifact/data"), "artifact data directory"
    )
    args.results_root = env_path("TYPATCH_RESULTS", "/artifact/results").resolve()
    args.results_root.mkdir(parents=True, exist_ok=True)
    args.compile_db = require_file(default_compile_db(args.data_root), "compile database")
    args.kernel_root = require_dir(default_kernel_root(args.data_root), "Linux v6.16 source tree")
    args.typestate_bin = require_file(default_typestate_bin(), "typestate backend")


def scan_command(
    *,
    args: argparse.Namespace,
    rules_dir: Path,
    scope_map: Path,
    work_dir: Path,
    source_name: str,
) -> list[str]:
    command = [
        sys.executable,
        "-m",
        "TyPatchLib.runtime.scan",
        "scoped",
        "--rules-dir",
        str(rules_dir),
        "--scope-map",
        str(scope_map),
        "--compile-db",
        str(args.compile_db),
        "--typestate-bin",
        str(args.typestate_bin),
        "--typatch-root",
        str(REPO_ROOT),
        "--work-dir",
        str(work_dir),
        "--source-name",
        source_name,
        "--shards",
        str(args.jobs),
        "--jobs",
        str(args.jobs),
        "--batch-size",
        "1",
        "--target-timeout-sec",
        "7200",
    ]
    if args.no_resume:
        command.append("--no-resume")
    return command


def discover_pools(data_root: Path, requested: list[str]) -> list[tuple[str, Path, Path]]:
    pools_root = data_root / "pools"
    if requested and requested != ["all"]:
        names = requested
    else:
        names = sorted(path.name for path in pools_root.iterdir() if path.is_dir())
    if not names:
        raise ValueError(f"no frozen rule pools under {pools_root}")

    pools: list[tuple[str, Path, Path]] = []
    for name in names:
        pool_dir = require_dir(pools_root / name, f"rule pool {name}")
        rules_dir = require_dir(pool_dir / "rules", f"rules for pool {name}")
        if not any(rules_dir.glob("*.ts")):
            raise ValueError(f"no .ts rules in {rules_dir}")
        scope_map = require_file(pool_dir / "scope_map.json", f"scope map for {name}")
        pools.append((name, rules_dir, scope_map))
    return pools


def evaluate(args: argparse.Namespace) -> int:
    resolve_scan_paths(args)
    pools = discover_pools(args.data_root, args.pool)
    run_name = args.run_name or time.strftime("evaluate-%Y%m%d-%H%M%S")
    run_root = args.results_root / run_name

    for name, rules_dir, scope_map in pools:
        print(f"\n=== Evaluating frozen pool: {name} ===", flush=True)
        run_command(
            scan_command(
                args=args,
                rules_dir=rules_dir,
                scope_map=scope_map,
                work_dir=run_root / name,
                source_name=f"artifact:evaluate:{name}",
            ),
            dry_run=args.dry_run,
        )
    return 0


def synthesis_input(args: argparse.Namespace, run_root: Path) -> Path:
    if args.rq1:
        return require_file(
            REPO_ROOT / "datasets/rq1_100/commits.txt", "RQ1 commit list"
        )
    input_dir = run_root / "input"
    input_dir.mkdir(parents=True, exist_ok=True)
    path = input_dir / "commits.txt"
    path.write_text(f"{args.commit},{args.label or 'artifact input'}\n")
    return path


def from_scratch(args: argparse.Namespace) -> int:
    resolve_scan_paths(args)
    run_name = args.run_name or time.strftime("from-scratch-%Y%m%d-%H%M%S")
    run_root = args.results_root / run_name
    repo = run_root / "repair-repo"
    repo.mkdir(parents=True, exist_ok=True)
    run_command(["git", "init", "--quiet", str(repo)], dry_run=args.dry_run)
    rules_dir = run_root / "rules"
    reports_dir = run_root / "synthesis-reports"
    rules_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)
    commits = synthesis_input(args, run_root)

    synth = [
        sys.executable,
        "-m",
        "TyPatchLib.runtime.synthesis",
        "--commits",
        str(commits),
        "--repo",
        str(repo),
        "--out-dir",
        str(rules_dir),
        "--report-dir",
        str(reports_dir),
        "--typatch-root",
        str(REPO_ROOT),
        "--run-dir",
        str(run_root / "synthesis-runner"),
        "--kernel-source",
        str(args.kernel_root),
        "--commit-timeout-sec",
        str(args.synthesis_timeout_sec),
    ]
    if args.limit is not None:
        synth.extend(["--limit", str(args.limit)])
    print("\n=== Synthesizing rules from repair commits ===", flush=True)
    run_command(synth, dry_run=args.dry_run, accepted_codes=(0, 1))
    if not args.dry_run and not any(rules_dir.glob("*.ts")):
        raise ValueError("synthesis produced no executable .ts rules")

    scope_map = run_root / "scope_map.json"
    classifier = [
        sys.executable,
        "-m",
        "TyPatchLib.runtime.scope",
        "--rules-dir",
        str(rules_dir),
        "--compile-db",
        str(args.compile_db),
        "--kernel-root",
        str(args.kernel_root),
        "--out",
        str(scope_map),
        "--enable-llm",
    ]
    print("\n=== Deriving and widening scan scope ===", flush=True)
    run_command(classifier, dry_run=args.dry_run)

    print("\n=== Scanning generated rules ===", flush=True)
    run_command(
        scan_command(
            args=args,
            rules_dir=rules_dir,
            scope_map=scope_map,
            work_dir=run_root / "scan",
            source_name="artifact:from-scratch",
        ),
        dry_run=args.dry_run,
    )
    return 0


def add_runtime_paths(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--jobs", type=int, default=8)
    parser.add_argument("--run-name")
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--dry-run", action="store_true")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="mode", required=True)

    evaluate_parser = subparsers.add_parser(
        "evaluate", help="scan the frozen paper rule pools"
    )
    add_runtime_paths(evaluate_parser)
    evaluate_parser.add_argument(
        "--pool",
        action="append",
        default=[],
        help="pool directory name under artifact data; default: all pools",
    )
    evaluate_parser.set_defaults(handler=evaluate)

    scratch_parser = subparsers.add_parser(
        "from-scratch",
        help="synthesize rules from repair commits, derive scope, and scan",
    )
    add_runtime_paths(scratch_parser)
    inputs = scratch_parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--commit")
    inputs.add_argument("--rq1", action="store_true", help="synthesize the bundled 100 commits")
    scratch_parser.add_argument("--label")
    scratch_parser.add_argument("--limit", type=int)
    scratch_parser.add_argument("--synthesis-timeout-sec", type=int, default=3600)
    scratch_parser.set_defaults(handler=from_scratch)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    if args.jobs < 1:
        parser.error("--jobs must be at least 1")
    if getattr(args, "synthesis_timeout_sec", 1) <= 0:
        parser.error("--synthesis-timeout-sec must be positive")
    try:
        return args.handler(args)
    except (OSError, RuntimeError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
