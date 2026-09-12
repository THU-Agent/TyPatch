from __future__ import annotations
import argparse
import hashlib
import json
import os
import re
import sys
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any, Optional

from .few_shot_examples import (
    render_few_shot_examples,
    select_few_shot_examples,
)
from .ir_schema import IR
from .llm_client import (
    AnthropicMessagesLLM,
    LLMBase,
    OpenAILLM,
    get_provider_receipt_count,
    get_provider_receipts,
    get_usage_stats,
)
from .lowering import auto_add_init_merges, auto_complete_transitions, lower
from .construction.api_lookup import lookup_api_definitions
from .construction.func_extractor import (
    find_changed_function_bodies,
    find_changed_function_names,
    find_changed_function_names_at_lines,
)
from .construction.candidate import (
    _IR_JSON_SCHEMA,
    _validate_raw,
    repair_candidate,
    sanity_failure_hint,
    schema_error_hint,
)
from .construction.patch_loader import load_patch
from .construction.source_context import (
    EMPTY_SOURCE_CONTEXT,
    ResolvedSourceContext,
    build_source_context,
)
from .reporter import SynthesisReport, Verdict
from .sanity import run_sanity


def _usage_delta(before: Mapping[str, int], after: Mapping[str, int]) -> dict[str, int]:
    keys = set(before) | set(after)
    return {key: int(after.get(key, 0)) - int(before.get(key, 0)) for key in sorted(keys)}


def _estimate_usage_cost(usage: Mapping[str, int]) -> Optional[dict[str, float | str]]:
    prompt_per_million = float(os.environ.get("OPENAI_PROMPT_COST_PER_MTOKEN", "0") or 0)
    completion_per_million = float(
        os.environ.get("OPENAI_COMPLETION_COST_PER_MTOKEN", "0") or 0
    )
    if prompt_per_million <= 0 and completion_per_million <= 0:
        return None

    prompt_cost = usage.get("prompt_tokens", 0) * prompt_per_million / 1_000_000
    completion_cost = (
        usage.get("completion_tokens", 0) * completion_per_million / 1_000_000
    )
    return {
        "currency": os.environ.get("OPENAI_COST_CURRENCY", "USD"),
        "model": os.environ.get("OPENAI_MODEL", ""),
        "prompt": round(prompt_cost, 6),
        "completion": round(completion_cost, 6),
        "total": round(prompt_cost + completion_cost, 6),
    }


def _record_total_usage(report: SynthesisReport, start_usage: Mapping[str, int]) -> None:
    usage = _usage_delta(start_usage, get_usage_stats())
    report.metadata["token_usage"] = usage
    cost = _estimate_usage_cost(usage)
    if cost is not None:
        report.metadata["estimated_cost"] = cost


def _write_report(report: SynthesisReport, report_dir: Path) -> None:
    start_usage = report.metadata.pop("_token_usage_start", None)
    if isinstance(start_usage, Mapping):
        _record_total_usage(report, start_usage)
    provider_start = report.metadata.pop("_provider_receipt_start", None)
    if isinstance(provider_start, int):
        receipts = get_provider_receipts(provider_start)
        if receipts:
            report.metadata["provider_receipts"] = receipts
    report.write(Path(report_dir) / f"{report.commit_or_cluster_id}.json")


def _write_ir_json(ir: IR, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            ir.model_dump(by_alias=True, exclude_none=True),
            indent=2,
            sort_keys=True,
        )
    )


def _abort_reason_requests_ir_repair(reason: str) -> bool:
    """Recognize an abort payload whose prose actually promises a valid IR.

    Some JSON-mode models satisfy the abort branch of the response schema but
    put their reasoning in ``abort``.  In the contradictory cases the text
    explicitly says that aborting is unnecessary, that the IR is valid, or
    that an IR/JSON object will be returned.  Treat only those decisive claims
    as a format failure; ordinary "this is modelable in theory, but ..."
    explanations remain genuine aborts.
    """
    text = " ".join(str(reason or "").lower().split())
    if not text:
        return False

    decisive_patterns = (
        r"\bnot aborting\b",
        r"\bno abort (?:is )?(?:needed|required|necessary|appropriate)\b",
        r"\babort(?:ing)? (?:is|would be) not "
        r"(?:needed|required|necessary|appropriate)\b",
        r"\bdoes not require (?:an? )?abort\b",
        r"\bdo not (?:need|require) (?:an? )?abort\b",
        r"\bi(?:'ll| will) (?:now )?(?:output|return|provide|emit|produce) "
        r"(?:a |the )?(?:valid )?(?:ir|json)\b",
        r"\b(?:thus|therefore|so),? (?:i(?:'ll| will) )?"
        r"(?:output|return|provide|emit|produce) (?:a |the )?(?:ir|json)\b",
        r"\b(?:the )?ir (?:is|appears|seems) "
        r"(?:correct|complete|valid)(?: and (?:correct|complete|valid))?\b",
        r"\b(?:the )?ir will be\s*:?$",
        r"\b(?:the )?(?:synthesized )?ir (?:models?|captures?) "
        r".{0,100}\bcorrectly\b",
        r"\b(?:the )?(?:before-fix )?bug is captured\b",
        r"\b(?:the )?(?:rule|pattern) is (?:a )?valid\b",
    )
    return any(re.search(pattern, text) for pattern in decisive_patterns)




def _prepare_ir_for_lowering(
    ir: IR,
) -> IR:
    ir = auto_complete_transitions(ir)
    ir = auto_add_init_merges(ir)
    return ir


# ---------------------------------------------------------------------------
# Rule synthesis: patch evidence to candidate IR
# ---------------------------------------------------------------------------

_RULE_PROMPT_PATH = Path(__file__).parent / "prompts" / "patch_to_rule.md"
_PRE_FIX_BODY_MAX_FUNCTIONS = 3
_PRE_FIX_BODY_MAX_LINES_PER_FUNCTION = 200
_PRE_FIX_BODY_MAX_SECTION_LINES = 500
_PSEUDO_FUNCTION_NAMES = {"<indirect>"}
_CALL_IDENTIFIER_RE = re.compile(r"\b([A-Za-z_]\w*)\s*\(")
_NON_CALL_IDENTIFIERS = {"if", "for", "while", "switch", "return", "sizeof"}


def _changed_function_bodies(patch: Any) -> list[tuple[str, str, str]]:
    """Find functions enclosing changed lines, preferring their pre-fix body."""
    return find_changed_function_bodies(patch)


def _changed_function_names(patch: Any) -> list[str]:
    """Resolve changed function names from source lines, then hunk headers."""
    return find_changed_function_names_at_lines(patch) or find_changed_function_names(
        patch.diff
    )


def _pre_fix_function_bodies_section(patch: Any) -> str:
    """Format a bounded, deterministic pre-fix source context section."""
    lines = ["## Pre-fix function bodies (the buggy code the rule must model)"]
    for path, name, body in _changed_function_bodies(patch)[:_PRE_FIX_BODY_MAX_FUNCTIONS]:
        # Reserve the blank line, label, and two fence lines before taking body.
        body_limit = min(
            _PRE_FIX_BODY_MAX_LINES_PER_FUNCTION,
            _PRE_FIX_BODY_MAX_SECTION_LINES - len(lines) - 4,
        )
        if body_limit <= 0:
            break
        body_lines = body.splitlines()
        if len(body_lines) > body_limit:
            body_lines = body_lines[: body_limit - 1] + ["/* ... truncated ... */"]
        lines.extend(["", f"### {path}: {name}", "```c", *body_lines, "```"])
    return "\n".join(lines) if len(lines) > 1 else ""


def _pre_fix_body_call_candidates(patch: Any, limit: int = 30) -> list[str]:
    """Collect real-looking callee identifiers for a grounding repair hint."""
    candidates: list[str] = []
    for _path, function_name, body in _changed_function_bodies(patch):
        for match in _CALL_IDENTIFIER_RE.finditer(body):
            candidate = match.group(1)
            if candidate in _NON_CALL_IDENTIFIERS or candidate == function_name:
                continue
            if candidate not in candidates:
                candidates.append(candidate)
                if len(candidates) == limit:
                    return candidates
    return candidates


def _ir_function_names(ir: IR) -> list[str]:
    """Return distinct IR binding/Ret names in event order."""
    names: list[str] = []
    for event in ir.events:
        for binding in event.bindings:
            if binding.func and binding.func not in names:
                names.append(binding.func)
        for func in event.funcs:
            if func and func not in names:
                names.append(func)
    return names


def _grounding_evidence_texts(
    patch: Any,
    source_context: ResolvedSourceContext = EMPTY_SOURCE_CONTEXT,
) -> list[str]:
    """Grounding corpus: the diff plus pre/post bodies of every touched file.

    The grounding check uses this corpus directly.
    """
    source_texts = [patch.diff]
    for path in patch.touched_files:
        source_texts.extend(
            [patch.file_before.get(path, ""), patch.file_after.get(path, "")]
        )
    source_texts.extend(source_context.evidence_texts)
    return source_texts


def _ungrounded_ir_functions(
    ir: IR,
    patch: Any,
    source_context: ResolvedSourceContext = EMPTY_SOURCE_CONTEXT,
) -> list[str]:
    """Find IR callees absent from the patch and resolved source context."""
    source_texts = _grounding_evidence_texts(patch, source_context)
    ungrounded: list[str] = []
    for name in _ir_function_names(ir):
        if name in _PSEUDO_FUNCTION_NAMES:
            continue
        pattern = re.compile(rf"\b{re.escape(name)}\b")
        if not any(pattern.search(text) for text in source_texts):
            ungrounded.append(name)
    return ungrounded


def _grounding_failure_reason(patch: Any, ungrounded: Sequence[str]) -> str:
    candidates = _pre_fix_body_call_candidates(patch)
    candidate_text = ", ".join(candidates) if candidates else "none"
    return (
        "GROUNDING FIX: the following bound functions do not appear in the "
        "patch or resolved source context and are "
        "likely hallucinated: "
        + ", ".join(ungrounded)
        + ". Replace each with a real callee visible in the pre-fix function "
        "bodies or diff (candidates: "
        + candidate_text
        + ")."
    )


def _build_synthesis_context(
    patch: Any,
    kernel_root: Optional[Path],
    *,
    few_shot_examples: Optional[Sequence[Mapping[str, Any]]] = None,
    source_context: Optional[ResolvedSourceContext] = None,
) -> str:
    """Build case context with at most two backend-validated few-shot pairs."""
    if few_shot_examples is None:
        few_shot_examples = select_few_shot_examples(
            commit_message=patch.message,
            patch_diff=patch.diff,
            max_examples=2,
        )
    few_shot_section = render_few_shot_examples(few_shot_examples)
    parts = []
    if few_shot_section:
        parts.extend(
            [
                few_shot_section,
                "",
                "## Current synthesis case",
                (
                    "The examples above demonstrate backend contracts only. "
                    "Use the APIs and object identity evidenced by this current "
                    "case; never copy unrelated example API names."
                ),
                "",
            ]
        )
    parts.extend(
        [
            "## Commit",
            patch.message,
            "",
            "## Patch diff",
            "```diff",
            patch.diff,
            "```",
        ]
    )

    pre_fix_bodies = _pre_fix_function_bodies_section(patch)
    if pre_fix_bodies:
        parts.extend(["", pre_fix_bodies])

    function_names = _changed_function_names(patch)
    if function_names:
        parts.extend(["", "## Changed functions"])
        parts.extend(f"- {name}" for name in function_names)

    resolved_context = source_context or EMPTY_SOURCE_CONTEXT
    if resolved_context.block:
        parts.extend(["", resolved_context.block])

    if kernel_root and kernel_root.is_dir():
        diff_names = list(
            dict.fromkeys(
                m.group(1)
                for m in re.finditer(r"\b([a-z_][a-z0-9_]{3,})\s*\(", patch.diff)
                if not m.group(1).startswith(("if", "for", "while", "switch", "return"))
            )
        )
        api_context = lookup_api_definitions(diff_names, kernel_root)
        if api_context:
            parts.extend(["", api_context])

    parts.extend(
        [
            "",
            "## Output",
            "Return exactly one JSON object matching IR v0.5, or an abort object.",
        ]
    )
    return "\n".join(parts)


def _write_prompt_audit(
    *,
    report_dir: Path,
    commit: str,
    messages: Sequence[Mapping[str, str]],
) -> str:
    path = Path(report_dir) / f"{commit}.prompt.md"
    parts: list[str] = []
    for message in messages:
        role = message.get("role", "unknown")
        content = message.get("content", "")
        parts.extend([f"# {role}", "", content, ""])
    path.write_text("\n".join(parts))
    return str(path)


def synthesize_commit(
    commit: str,
    repo: Path,
    out_dir: Path,
    report_dir: Path,
    llm: LLMBase,
    kernel_root: Optional[Path] = None,
) -> SynthesisReport:
    """Run the sole supported synthesis path: grounded patch -> IR JSON."""
    out_dir = Path(out_dir)
    report_dir = Path(report_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    report_dir.mkdir(parents=True, exist_ok=True)

    report = SynthesisReport(commit_or_cluster_id=commit)
    run_usage_start = get_usage_stats()
    report.metadata["_token_usage_start"] = run_usage_start
    report.metadata["_provider_receipt_start"] = get_provider_receipt_count()
    source_context = EMPTY_SOURCE_CONTEXT

    # 1. Load patch
    try:
        patch = load_patch(commit=commit, repo=Path(repo))
    except Exception as exc:  # noqa: BLE001
        report.verdict = Verdict.ABORT
        report.generation.abort_reason = f"patch load failed: {exc!r}"
        _write_report(report, report_dir)
        return report

    # 2. Build the grounded generation prompt
    try:
        system_prompt = _RULE_PROMPT_PATH.read_text()
        few_shot_examples = select_few_shot_examples(
            commit_message=patch.message,
            patch_diff=patch.diff,
            max_examples=2,
        )
        source_context_root = (
            kernel_root
            if kernel_root and kernel_root.is_dir()
            else Path(repo)
        )
        if source_context_root.is_dir():
            source_context = build_source_context(
                patch,
                source_context_root,
            )
        user_content = _build_synthesis_context(
            patch,
            kernel_root,
            few_shot_examples=few_shot_examples,
            source_context=source_context,
        )
    except Exception as exc:  # noqa: BLE001
        report.verdict = Verdict.ABORT
        report.generation.abort_reason = (
            f"prompt/few-shot example construction failed: {exc!r}"
        )
        _write_report(report, report_dir)
        return report
    report.metadata["few_shot_example_ids"] = [
        str(example["id"]) for example in few_shot_examples
    ]
    report.metadata["few_shot_example_count"] = len(few_shot_examples)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]
    prompt_path = _write_prompt_audit(
        report_dir=report_dir,
        commit=patch.commit,
        messages=messages,
    )
    report.metadata["prompt_path"] = prompt_path
    prompt_text = Path(prompt_path).read_text()
    report.metadata["prompt_sha256"] = hashlib.sha256(
        prompt_text.encode("utf-8")
    ).hexdigest()
    report.metadata["prompt_chars"] = len(prompt_text)
    api_section = user_content.partition(
        "## Key API definitions (from kernel source)"
    )[2]
    if api_section:
        api_section = api_section.partition("\n## Output")[0]
    report.metadata["api_definitions_count"] = len(
        re.findall(r"(?m)^### `[^`]+`\s*$", api_section)
    )
    report.metadata["source_context_triggered"] = source_context.triggered
    report.metadata["source_context_chars"] = source_context.char_count
    report.metadata["source_context_entries"] = len(source_context.entries)
    report.metadata["source_context_root_entries"] = (
        source_context.root_entry_count
    )
    report.metadata["source_context_seed_count"] = source_context.seed_count
    report.metadata["source_context_source_files"] = (
        source_context.source_file_count
    )
    report.metadata["source_context_omitted_entries"] = (
        source_context.omitted_entry_count
    )

    # 3. Call LLM
    try:
        raw = llm.complete_json(messages, _IR_JSON_SCHEMA)
    except Exception as exc:  # noqa: BLE001
        report.verdict = Verdict.ABORT
        report.generation.abort_reason = f"candidate generation failed: {exc!r}"
        _write_report(report, report_dir)
        return report

    # 4. Validate
    ir_result = _validate_raw(raw)
    # 5. Repair loop (max 2 attempts) for schema/sanity failures
    max_repairs = 2
    candidate_ir = None
    best_ir_result = None
    best_ungrounded: list[str] = []
    best_rank: tuple[int, int] | None = None
    using_best_fallback = False
    for repair_attempt in range(max_repairs + 1):
        if ir_result.aborted:
            if (
                repair_attempt < max_repairs
                and _abort_reason_requests_ir_repair(ir_result.abort_reason)
            ):
                report.metadata.setdefault("contradictory_abort_repairs", []).append(
                    {
                        "round": repair_attempt + 1,
                        "abort_reason": ir_result.abort_reason,
                    }
                )
                ir_result = repair_candidate(
                    # Preserve the full grounded generation context so repair
                    # sees the same API definitions as the initial call.
                    prompt_context=user_content,
                    llm=llm,
                    previous_raw=ir_result.raw_response,
                    failure_reason=(
                        "The previous JSON selected the abort branch, but its "
                        "own explanation says the bug is modelable or promises "
                        "a valid IR. This is a response-format contradiction. "
                        "Return the actual top-level IR v0.5 JSON object now; "
                        "use abort only if synthesis is genuinely impossible."
                    ),
                )
                continue
            if best_ir_result is not None:
                ir_result = best_ir_result
                using_best_fallback = True
            else:
                report.generation.ok = False
                report.generation.abort = True
                report.generation.abort_reason = ir_result.abort_reason
                report.verdict = Verdict.ABORT
                _write_report(report, report_dir)
                return report

        if ir_result.ir is None:
            if repair_attempt < max_repairs:
                base_reason = ir_result.schema_error or "No valid IR returned."
                hint = schema_error_hint(ir_result.schema_error)
                ir_result = repair_candidate(
                    prompt_context=user_content,
                    llm=llm,
                    previous_raw=ir_result.raw_response,
                    failure_reason=(
                        f"{base_reason}\n\n{hint}" if hint else base_reason
                    ),
                )
                continue
            if best_ir_result is not None:
                ir_result = best_ir_result
                using_best_fallback = True
            else:
                report.generation.ok = False
                report.generation.schema_error = ir_result.schema_error or "unknown"
                report.verdict = Verdict.SCHEMA_FAIL
                _write_report(report, report_dir)
                return report

        assert ir_result.ir is not None
        ungrounded = _ungrounded_ir_functions(
            ir_result.ir,
            patch,
            source_context,
        )
        rank = (0 if not ungrounded else 1, len(ungrounded))
        if best_rank is None or rank < best_rank:
            best_ir_result = ir_result
            best_ungrounded = ungrounded
            best_rank = rank
        elif repair_attempt == max_repairs and best_ir_result is not None:
            ir_result = best_ir_result
            ungrounded = best_ungrounded
            using_best_fallback = True

        if ungrounded:
            if repair_attempt < max_repairs and not using_best_fallback:
                ir_result = repair_candidate(
                    prompt_context=user_content,
                    llm=llm,
                    previous_raw=ir_result.raw_response,
                    failure_reason=_grounding_failure_reason(patch, ungrounded),
                )
                continue
            report.metadata["ungrounded_funcs"] = ungrounded

        # IR valid — run sanity
        candidate_ir = _prepare_ir_for_lowering(ir_result.ir)
        findings = run_sanity(
            candidate_ir,
            patch_diff=patch.diff,
            kernel_root=kernel_root,
        )
        report.sanity_findings = [
            {"check": f.check, "passed": f.passed, "code": f.code, "details": f.details}
            for f in findings
        ]

        if any(not f.passed for f in findings):
            if repair_attempt < max_repairs and not using_best_fallback:
                failed = [f for f in findings if not f.passed]
                failed_checks = "; ".join(
                    f"{f.check}: {f.details}" for f in failed
                )
                hint = sanity_failure_hint([f.code for f in failed])
                ir_result = repair_candidate(
                    prompt_context=user_content,
                    llm=llm,
                    previous_raw=ir_result.raw_response,
                    failure_reason=(
                        f"Sanity check failures: {failed_checks}"
                        + (f"\n\n{hint}" if hint else "")
                    ),
                )
                continue
            report.verdict = Verdict.SANITY_FAIL
            _write_report(report, report_dir)
            return report

        # All checks passed
        break

    # Lower and write output
    try:
        ts = lower(candidate_ir)
    except Exception as exc:  # noqa: BLE001
        report.lowering.ok = False
        report.lowering.error = repr(exc)
        report.verdict = Verdict.LOWERING_FAIL
        _write_report(report, report_dir)
        return report

    ts_path = out_dir / f"{commit}.ts"
    ts_path.write_text(json.dumps(ts, indent=2, sort_keys=True))
    ir_path = out_dir / f"{commit}.ir.json"
    _write_ir_json(candidate_ir, ir_path)

    report.generation.ok = True
    report.lowering.ok = True
    report.lowering.ts_path = str(ts_path)
    report.verdict = Verdict.SYNTH_OK
    _write_report(report, report_dir)
    return report


def synthesize(argv: Optional[list] = None) -> int:
    parser = argparse.ArgumentParser(
        prog="typatch-synth", description="Patch-to-rule synthesizer"
    )
    parser.add_argument(
        "--commits",
        required=True,
        help="path to a file with one commit SHA per line, optionally followed by ',label'",
    )
    parser.add_argument("--repo", required=True, type=Path, help="kernel git checkout")
    parser.add_argument("--out-dir", required=True, type=Path, help="directory for .ts files")
    parser.add_argument(
        "--report-dir",
        required=True,
        type=Path,
        help="directory for synthesis_report.json files",
    )
    parser.add_argument("--limit", type=int, default=None, help="process at most N commits")
    parser.add_argument(
        "--kernel-source",
        type=Path,
        default=None,
        help="path to kernel source tree for API definition lookup (optional)",
    )
    args = parser.parse_args(argv)

    llm_provider = os.environ.get("TYPATCH_LLM_PROVIDER", "openai").strip().lower()
    if llm_provider == "anthropic":
        llm = AnthropicMessagesLLM.from_env()
    elif llm_provider == "openai":
        llm = OpenAILLM.from_env()
    else:
        parser.error(
            "TYPATCH_LLM_PROVIDER must be 'openai' or 'anthropic'"
        )
    # Fall back to KERNEL_ROOT so direct synthesis runs
    # launched without --kernel-source still get API-definition grounding.
    kernel_root = args.kernel_source
    if kernel_root is None and os.environ.get("KERNEL_ROOT"):
        kernel_root = Path(os.environ["KERNEL_ROOT"])
    commits = []
    for line in Path(args.commits).read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        commits.append(line.split(",", 1)[0].strip())
    if args.limit is not None:
        commits = commits[: args.limit]

    summary = {
        "ok": 0,
        "abort": 0,
        "schema_fail": 0,
        "sanity_fail": 0,
        "lowering_fail": 0,
        "error": 0,
    }
    verdict_to_bucket = {
        Verdict.SYNTH_OK: "ok",
        Verdict.ABORT: "abort",
        Verdict.SCHEMA_FAIL: "schema_fail",
        Verdict.SANITY_FAIL: "sanity_fail",
        Verdict.LOWERING_FAIL: "lowering_fail",
    }
    for sha in commits:
        try:
            report = synthesize_commit(
                commit=sha,
                repo=args.repo,
                out_dir=args.out_dir,
                report_dir=args.report_dir,
                llm=llm,
                kernel_root=kernel_root,
            )
        except Exception as exc:  # noqa: BLE001
            print(f"{sha[:12]}  ERROR  {exc!r}", file=sys.stderr)
            summary["error"] += 1
            continue
        bucket = verdict_to_bucket[report.verdict]
        summary[bucket] += 1
        print(f"{sha[:12]}  {report.verdict.value}")

    print("Summary:", json.dumps(summary, sort_keys=True))
    usage = get_usage_stats()
    print("Token usage:", json.dumps(usage, sort_keys=True))
    cost = _estimate_usage_cost(usage)
    if cost is not None:
        print("Estimated cost:", json.dumps(cost, sort_keys=True))
    return 0


def main(argv: Optional[list] = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if args and args[0] == "synthesize":
        return synthesize(args[1:])
    return synthesize(args)


if __name__ == "__main__":
    raise SystemExit(main())
