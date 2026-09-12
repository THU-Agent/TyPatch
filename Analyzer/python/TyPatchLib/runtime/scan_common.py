#!/usr/bin/env python3
"""Shared helpers for resumable/sharded typestate scans."""

from __future__ import annotations

import hashlib
import json
import os
import shlex
import shutil
import sqlite3
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence

@dataclass(frozen=True)
class LinkTarget:
    row_id: int
    ordinal: int
    target_file: str
    link_list: str
    ir_list: str
    target_hash: str
    estimated_cost: int

    def to_json(self) -> dict[str, Any]:
        return asdict(self)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_obj:
        for chunk in iter(lambda: file_obj.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sanitize_ident(text: str) -> str:
    return "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in text)


def atomic_write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(path.suffix + ".tmp")
    temp_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    temp_path.replace(path)


def append_jsonl(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a") as file_obj:
        file_obj.write(json.dumps(payload, sort_keys=True) + "\n")


def prepare_rules(
    rules_dir: Path,
    work_dir: Path,
) -> tuple[Path, list[dict[str, str]], str]:
    """Normalize rule keys and create one backend manifest."""

    normalized_dir = work_dir / "rules_normalized"
    original_dir = work_dir / "rules_original"
    normalized_dir.mkdir(parents=True, exist_ok=True)
    original_dir.mkdir(parents=True, exist_ok=True)

    rows: list[dict[str, str]] = []
    manifest_lines: list[str] = []
    normalized_hashes: list[str] = []
    rule_paths = sorted(rules_dir.glob("*.ts"))
    if not rule_paths:
        raise ValueError(f"no .ts rules found in {rules_dir}")

    for index, rule_path in enumerate(rule_paths, start=1):
        raw_text = rule_path.read_text()
        rule = json.loads(raw_text)
        original_sha256 = sha256_text(raw_text)

        bug = rule.get("bug")
        if not isinstance(bug, dict):
            raise ValueError(f"{rule_path}: missing bug object")
        original_key = str(bug.get("key", ""))
        unique_key = sanitize_ident(
            f"{index:04d}_{rule_path.stem}__{original_key}"
        )
        bug["key"] = unique_key

        analysis = rule.setdefault("analysis", {})
        if not isinstance(analysis, dict):
            raise ValueError(f"{rule_path}: analysis must be an object")
        has_explicit_start_policy = (
            "start_policy" in rule or "start_policy" in analysis
        )
        has_explicit_source_actions = (
            "source_actions" in rule or "source_actions" in analysis
        )
        has_track_objects = (
            "track_objects" in rule or "track_objects" in analysis
        )
        key_actions = bug.get("key_actions")
        initial_state = str(
            analysis.get("initial_state", rule.get("initial_state", "Init"))
        )
        transitions = rule.get("transition")
        bug_state = bug.get("bug_state")
        context = rule.get("context")
        context_start_actions: list[str] = []
        if isinstance(context, dict) and isinstance(context.get("start_action"), list):
            context_start_actions = [
                action for action in context["start_action"]
                if isinstance(action, str) and action
            ]
        source_action_changes_untracked = False
        first_key_action_is_direct_bug = False
        non_source_actions_are_untracked_noops = True
        if (
            isinstance(key_actions, list)
            and key_actions
            and isinstance(key_actions[0], str)
            and isinstance(bug_state, str)
            and isinstance(transitions, list)
        ):
            neutral_states = {initial_state, "Any"}
            for transition in transitions:
                if not isinstance(transition, dict):
                    continue
                action = transition.get("action")
                curr_state = transition.get("curr_state")
                next_state = transition.get("next_state")
                if curr_state not in neutral_states:
                    continue
                if not isinstance(action, str) or not isinstance(next_state, str):
                    continue
                if (
                    action == key_actions[0]
                    and next_state == bug_state
                ):
                    first_key_action_is_direct_bug = True
                    break
                if action == key_actions[0]:
                    if next_state not in neutral_states:
                        source_action_changes_untracked = True
                elif next_state not in neutral_states:
                    non_source_actions_are_untracked_noops = False
        if (
            not has_explicit_start_policy
            and not has_explicit_source_actions
            and isinstance(key_actions, list)
            and len(key_actions) > 1
            and isinstance(key_actions[0], str)
            and key_actions[0]
            and source_action_changes_untracked
            and non_source_actions_are_untracked_noops
            and not first_key_action_is_direct_bug
        ):
            analysis["start_policy"] = "on_source_action"
            analysis["source_actions"] = [key_actions[0]]
        if (
            not has_explicit_start_policy
            and not has_track_objects
            and isinstance(key_actions, list)
            and len(key_actions) == 1
            and isinstance(key_actions[0], str)
            and key_actions[0]
            and initial_state != "Init"
            and first_key_action_is_direct_bug
        ):
            analysis["start_policy"] = "on_source_action"
            if not has_explicit_source_actions and context_start_actions:
                analysis["source_actions"] = context_start_actions

        normalized_text = json.dumps(rule, indent=2, sort_keys=True) + "\n"
        normalized_path = normalized_dir / rule_path.name
        normalized_path.write_text(normalized_text)
        shutil.copy2(rule_path, original_dir / rule_path.name)
        manifest_lines.append(str(normalized_path.resolve()))
        normalized_hashes.append(sha256_text(normalized_text))
        rows.append(
            {
                "index": str(index),
                "rule_id": rule_path.stem,
                "original_key": original_key,
                "unique_key": unique_key,
                "original_rule": str(rule_path.resolve()),
                "normalized_rule": str(normalized_path.resolve()),
                "original_sha256": original_sha256,
                "normalized_sha256": normalized_hashes[-1],
            }
        )

    manifest = work_dir / "rules.manifest"
    manifest.write_text("\n".join(manifest_lines) + "\n")
    table_map = work_dir / "table_map.tsv"
    fields = (
        "index",
        "rule_id",
        "original_key",
        "unique_key",
        "original_sha256",
        "normalized_sha256",
        "original_rule",
        "normalized_rule",
    )
    table_map.write_text(
        "\t".join(fields)
        + "\n"
        + "".join(
            "\t".join(row[field] for field in fields) + "\n"
            for row in rows
        )
    )
    manifest_hash = sha256_text("\n".join(normalized_hashes))
    return manifest, rows, manifest_hash


def _estimate_target_cost(ir_list: str) -> int:
    total = 0
    try:
        paths = shlex.split(ir_list)
    except ValueError:
        paths = ir_list.split()
    for raw_path in paths:
        path = Path(raw_path)
        try:
            total += max(path.stat().st_size, 1)
        except OSError:
            total += max(len(raw_path), 1) * 1024
    return max(total, 1)


def read_link_targets(compile_db: Path) -> list[LinkTarget]:
    uri = f"file:{compile_db}?mode=ro&immutable=1"
    with sqlite3.connect(uri, uri=True) as connection:
        rows = connection.execute(
            "select id, target_file, link_list, ir_list from link order by id"
        ).fetchall()
    targets: list[LinkTarget] = []
    for ordinal, row in enumerate(rows, start=1):
        row_id, target_file, link_list, ir_list = row
        target_file = str(target_file or "")
        link_list = str(link_list or "")
        ir_list = str(ir_list or "")
        target_hash = sha256_text(
            f"{row_id}\0{target_file}\0{link_list}\0{ir_list}"
        )
        targets.append(
            LinkTarget(
                row_id=int(row_id),
                ordinal=ordinal,
                target_file=target_file,
                link_list=link_list,
                ir_list=ir_list,
                target_hash=target_hash,
                estimated_cost=_estimate_target_cost(ir_list),
            )
        )
    return targets


def select_targets(
    targets: Sequence[LinkTarget],
    *,
    ordinal_file: Path | None = None,
) -> list[LinkTarget]:
    selected = list(targets)
    if ordinal_file is not None:
        wanted: set[int] = set()
        for raw_line in ordinal_file.read_text().splitlines():
            line = raw_line.split("#", 1)[0].strip()
            if line:
                wanted.add(int(line))
        selected = [
            target for target in selected if target.ordinal in wanted
        ]
        missing = wanted - {target.ordinal for target in selected}
        if missing:
            raise ValueError(f"target ordinals not found: {sorted(missing)}")
    return selected


def partition_targets_lpt(
    targets: Sequence[LinkTarget],
    shard_count: int,
) -> list[list[LinkTarget]]:
    if shard_count <= 0:
        raise ValueError("shard_count must be positive")
    shards: list[list[LinkTarget]] = [[] for _ in range(shard_count)]
    loads = [0] * shard_count
    for target in sorted(
        targets, key=lambda item: (-item.estimated_cost, item.ordinal)
    ):
        shard_index = min(
            range(shard_count), key=lambda index: (loads[index], index)
        )
        shards[shard_index].append(target)
        loads[shard_index] += target.estimated_cost
    for shard in shards:
        shard.sort(key=lambda item: item.ordinal)
    return shards


def write_filtered_compile_db(
    source_db: Path,
    destination_db: Path,
    target_ids: Iterable[int],
) -> None:
    target_ids = list(target_ids)
    if not target_ids:
        raise ValueError("cannot write a compile DB with no targets")
    destination_db.parent.mkdir(parents=True, exist_ok=True)
    for suffix in ("", "-wal", "-shm"):
        path = Path(str(destination_db) + suffix)
        if path.exists():
            path.unlink()
    source_uri = f"file:{source_db}?mode=ro&immutable=1"
    with sqlite3.connect(source_uri, uri=True) as source:
        with sqlite3.connect(destination_db) as destination:
            source.backup(destination)
            placeholders = ",".join("?" for _ in target_ids)
            destination.execute(
                f"delete from link where id not in ({placeholders})",
                target_ids,
            )
            destination.commit()


@dataclass(frozen=True)
class ScopeGroup:
    """A set of rules to scan against a specific subset of link targets."""
    name: str
    rules: tuple[Path, ...]
    target_ids: tuple[int, ...]


def _rule_hash_from_path(rule_path: Path) -> str:
    name = rule_path.name
    return name[: -len(".ts")] if name.endswith(".ts") else rule_path.stem


def group_rules_by_scope(
    rules: Sequence[Path],
    scope_map: dict[str, Any],
    link_targets: Sequence[LinkTarget],
) -> list[ScopeGroup]:
    """Partition rules into scan groups by their applicability scope.

    The scope classifier keys rule hashes to
    {"level": "kernel"|"module", "anchor_targets": [<built-in.a path>, ...], ...}.
    Scope is stored as target_file PATHS (stable across compile.dbs); we resolve
    them to row ids in THIS scan's link table.

    Grouping:
      * kernel-level (or unlisted) rules -> one group over ALL targets (default,
        preserves today's behavior).
      * module-level rules sharing the same resolved target set -> one group each.

    Fail-open: a module rule whose scoped targets are absent from this scan's
    compile.db is NOT dropped -- it is folded into the kernel (all-targets)
    group, so scoping never silently reduces recall.
    """
    tf_to_id = {t.target_file: t.row_id for t in link_targets}
    all_ids = tuple(sorted(t.row_id for t in link_targets))

    kernel_rules: list[Path] = []
    module_buckets: dict[frozenset[int], list[Path]] = {}

    for rule in rules:
        entry = scope_map.get(_rule_hash_from_path(rule))
        if not entry or entry.get("level") != "module":
            kernel_rules.append(rule)
            continue
        target_files = entry.get("anchor_targets") or []
        # Fail-open unless EVERY scoped target resolves in this scan db. A
        # partial resolve would scan the rule over a strict subset of its
        # anchor floor -- silently dropping recall in the missing targets --
        # so any absent target folds the whole rule into the kernel group.
        if not target_files or any(tf not in tf_to_id for tf in target_files):
            kernel_rules.append(rule)
            continue
        ids = frozenset(tf_to_id[tf] for tf in target_files)
        module_buckets.setdefault(ids, []).append(rule)

    groups: list[ScopeGroup] = []
    if kernel_rules:
        groups.append(
            ScopeGroup("kernel", tuple(kernel_rules), all_ids)
        )
    for index, (ids, bucket_rules) in enumerate(
        sorted(module_buckets.items(), key=lambda kv: sorted(kv[0]))
    ):
        groups.append(
            ScopeGroup(
                f"module_{index}",
                tuple(bucket_rules),
                tuple(sorted(ids)),
            )
        )
    return groups


def read_table_counts(db_path: Path) -> list[tuple[str, int]]:
    if not db_path.exists():
        return []
    rows: list[tuple[str, int]] = []
    uri = f"file:{db_path}?mode=ro"
    with sqlite3.connect(uri, uri=True) as connection:
        tables = connection.execute(
            "select name from sqlite_master where type='table' "
            "and name not like 'sqlite_%' order by name"
        ).fetchall()
        for (table,) in tables:
            quoted = str(table).replace('"', '""')
            count = connection.execute(
                f'select count(*) from "{quoted}"'
            ).fetchone()[0]
            rows.append((str(table), int(count)))
    return rows


def write_counts(path: Path, counts: Sequence[tuple[str, int]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "table\tcount\n"
        + "".join(f"{table}\t{count}\n" for table, count in counts)
    )


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def build_scan_environment(
    *,
    typatch_root: Path,
    analysis_root: Path,
) -> dict[str, str]:
    env = os.environ.copy()
    env["TYPATCH_ROOT"] = str(typatch_root)
    env["TYPATCH_WORK_ROOT"] = str(analysis_root)
    return env
