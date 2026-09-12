#!/usr/bin/env python3
"""Deduplicate source/sink reports across generated rules.

The input may contain one row per source/sink occurrence or one row per root
with ``sink_sites_json``. Multiple sinks attached to one root remain members of
that root. Within each model pool, roots at the same source are merged when
rules share at least one sink; this relation is transitively closed. A second
pass joins true-positive components across model pools by the same source/sink
connectivity to produce distinct bugs.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


Site = tuple[str, str, str]


def stable_id(parts: Iterable[str]) -> str:
    return hashlib.sha256("\0".join(parts).encode("utf-8")).hexdigest()[:20]


def normalize_site(file_name: str, function: str, line: str) -> Site:
    file_name = file_name.strip().replace("\\", "/")
    function = function.strip()
    line = line.strip()
    if not file_name or not function or not line:
        raise ValueError(f"incomplete source/sink site: {(file_name, function, line)}")
    if int(line) < 1:
        raise ValueError(f"invalid source/sink line: {line}")
    return file_name, function, line


def parse_sink_sites(row: dict[str, str]) -> set[Site]:
    encoded = (row.get("sink_sites_json") or "").strip()
    if encoded:
        payload = json.loads(encoded)
        return {normalize_site(str(site[0]), str(site[1]), str(site[2])) for site in payload}
    return {
        normalize_site(
            row.get("sink_file", ""),
            row.get("sink_function", ""),
            row.get("sink_line", ""),
        )
    }


@dataclass
class Root:
    model: str
    root_id: str
    rule_id: str
    source: Site
    sinks: set[Site] = field(default_factory=set)
    verdict: str = "FP"
    family: str = ""


class UnionFind:
    def __init__(self, items: Iterable[str]):
        self.parent = {item: item for item in items}

    def find(self, item: str) -> str:
        while self.parent[item] != item:
            self.parent[item] = self.parent[self.parent[item]]
            item = self.parent[item]
        return item

    def union(self, left: str, right: str) -> None:
        left_root, right_root = self.find(left), self.find(right)
        if left_root != right_root:
            self.parent[right_root] = left_root


def read_roots(path: Path) -> list[Root]:
    with path.open(newline="", encoding="utf-8") as stream:
        rows = list(csv.DictReader(stream))
    required = {
        "model",
        "root_id",
        "rule_id",
        "source_file",
        "source_function",
        "source_line",
    }
    missing = required - set(rows[0] if rows else {})
    if missing:
        raise ValueError(f"input is missing columns: {sorted(missing)}")

    grouped: dict[tuple[str, str], Root] = {}
    for row in rows:
        model = row["model"].strip()
        root_id = row["root_id"].strip()
        rule_id = row["rule_id"].strip()
        if not model or not root_id or not rule_id:
            raise ValueError("model, root_id, and rule_id must be non-empty")
        source = normalize_site(
            row["source_file"], row["source_function"], row["source_line"]
        )
        verdict = (row.get("verdict") or "FP").strip().upper()
        if verdict not in {"TP", "FP"}:
            raise ValueError(f"unsupported verdict {verdict!r}")
        family = (row.get("family") or "").strip()
        key = model, root_id
        root = grouped.get(key)
        if root is None:
            root = Root(model, root_id, rule_id, source, verdict=verdict, family=family)
            grouped[key] = root
        elif (root.rule_id, root.source, root.verdict, root.family) != (
            rule_id,
            source,
            verdict,
            family,
        ):
            raise ValueError(f"inconsistent rows for root {model}/{root_id}")
        root.sinks.update(parse_sink_sites(row))
    return sorted(grouped.values(), key=lambda root: (root.model, root.root_id))


def group_within_models(roots: list[Root]) -> list[dict[str, object]]:
    output: list[dict[str, object]] = []
    roots_by_model: dict[str, list[Root]] = defaultdict(list)
    for root in roots:
        roots_by_model[root.model].append(root)

    for model, model_roots in sorted(roots_by_model.items()):
        root_map = {root.root_id: root for root in model_roots}
        union_find = UnionFind(root_map)
        by_source: dict[Site, list[Root]] = defaultdict(list)
        for root in model_roots:
            by_source[root.source].append(root)

        for source_roots in by_source.values():
            by_sink: dict[Site, list[Root]] = defaultdict(list)
            for root in source_roots:
                for sink in root.sinks:
                    by_sink[sink].append(root)
            for sink_roots in by_sink.values():
                if len({root.rule_id for root in sink_roots}) < 2:
                    continue
                anchor = sink_roots[0].root_id
                for root in sink_roots[1:]:
                    union_find.union(anchor, root.root_id)

        groups: dict[str, list[Root]] = defaultdict(list)
        for root in model_roots:
            groups[union_find.find(root.root_id)].append(root)

        for members in groups.values():
            source = members[0].source
            if any(member.source != source for member in members):
                raise RuntimeError("deduplication merged different source sites")
            sinks = sorted(set().union(*(member.sinks for member in members)))
            rules = sorted({member.rule_id for member in members})
            families = sorted({member.family for member in members if member.family})
            verdict = "TP" if any(member.verdict == "TP" for member in members) else "FP"
            component_id = stable_id(
                (model, *source, *("|".join(sink) for sink in sinks))
            )
            output.append(
                {
                    "model": model,
                    "component_id": component_id,
                    "source_file": source[0],
                    "source_function": source[1],
                    "source_line": source[2],
                    "sink_sites_json": json.dumps(sinks, separators=(",", ":")),
                    "root_ids": ";".join(sorted(member.root_id for member in members)),
                    "rule_ids": ";".join(rules),
                    "root_count": len(members),
                    "rule_count": len(rules),
                    "verdict": verdict,
                    "family": families[0] if len(families) == 1 else ";".join(families),
                }
            )
    return sorted(
        output,
        key=lambda row: (
            str(row["model"]),
            str(row["source_file"]),
            str(row["source_function"]),
            int(str(row["source_line"])),
            str(row["component_id"]),
        ),
    )


def build_distinct_bug_union(components: list[dict[str, object]]) -> list[dict[str, object]]:
    tp_components = [row for row in components if row["verdict"] == "TP"]
    component_map = {str(row["component_id"]): row for row in tp_components}
    union_find = UnionFind(component_map)
    by_source_sink: dict[tuple[Site, Site], list[str]] = defaultdict(list)
    for row in tp_components:
        source = normalize_site(
            str(row["source_file"]),
            str(row["source_function"]),
            str(row["source_line"]),
        )
        for sink in json.loads(str(row["sink_sites_json"])):
            sink_site = normalize_site(str(sink[0]), str(sink[1]), str(sink[2]))
            by_source_sink[(source, sink_site)].append(str(row["component_id"]))
    for members in by_source_sink.values():
        for component_id in members[1:]:
            union_find.union(members[0], component_id)

    groups: dict[str, list[dict[str, object]]] = defaultdict(list)
    for component_id, row in component_map.items():
        groups[union_find.find(component_id)].append(row)

    bugs: list[dict[str, object]] = []
    for members in groups.values():
        source = normalize_site(
            str(members[0]["source_file"]),
            str(members[0]["source_function"]),
            str(members[0]["source_line"]),
        )
        if any(
            normalize_site(
                str(member["source_file"]),
                str(member["source_function"]),
                str(member["source_line"]),
            )
            != source
            for member in members
        ):
            raise RuntimeError("cross-model union merged different source sites")
        sinks = sorted(
            {
                normalize_site(str(sink[0]), str(sink[1]), str(sink[2]))
                for member in members
                for sink in json.loads(str(member["sink_sites_json"]))
            }
        )
        models = sorted({str(member["model"]) for member in members})
        global_id = stable_id((*source, *("|".join(sink) for sink in sinks)))
        bugs.append(
            {
                "global_bug_id": global_id,
                "models": ";".join(models),
                "source_file": source[0],
                "source_function": source[1],
                "source_line": source[2],
                "sink_sites_json": json.dumps(sinks, separators=(",", ":")),
                "component_ids": ";".join(
                    sorted(str(member["component_id"]) for member in members)
                ),
            }
        )
    return sorted(bugs, key=lambda row: str(row["global_bug_id"]))


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    with path.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="normalized source/root CSV")
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    roots = read_roots(args.input)
    components = group_within_models(roots)
    bugs = build_distinct_bug_union(components)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    component_fields = [
        "model",
        "component_id",
        "source_file",
        "source_function",
        "source_line",
        "sink_sites_json",
        "root_ids",
        "rule_ids",
        "root_count",
        "rule_count",
        "verdict",
        "family",
    ]
    bug_fields = [
        "global_bug_id",
        "models",
        "source_file",
        "source_function",
        "source_line",
        "sink_sites_json",
        "component_ids",
    ]
    write_csv(args.output_dir / "components.csv", components, component_fields)
    write_csv(args.output_dir / "distinct_bugs.csv", bugs, bug_fields)

    model_counts = Counter(str(row["model"]) for row in components)
    summary = {
        "input_roots": len(roots),
        "components": len(components),
        "true_positive_components": sum(row["verdict"] == "TP" for row in components),
        "distinct_bugs": len(bugs),
        "components_by_model": dict(sorted(model_counts.items())),
    }
    (args.output_dir / "summary.json").write_text(
        json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
