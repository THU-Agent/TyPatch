"""Deterministic selection and rendering of backend-validated few-shot examples.

The synthesis context selects at most two examples from the patch text and
appends the rendered demonstrations to the model input.

Only audited entries whose status is ``executable`` and whose
``prompt_enabled`` flag is true are eligible.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any, Iterable


FEW_SHOT_ROOT = Path(__file__).with_name("few_shot_examples")
DEFAULT_MANIFEST = FEW_SHOT_ROOT / "manifest.json"


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_few_shot_manifest(path: Path | None = None) -> dict[str, Any]:
    """Load and validate the machine-readable few-shot manifest."""

    manifest_path = path or DEFAULT_MANIFEST
    payload = json.loads(manifest_path.read_text())
    if payload.get("schema_version") != 1:
        raise ValueError(
            f"{manifest_path}: unsupported schema_version "
            f"{payload.get('schema_version')!r}"
        )
    examples = payload.get("examples")
    if not isinstance(examples, list):
        raise ValueError(f"{manifest_path}: examples must be a list")

    seen: set[str] = set()
    for example in examples:
        if not isinstance(example, dict):
            raise ValueError(f"{manifest_path}: example entries must be objects")
        example_id = example.get("id")
        if not isinstance(example_id, str) or not example_id:
            raise ValueError(f"{manifest_path}: every example needs a non-empty id")
        if example_id in seen:
            raise ValueError(f"{manifest_path}: duplicate example id {example_id!r}")
        seen.add(example_id)
        if example.get("status") != "executable":
            raise ValueError(f"{manifest_path}: {example_id}: example is not executable")
        if example.get("status") != "executable" or not example.get("prompt_enabled"):
            continue

        micro_pair = (example.get("backend_evidence") or {}).get("micro_pair")
        if not isinstance(micro_pair, dict):
            raise ValueError(
                f"{manifest_path}: {example_id}: prompt-enabled example needs "
                "exact micro_pair evidence"
            )
        if (
            micro_pair.get("status") != "pair_pass"
            or micro_pair.get("vulnerable_reports") != 1
            or micro_pair.get("fixed_reports") != 0
        ):
            raise ValueError(
                f"{manifest_path}: {example_id}: prompt-enabled example needs "
                "pair_pass with vulnerable=1 and fixed=0"
            )

        expected_hashes = micro_pair.get("fixture_sha256")
        if not isinstance(expected_hashes, dict):
            raise ValueError(
                f"{manifest_path}: {example_id}: missing verified fixture_sha256"
            )
        relative_paths = {
            "ir": example.get("ir"),
            "patch": example.get("patch"),
            "vulnerable": (example.get("witnesses") or {}).get("vulnerable"),
            "fixed": (example.get("witnesses") or {}).get("fixed"),
        }
        for fixture_kind, relative_path in relative_paths.items():
            expected = expected_hashes.get(fixture_kind)
            if not isinstance(relative_path, str) or not isinstance(expected, str):
                raise ValueError(
                    f"{manifest_path}: {example_id}: incomplete verified hash "
                    f"for {fixture_kind}"
                )
            fixture_path = manifest_path.parent / relative_path
            if not fixture_path.is_file():
                raise ValueError(
                    f"{manifest_path}: {example_id}: missing fixture {fixture_path}"
                )
            actual = _sha256_file(fixture_path)
            if actual != expected:
                raise ValueError(
                    f"{manifest_path}: {example_id}: verified {fixture_kind} "
                    f"fixture drifted (expected {expected}, got {actual}); "
                    "rerun the exact vulnerable/fixed micro pair before enabling it"
                )
    return payload


def _contains_selector(text: str, selector: str) -> bool:
    """Match selectors as lexical units instead of arbitrary substrings."""

    pattern = (
        r"(?<![A-Za-z0-9_])"
        + re.escape(selector.lower())
        + r"(?![A-Za-z0-9_])"
    )
    return re.search(pattern, text) is not None


def _selection_text(commit_message: str, patch_diff: str) -> str:
    """Use the commit message and changed lines, excluding diff context.

    Large ``-U`` hunks often contain unrelated APIs in unchanged context.  An
    unchanged helper must not select a cross-family example merely because it
    happens to be near the actual fix.
    """

    changed_lines = []
    for line in patch_diff.splitlines():
        if line.startswith(("+++", "---")):
            continue
        if line.startswith(("+", "-")):
            changed_lines.append(line[1:])
    relevant_diff = "\n".join(changed_lines) if changed_lines else patch_diff
    return f"{commit_message}\n{relevant_diff}".lower()


def _match_score(example: dict[str, Any], text: str) -> int:
    selectors = example.get("selectors") or {}
    score = 0
    for symbol in selectors.get("api_symbols", []):
        if isinstance(symbol, str) and _contains_selector(text, symbol):
            score += 100
    for phrase in selectors.get("phrases", []):
        if isinstance(phrase, str) and _contains_selector(text, phrase):
            score += 20
    for token in selectors.get("tokens", []):
        if isinstance(token, str) and _contains_selector(text, token):
            score += 3
    return score


def select_few_shot_examples(
    *,
    commit_message: str = "",
    patch_diff: str = "",
    max_examples: int = 2,
    manifest_path: Path | None = None,
) -> list[dict[str, Any]]:
    """Select the best one or two executable examples for the given patch.

    Selection is fully deterministic.  No generic fallback is used: if the
    patch has no signal for one of the audited examples, returning no example
    is safer than injecting an unrelated protocol.
    """

    if max_examples < 0:
        raise ValueError("max_examples must be non-negative")
    if max_examples == 0:
        return []

    manifest = load_few_shot_manifest(manifest_path)
    text = _selection_text(commit_message, patch_diff)
    scored: list[tuple[int, int, str, dict[str, Any]]] = []
    for example in manifest["examples"]:
        if example.get("status") != "executable":
            continue
        if not example.get("prompt_enabled", False):
            continue
        score = _match_score(example, text)
        if score <= 0:
            continue
        priority = int(example.get("priority", 1000))
        scored.append((-score, priority, str(example["id"]), example))

    scored.sort(key=lambda item: (item[0], item[1], item[2]))
    return [item[3] for item in scored[:max_examples]]


def _read_relative(root: Path, relative: str) -> str:
    path = root / relative
    return path.read_text().rstrip()


def render_few_shot_examples(
    examples: Iterable[dict[str, Any]],
    *,
    manifest_path: Path | None = None,
) -> str:
    """Render selected fixtures as a compact patch-to-IR few-shot section."""

    manifest_file = manifest_path or DEFAULT_MANIFEST
    root = manifest_file.parent
    blocks: list[str] = []
    for example in examples:
        if example.get("status") != "executable":
            raise ValueError(
                f"cannot render non-executable example {example.get('id')!r}"
            )
        patch_text = _read_relative(root, str(example["patch"]))
        ir_text = _read_relative(root, str(example["ir"]))
        positive = example["controls"]["positive"]["expectation"]
        negative = example["controls"]["negative"]["expectation"]
        blocks.append(
            "\n".join(
                [
                    f"### Few-shot example: {example['title']}",
                    "",
                    "Input patch:",
                    "```diff",
                    patch_text,
                    "```",
                    "",
                    "TyPatch rule IR:",
                    "```json",
                    ir_text,
                    "```",
                    "",
                    f"Backend positive control: {positive}",
                    f"Backend negative control: {negative}",
                ]
            )
        )
    if not blocks:
        return ""
    return "\n\n".join(
        [
            "## Backend-validated few-shot examples",
            (
                "These examples are backend-validated. Preserve their object "
                "identity, guard, and safe-transition semantics; do not copy "
                "unrelated API names."
            ),
            *blocks,
        ]
    )


def select_and_render_few_shot_examples(
    *,
    commit_message: str = "",
    patch_diff: str = "",
    max_examples: int = 2,
    manifest_path: Path | None = None,
) -> str:
    """Select and render examples for a synthesis prompt."""

    selected = select_few_shot_examples(
        commit_message=commit_message,
        patch_diff=patch_diff,
        max_examples=max_examples,
        manifest_path=manifest_path,
    )
    return render_few_shot_examples(selected, manifest_path=manifest_path)
