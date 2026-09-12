#!/usr/bin/env python3
"""Classify each synthesized TypeState rule's applicability scope.

Produces a scope_map.json assigning every rule a scope level:
  * "kernel"  -> scan against every link target (default / fail-open)
  * "module"  -> scan only the built-in.a link targets the rule can possibly fire in

Safety model: use the provenance/anchor set as a floor, allow the LLM only to
widen it, and fail open to kernel scope on any doubt.

This module implements the DETERMINISTIC core:
  1. Extract each rule's concrete "anchor" functions from its .ts / .ir.json.
  2. Map each concrete anchor to the set of link targets whose source files
     mention it (a safe superset of where the rule can match).
  3. Rare anchors (present in <= RARE_MAX targets) => module scope with a floor =
     union of those anchors' target sets. Otherwise => kernel scope.

The LLM widen-only adjudicator is layered on top (--enable-llm); it may only ADD
targets to the deterministic floor, never remove them, and fails open to kernel.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from .scan_common import read_link_targets

# Ubiquitous allocator/free helpers: a rule using only these is a generic
# pattern (missing NULL check, double free of a generic object) that can fire
# anywhere -> never narrow below kernel scope.
GENERIC_ALLOC_FREE = {
    "__kmalloc", "kmalloc", "kzalloc", "kcalloc", "kmalloc_array",
    "kvmalloc", "kvzalloc", "kvcalloc", "kmalloc_node", "kzalloc_node",
    "krealloc", "kstrdup", "kstrndup", "kmemdup", "kmemdup_nul",
    "devm_kmalloc", "devm_kzalloc", "devm_kcalloc", "devm_kmalloc_array",
    "devm_kasprintf", "devm_kmemdup", "devm_kstrdup", "devm_kvasprintf",
    "kmem_cache_alloc", "kmem_cache_zalloc", "vmalloc", "vzalloc",
    "kfree", "kvfree", "kfree_const", "kfree_sensitive", "kvfree_sensitive",
    "vfree", "kmem_cache_free",
    # More kernel-generic frees: usable in any subsystem, so a rule keyed only
    # on one of these can fire kernel-wide and must never be a narrowing signal.
    "devm_kfree", "kfree_rcu", "kvfree_rcu", "kvfree_atomic",
    "kmem_cache_free_bulk",
    "dma_free_coherent", "dmam_free_coherent", "dma_free_attrs",
    "dma_free_noncoherent", "dma_pool_free",
    "pci_free_consistent", "pci_pool_free",
    "free_pages", "free_page", "__free_pages", "free_percpu",
    "usb_free_urb",
}

# Extremely common infrastructure helpers that appear in hundreds of targets;
# treating them as discriminating anchors would wrongly narrow generic rules.
# They still count toward "the rule matched", but are never used as the rare
# narrowing signal.
COMMON_INFRA = {
    "memset", "memcpy", "memmove", "strscpy", "snprintf", "sprintf",
    "free_netdev", "alloc_etherdev", "alloc_etherdev_mqs",
    "platform_get_drvdata", "platform_set_drvdata",
    "dev_get_drvdata", "dev_set_drvdata",
    "pci_get_drvdata", "pci_set_drvdata",
    "nla_put", "nla_put_u32", "nla_nest_start",
    "of_node_put", "put_device", "kobject_put",
}

# A concrete anchor is "rare" (thus a valid narrowing signal) when it appears in
# at most this many link targets across the kernel.
DEFAULT_RARE_MAX = 12

_SCOPE_SYSTEM_PROMPT = (
    "You are a Linux-kernel static-analysis scope adjudicator. Given a bug rule "
    "and the set of kernel modules where its distinctive functions appear, "
    "decide whether restricting the scan to those modules is SAFE (the rule "
    "literally cannot fire elsewhere) or whether the pattern generalizes and "
    "the scan must be widened. You may only WIDEN or KEEP scope, never narrow "
    "it. When unsure, widen. Missing a real bug by over-narrowing is "
    "unacceptable; scanning a few extra modules is fine."
)

_SCOPE_USER_TEMPLATE = """Bug rule: {bug_name}
Distinctive (rare) anchor functions the rule matches on: {rare_anchors}
All matched functions: {all_anchors}
Current deterministic module floor (modules where the rare anchors textually appear):
{modules}

Question: Can the scan for this rule be safely restricted to these modules?

- If the rare anchor functions are REQUIRED for the rule to fire (the bug is
  specific to this driver/subsystem API), answer "keep".
- If the SAME bug pattern plausibly occurs in sibling modules via similar APIs,
  answer "widen_prefix" and give directory prefixes (e.g. "drivers/net/") to add.
- If this is a generic pattern that can occur anywhere in the kernel, answer
  "widen_kernel".

Return ONLY a JSON object:
{{"decision": "keep|widen_prefix|widen_kernel", "prefixes": ["drivers/xxx/"...], "reason": "..."}}
"""

_SCOPE_SCHEMA = {
    "type": "object",
    "properties": {
        "decision": {
            "type": "string",
            "enum": ["keep", "widen_prefix", "widen_kernel"],
        },
        "prefixes": {"type": "array", "items": {"type": "string"}},
        "reason": {"type": "string"},
    },
    "required": ["decision"],
}


def _load_scope_llm():
    from TyPatchLib.Synthesizer.llm_client import (
        AnthropicMessagesLLM,
        OpenAILLM,
    )

    provider = os.environ.get("TYPATCH_LLM_PROVIDER", "openai").strip().lower()
    if provider == "anthropic":
        return AnthropicMessagesLLM.from_env()
    if provider == "openai":
        return OpenAILLM.from_env()
    raise ValueError("TYPATCH_LLM_PROVIDER must be 'openai' or 'anthropic'")


def _module_dirs(target_files: list[str]) -> list[str]:
    directories: list[str] = []
    for target_file in target_files:
        relative = target_file
        if "/linux-" in target_file:
            index = target_file.index("/", target_file.index("/linux-") + 1)
            relative = target_file[index + 1 :]
        directories.append(relative.removesuffix("/built-in.a"))
    return sorted(set(directories))


def widen_scope_map(scope_map: dict, link_targets: list) -> dict:
    """Widen deterministic module floors; any uncertainty becomes kernel scope."""

    try:
        llm = _load_scope_llm()
    except Exception as exc:
        print(
            f"[scope-llm] no LLM client ({exc}); failing open to kernel scope",
            file=sys.stderr,
        )
        for entry in scope_map.values():
            if entry.get("level") == "module":
                entry["level"] = "kernel"
                entry["source"] = "fail-open-kernel"
                entry["anchor_target_ids"] = []
                entry["anchor_targets"] = []
                entry["llm_verdict"] = {
                    "error": f"no LLM client: {str(exc)[:160]}"
                }
        return scope_map

    all_targets = [(target.target_file, target.row_id) for target in link_targets]
    for entry in scope_map.values():
        if entry.get("level") != "module":
            continue
        user = _SCOPE_USER_TEMPLATE.format(
            bug_name=entry.get("bug_name", ""),
            rare_anchors=", ".join(entry.get("rare_anchors", [])),
            all_anchors=", ".join(entry.get("concrete_anchors", [])),
            modules="\n".join(
                f"  - {module}"
                for module in _module_dirs(entry.get("anchor_targets", []))
            )
            or "  (none)",
        )
        messages = [
            {"role": "system", "content": _SCOPE_SYSTEM_PROMPT},
            {"role": "user", "content": user},
        ]
        try:
            raw = llm.complete_json(messages, _SCOPE_SCHEMA)
            if not isinstance(raw, dict) or raw.get("decision") not in {
                "keep",
                "widen_prefix",
                "widen_kernel",
            }:
                raise ValueError(f"bad shape: {raw!r:.200}")
        except Exception as exc:
            entry["level"] = "kernel"
            entry["source"] = "fail-open-kernel"
            entry["anchor_target_ids"] = []
            entry["anchor_targets"] = []
            entry["llm_verdict"] = {"error": str(exc)[:200]}
            continue

        decision = raw["decision"]
        raw_prefixes = raw.get("prefixes")
        prefixes = raw_prefixes if isinstance(raw_prefixes, list) else []
        raw_reason = raw.get("reason")
        reason = raw_reason if isinstance(raw_reason, str) else ""
        entry["llm_verdict"] = {
            "decision": decision,
            "prefixes": prefixes,
            "reason": reason[:400],
        }
        if decision == "widen_kernel":
            entry["level"] = "kernel"
            entry["source"] = "llm-widened"
            entry["anchor_target_ids"] = []
            entry["anchor_targets"] = []
            continue
        if decision != "widen_prefix":
            continue

        prefixes = [prefix for prefix in prefixes if isinstance(prefix, str) and prefix]
        if not prefixes:
            entry["level"] = "kernel"
            entry["source"] = "fail-open-kernel"
            entry["anchor_target_ids"] = []
            entry["anchor_targets"] = []
            entry["llm_verdict"]["error"] = "widen_prefix with empty prefixes"
            continue

        added_ids = set(entry.get("anchor_target_ids", []))
        added_files = set(entry.get("anchor_targets", []))
        for target_file, row_id in all_targets:
            relative = target_file
            if "/linux-" in target_file:
                index = target_file.index("/", target_file.index("/linux-") + 1)
                relative = target_file[index + 1 :]
            if any(relative.startswith(prefix.lstrip("/")) for prefix in prefixes):
                added_ids.add(row_id)
                added_files.add(target_file)
        entry["anchor_target_ids"] = sorted(added_ids)
        entry["anchor_targets"] = sorted(added_files)
        entry["source"] = "llm-widened"
    return scope_map

def rule_hash(ts_path: Path) -> str:
    return ts_path.name[: -len(".ts")] if ts_path.name.endswith(".ts") else ts_path.stem


def _collect_funcs_from_events(events: list) -> tuple[set[str], set[str]]:
    """Return (all_funcs, discriminating_funcs).

    discriminating_funcs = every function the rule can MATCH ON in a
    source/sink role or Call/Free/Ret/CallFree kind. Within one event the
    listed ``funcs`` and each binding's ``func`` are OR alternatives (the
    backend fires on any one of them), so we keep ALL of them -- including
    generic allocator/infra helpers -- because a single generic alternative
    lets the rule fire kernel-wide and must therefore veto any narrowing.

    Only a binding's ``func`` key is a callee. Other binding fields (``arg``
    indices, ``*_field`` names, etc.) are metadata and must never be treated as
    anchor functions, or a field spelling could masquerade as a narrowing
    signal.
    """
    all_funcs: set[str] = set()
    discriminating: set[str] = set()
    for ev in events or []:
        if not isinstance(ev, dict):
            continue
        funcs = {f for f in (ev.get("funcs") or []) if isinstance(f, str) and f}
        for b in ev.get("bindings") or []:
            if isinstance(b, dict):
                fn = b.get("func")
                if isinstance(fn, str) and fn:
                    funcs.add(fn)
        all_funcs |= funcs
        role = ev.get("role")
        kind = ev.get("kind")
        if role in {"source", "sink"} or kind in {
            "Call", "Free", "Ret", "CallFree",
            # Owner/outparam kinds are ALSO callee-bound actions in the backend:
            # their funcs are real match targets, so an untagged common
            # alternative here must veto narrowing just like a Call/Free.
            "OwnerRelease", "OwnerTransfer", "OwnerTeardown", "OutParamInit",
        }:
            discriminating |= funcs
    return all_funcs, discriminating


_TS_ACTION_KEYS = (
    "Call", "Ret", "Free", "CallFree",
    "OwnerRelease", "OwnerTransfer", "OwnerTeardown", "OutParamInit",
)


def _collect_str_leaves(node: Any, out: set[str]) -> None:
    """Recursively gather every non-empty string leaf under ``node``."""
    if isinstance(node, str):
        if node:
            out.add(node)
    elif isinstance(node, list):
        for item in node:
            _collect_str_leaves(item, out)
    elif isinstance(node, dict):
        for value in node.values():
            _collect_str_leaves(value, out)


def _funcs_from_ts_actions(ts: dict) -> set[str]:
    """Pull every callee string out of a lowered .ts action block.

    The lowered layout nests callee lists under a label dict, e.g.
    ``Ret: [{"AllocRet": ["kzalloc", ...]}]`` or ``Call: [{"FreeSkb":
    ["kfree_skb"]}]``. We recursively collect ALL string leaves under the
    callee-bound action kinds: the .ts is what the backend actually runs, so
    missing an OR-alternative here would be recall-unsafe. Extra tokens are
    harmless -- downstream they only widen the floor or (if common) veto
    narrowing.
    """
    funcs: set[str] = set()
    action = ts.get("action") or {}
    for key in _TS_ACTION_KEYS:
        _collect_str_leaves(action.get(key), funcs)
    return funcs


def extract_anchors(ts_path: Path) -> dict:
    """Extract anchor functions from a rule, UNIONing its .ir.json and .ts.

    The backend runs the lowered .ts, so a stale or partially-lowered .ir.json
    must never hide an OR-alternative the .ts fires on. We therefore always
    parse the .ts actions and union them with the .ir.json events; the union is
    a safe superset (extra anchors only widen the floor or veto narrowing).
    """
    ir_path = ts_path.with_suffix(".ir.json")
    bug_name = ""
    ir_all: set[str] = set()
    ir_disc: set[str] = set()
    if ir_path.exists():
        try:
            ir = json.loads(ir_path.read_text())
            bug_name = (ir.get("bug") or {}).get("name") or ""
            ir_all, ir_disc = _collect_funcs_from_events(ir.get("events"))
        except (json.JSONDecodeError, OSError):
            ir_all, ir_disc = set(), set()

    try:
        ts = json.loads(ts_path.read_text())
    except (json.JSONDecodeError, OSError):
        ts = {}
    bug_name = bug_name or (ts.get("bug") or {}).get("name") or ""
    ts_funcs = _funcs_from_ts_actions(ts)

    all_funcs = ir_all | ts_funcs
    discriminating = ir_disc | ts_funcs

    # Keep generic/common funcs here: they are OR alternatives that let a rule
    # fire kernel-wide, so classify_deterministic must SEE them to veto
    # narrowing. They are recognised as "common" (never rare) downstream.
    concrete = {f for f in discriminating if _looks_like_symbol(f)}
    return {
        "bug_name": bug_name,
        "all_funcs": sorted(all_funcs),
        "concrete_anchors": sorted(concrete),
    }


def _looks_like_symbol(name: str) -> bool:
    # Accept ANY valid C identifier. We deliberately do NOT drop short names:
    # real kernel release helpers like dput/fput/iput are short and no-underscore
    # yet are genuine OR-alternatives that must be able to veto narrowing.
    # Dropping a discriminating anchor is the recall-unsafe direction; keeping a
    # stray field-name token is safe (it only greps to many targets -> common
    # -> veto -> kernel, or to few -> merely widens the floor).
    return bool(re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name))


def build_func_target_index(
    concrete_funcs: set[str],
    link_targets: list,
    kernel_root: Path,
    rare_max: int,
) -> dict[str, set[int] | None]:
    """Map each concrete function -> set of link-target row_ids that can match it.

    A value of ``None`` marks a function as *unlocalizable* -- either a known
    ubiquitous allocator/infra helper (never a valid narrowing signal) or one
    whose grep failed. Downstream, a ``None`` anchor vetoes narrowing (fail-open
    to kernel), so we can skip grepping the known-common helpers entirely.

    Uses grep over kernel .c files for `\\bFUNC\\b`, then maps hit files to the
    link targets whose link_list contains them.
    """
    # file (relative to kernel_root) -> set of target row_ids
    file_to_targets: dict[str, set[int]] = {}
    prefix = str(kernel_root).rstrip("/") + "/"
    for t in link_targets:
        for raw in t.link_list.split():
            if raw.startswith(prefix):
                rel = raw[len(prefix):]
                file_to_targets.setdefault(rel, set()).add(t.row_id)

    result: dict[str, set[int] | None] = {}
    for func in sorted(concrete_funcs):
        if func in GENERIC_ALLOC_FREE or func in COMMON_INFRA:
            result[func] = None  # known-common: never a narrowing signal
            continue
        hit_files = _grep_files(func, kernel_root)
        if hit_files is None:  # grep error -> unlocalizable, fail-open
            result[func] = None
            continue
        targets: set[int] = set()
        for rel in hit_files:
            targets |= file_to_targets.get(rel, set())
        result[func] = targets
    return result


def _grep_files(func: str, kernel_root: Path) -> set[str] | None:
    """Return kernel .c files (relative to kernel_root) mentioning `func`.

    Returns ``None`` on any grep failure so the caller fails open (treats the
    function as unlocalizable -> kernel scope) instead of trusting a possibly
    truncated file list. grep exits 0 (matches) or 1 (no matches) on success;
    anything else (2 = read/traversal error) means the output cannot be trusted.

    Uses `grep -rlw` (word-boundary, recursive, list files). grep is always
    present; ripgrep on this box is only a shell alias, not a real binary.
    """
    try:
        proc = subprocess.run(
            ["grep", "-rlw", "--include=*.c", "--", func, str(kernel_root)],
            check=False, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            text=True, timeout=300,
        )
    except Exception:
        return None
    if proc.returncode not in (0, 1):
        return None
    prefix = str(kernel_root).rstrip("/") + "/"
    files: set[str] = set()
    for line in proc.stdout.splitlines():
        line = line.strip()
        if line.startswith(prefix) and line.endswith(".c"):
            files.add(line[len(prefix):])
    return files


def classify_deterministic(
    rules: list[Path],
    link_targets: list,
    kernel_root: Path,
    rare_max: int,
) -> dict:
    id_to_target = {t.row_id: t for t in link_targets}
    # First pass: extract all rules' anchors so we grep each function once.
    per_rule = {rule_hash(r): extract_anchors(r) for r in rules}
    all_concrete: set[str] = set()
    for info in per_rule.values():
        all_concrete |= set(info["concrete_anchors"])

    func_targets = build_func_target_index(
        all_concrete, link_targets, kernel_root, rare_max
    )

    scope_map: dict = {}
    for rh, info in per_rule.items():
        concrete = info["concrete_anchors"]
        # A rule may fire on ANY one of its discriminating anchors (OR
        # semantics). It is safe to narrow ONLY when EVERY anchor is
        # rare+localizable: a single common/unlocalizable anchor (target set
        # None, empty, or larger than rare_max) means the rule can fire
        # kernel-wide and must veto narrowing. Floor = union of all anchors'
        # targets (a safe superset of where the rule can match).
        per_anchor = {f: func_targets.get(f) for f in concrete}
        localizable_rare = bool(concrete) and all(
            per_anchor[f] is not None and 0 < len(per_anchor[f]) <= rare_max
            for f in concrete
        )
        if localizable_rare:
            floor: set[int] = set()
            for f in concrete:
                floor |= per_anchor[f]
            targets = sorted(
                {id_to_target[i].target_file for i in floor if i in id_to_target}
            )
            entry = {
                "level": "module",
                "bug_name": info["bug_name"],
                "concrete_anchors": concrete,
                "rare_anchors": sorted(concrete),
                "anchor_target_ids": sorted(floor),
                "anchor_targets": targets,
                "source": "provenance",
            }
        else:
            entry = {
                "level": "kernel",
                "bug_name": info["bug_name"],
                "concrete_anchors": concrete,
                "rare_anchors": [],
                "anchor_target_ids": [],
                "anchor_targets": [],
                "source": "provenance" if concrete else "fail-open-kernel",
            }
        scope_map[rh] = entry
    return scope_map


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--rules-dir", type=Path, required=True,
                    help="Directory of .ts rules (with sibling .ir.json).")
    ap.add_argument("--compile-db", type=Path, required=True)
    ap.add_argument("--kernel-root", type=Path, required=True)
    ap.add_argument("--rare-max", type=int, default=DEFAULT_RARE_MAX)
    ap.add_argument("--out", type=Path, required=True,
                    help="Path to write scope_map.json.")
    ap.add_argument("--enable-llm", action="store_true",
                    help="Layer the widen-only LLM adjudicator on top (fail-open).")
    args = ap.parse_args()

    rules = sorted(args.rules_dir.glob("*.ts"))
    if not rules:
        print(f"no .ts rules under {args.rules_dir}", file=sys.stderr)
        return 2
    link_targets = read_link_targets(args.compile_db)
    print(f"rules={len(rules)} link_targets={len(link_targets)} "
          f"rare_max={args.rare_max}", file=sys.stderr)

    scope_map = classify_deterministic(
        rules, link_targets, args.kernel_root, args.rare_max
    )

    if args.enable_llm:
        scope_map = widen_scope_map(scope_map, link_targets)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(scope_map, indent=2))
    n_module = sum(1 for v in scope_map.values() if v["level"] == "module")
    n_kernel = len(scope_map) - n_module
    print(f"scope_map written: {args.out}  module={n_module} kernel={n_kernel}",
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
