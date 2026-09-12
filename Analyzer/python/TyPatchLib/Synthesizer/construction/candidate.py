"""Schema validation and targeted repair for generated rule candidates."""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any, Dict, Optional

from pydantic import ValidationError

from ..ir_schema import IR
from ..llm_client import LLMBase


_PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "patch_to_rule.md"


_ABORT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "abort": {"type": "string"},
        "detail": {"type": "string"},
    },
    "required": ["abort"],
    "additionalProperties": False,
}


_IR_ONLY_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "version": {"type": "string"},
        "bug": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "key": {"type": "string"},
                "description": {"type": "string"},
            },
            "required": ["name", "key"],
        },
        "events": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "kind": {
                        "type": "string",
                        "enum": [
                            "Call",
                            "Ret",
                            "Use",
                            "Ref",
                            "BrNull",
                            "BrNonNull",
                            "Exit",
                            "StoreNull",
                            "StoreInit",
                            "FieldStore",
                            "FieldStoreValue",
                            "FieldLoad",
                            "FieldLoadValue",
                            "ListNeighborLoad",
                            "OutParamInit",
                            "OwnerRelease",
                            "OwnerTransfer",
                            "OwnerTeardown",
                            "CountedByInit",
                            "Lock",
                            "Unlock",
                            "AtomicAccess",
                            "ManagedAlloc",
                            "QueueWork",
                            "WaitCompletion",
                            "WaitTimeout",
                            "Complete",
                            "CompletionDone",
                        ],
                    },
                    "description": {"type": "string"},
                    "bindings": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "func": {"type": "string"},
                                "arg": {"type": "integer", "minimum": 0},
                                "field": {"type": "string"},
                                "field_name": {"type": "string"},
                                "field_path": {"type": "string"},
                            },
                            "required": ["func", "arg"],
                        },
                    },
                    "funcs": {"type": "array", "items": {"type": "string"}},
                    "role": {
                        "type": "string",
                        "enum": [
                            "source", "sink", "guard", "acquire", "release",
                            "balance", "publish", "unpublish", "init", "fail",
                            "exit", "teardown", "context", "other",
                        ],
                    },
                    "object": {"type": "object"},
                    "api_contract": {"type": "object"},
                },
                "required": ["name", "kind"],
            },
        },
        "fsm": {
            "type": "object",
            "properties": {
                "states": {"type": "array", "items": {"type": "string"}},
                "initial": {"type": "string"},
                "transitions": {"type": "object"},
                "merges": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "a": {"type": "string"},
                            "b": {"type": "string"},
                            "result": {"type": "string"},
                        },
                        "required": ["a", "b", "result"],
                    },
                },
                "state_roles": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string",
                        "enum": ["init", "safe", "danger", "bug", "unknown"],
                    },
                },
            },
            "required": ["states", "initial", "transitions", "state_roles"],
        },
        "trigger": {
            "type": "object",
            "properties": {
                "bug_state": {"type": "string"},
                "key_events": {"type": "array", "items": {"type": "string"}},
                "sliced_events": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["bug_state"],
        },
        "context": {
            "type": "object",
            "properties": {
                "start_events": {"type": "array", "items": {"type": "string"}},
                "end_events": {"type": "array", "items": {"type": "string"}},
            },
        },
        "modeling": {
            "type": "string",
            "enum": [
                "scalar_uninit_use",
                "resource_leak",
                "partial_init_copy",
                "alloc_free",
                "typestate_protocol",
            ],
            "description": (
                "Required explicit modeling angle. Lowering never infers it "
                "from bug text. Use 'scalar_uninit_use' only "
                "for genuine uninitialized-scalar-read bugs; 'resource_leak' "
                "for a missing release/free on some path; 'partial_init_copy' "
                "for partially-initialized data copied out (infoleak); "
                "'alloc_free' for bugs about an allocated object and its free; "
                "otherwise use 'typestate_protocol'."
            ),
        },
        "protocol_semantics": {
            "type": "object",
            "description": (
                "Backend-independent witness requirements. These are semantic "
                "contracts, never executor names, budgets, or pruning knobs."
            ),
            "properties": {
                "guard_semantics": {
                    "type": "string",
                    "enum": ["none", "nonnull_branch"],
                },
                "exit_semantics": {
                    "type": "string",
                    "enum": ["any_return", "error_return"],
                },
            },
            "required": [
                "guard_semantics",
                "exit_semantics",
            ],
            "additionalProperties": False,
        },
        "path_semantics": {
            "type": "object",
            "properties": {
                "require_same_path": {"type": "boolean"},
                "source_visibility": {
                    "type": "string",
                    "enum": ["stable", "branch_local"],
                },
                "require_distinct_key_locations": {"type": "boolean"},
            },
        },
        "_provenance": {"type": "object"},
    },
    "required": [
        "version",
        "bug",
        "events",
        "fsm",
        "trigger",
        "modeling",
        "protocol_semantics",
    ],
    "additionalProperties": False,
}


_IR_JSON_SCHEMA: Dict[str, Any] = {
    "oneOf": [_ABORT_SCHEMA, _IR_ONLY_SCHEMA],
}


@dataclass
class CandidateResult:
    ir: Optional[IR]
    aborted: bool = False
    abort_reason: str = ""
    schema_error: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None
    repaired: bool = False


def _validate_raw(raw: Any, *, repaired: bool = False) -> CandidateResult:
    if isinstance(raw, dict) and "abort" in raw and "version" not in raw:
        return CandidateResult(
            ir=None,
            aborted=True,
            abort_reason=str(raw["abort"]),
            raw_response=raw,
            repaired=repaired,
        )

    try:
        ir = IR.model_validate(raw)
    except ValidationError as exc:
        return CandidateResult(
            ir=None,
            schema_error=str(exc),
            raw_response=raw if isinstance(raw, dict) else None,
            repaired=repaired,
        )
    return CandidateResult(
        ir=ir,
        raw_response=raw if isinstance(raw, dict) else None,
        repaired=repaired,
    )


def schema_error_hint(schema_error: Optional[str]) -> str:
    """Return targeted corrective guidance for known schema-error classes.

    The generic repair prompt covers event *semantics* but not the
    ``bindings`` vs ``funcs`` container convention, which some models (notably
    reasoning models that skim the JSON Rules) repeatedly get wrong. Feeding
    the raw pydantic error back alone is not enough -- they make the same
    mistake on every retry. This maps the error text to a crisp, actionable
    fix so the repair call can actually converge.
    """
    if not schema_error:
        return ""
    hints: list[str] = []
    if "must declare at least one binding" in schema_error or (
        "must not declare funcs; use bindings" in schema_error
    ):
        hints.append(
            "SCHEMA FIX: A function-bound event (kind `Call`, or a Call-named "
            "event such as CallFree / CallPublish / OwnerRelease / "
            "OwnerTransfer / OwnerTeardown / OutParamInit) used a `funcs` list "
            "or left `bindings` empty. These events MUST use `bindings` and "
            "MUST NOT contain a `funcs` key. For each callee, emit "
            '`{"func": "<callee>", "arg": <0-based index of the tracked '
            "argument>}` (use 0 when the tracked object is the first/only "
            "relevant pointer argument). Move every name currently under "
            "`funcs` into `bindings`. Only `Ret` events use `funcs`."
        )
    if "Ret event must declare at least one function in funcs" in schema_error or (
        "Ret event must not declare bindings" in schema_error
    ):
        hints.append(
            "SCHEMA FIX: A `Ret` event must carry its callees in a `funcs` "
            "list (e.g. `\"funcs\": [\"alloc_helper\"]`) and must NOT use "
            "`bindings`. Ret models a return-value source, so no argument "
            "index applies."
        )
    return "\n".join(hints)


_SANITY_HINTS: dict[str, str] = {
    "EMPTY_KEY_EVENTS": (
        "trigger.key_events must list, in order, the minimal event sequence "
        "that drives the FSM from the initial state into bug_state."
    ),
    "KEY_CHAIN_NOT_A_PATH": (
        "Replaying trigger.key_events from fsm.initial hit a state with no "
        "transition for the next key event. Either add the missing "
        "(state, event) transition to fsm.transitions, or reorder/trim "
        "key_events so each step follows an existing transition."
    ),
    "KEY_CHAIN_NOT_BUG_TRIGGER": (
        "Replaying trigger.key_events from fsm.initial ends in a state that "
        "is not trigger.bug_state. The last key event's transition must land "
        "in bug_state. Fix the final transition (or append the missing "
        "sink event, e.g. the Use/deref that manifests the bug) so the chain "
        "terminates exactly in bug_state."
    ),
    "KEY_EVENT_NOT_SLICED": (
        "Every event named in trigger.key_events must also appear in "
        "trigger.sliced_events. Add the missing names to sliced_events."
    ),
    "UAF_MISSING_USE_EVENT": (
        "A UAF rule must declare an event named `Use` (kind Use/Deref) bound "
        "to the access of the freed object that the patch guards or "
        "reorders. Add the `Use` event, include it in key_events AFTER the "
        "release event, and add its transitions into bug_state."
    ),
    "UAF_KEY_OR_SLICE_MISSING_USE": (
        "The `Use` event exists but must appear in BOTH trigger.key_events "
        "(after the release event) and trigger.sliced_events."
    ),
    "UAF_MISSING_RELEASE_BEFORE_USE": (
        "UAF key_events must contain a release-like Call event (CallFree, or "
        "a descriptive release/giveback/destroy call) BEFORE the `Use` "
        "event. Reorder key_events or add the release event."
    ),
    "UAF_RELEASE_NOT_SLICED": (
        "The release key event must also be listed in trigger.sliced_events."
    ),
    "UAF_RELEASE_CALL_LACKS_SEMANTIC_ANCHOR": (
        "A non-CallFree release event must be recognizably a release: name "
        "or describe it with release/giveback/put/stop/destroy/teardown "
        "semantics, and bind it to the actual releasing callee from the "
        "patch."
    ),
    "UAF_ALLOCRET_REQUIRED_WITHOUT_ALLOCATOR_EVIDENCE": (
        "The patch shows deallocator evidence but no return-value allocator, "
        "so key_events must NOT require an AllocRet step. Remove AllocRet "
        "from key_events and start the trigger chain at the release event "
        "(track any object that reaches the release call)."
    ),
    "UAF_CALLFREE_WITHOUT_PATCH_DEALLOCATOR_EVIDENCE": (
        "The rule uses CallFree, but the patch contains no direct "
        "free/deallocator. The release here is an ownership-transfer or "
        "lifecycle API. Model it as a descriptive Call release event bound "
        "to the actual API from the patch (not kfree/vfree); if the release "
        "cannot be modeled, abort honestly."
    ),
    "DOUBLE_FREE_MISSING_CALLFREE_EVENT": (
        "A double-free rule must declare a CallFree event bound to the "
        "deallocator from the patch."
    ),
    "DOUBLE_FREE_KEY_MISSING_SECOND_FREE": (
        "Double-free key_events must contain the free event TWICE (first "
        "free, then the second free that lands in bug_state)."
    ),
    "NPD_NO_SOURCE_EVENT": (
        "An NPD rule needs a source event that introduces the "
        "possibly-NULL value (e.g. an AllocRet/Ret event bound to the "
        "nullable-returning API from the patch) before the deref event."
    ),
    "BUG_STATE_HAS_EXIT_TRANSITION": (
        "bug_state must be terminal: remove all transitions that leave "
        "bug_state (add self-loops instead if an action must be accepted)."
    ),
}


def sanity_failure_hint(codes: list[str]) -> str:
    """Map failed sanity-check codes to actionable repair guidance.

    Mirrors ``schema_error_hint``: the raw finding details (e.g. ``uaf_shape:
    ['Use']``) tell the model *that* a check failed but not *how* to fix it,
    so repair rounds burn without converging. Each hint states the concrete
    IR edit that clears the check.
    """
    hints = [
        f"SANITY FIX ({code}): {_SANITY_HINTS[code]}"
        for code in dict.fromkeys(codes)
        if code in _SANITY_HINTS
    ]
    return "\n".join(hints)


def repair_candidate(
    *,
    prompt_context: str,
    llm: LLMBase,
    previous_raw: Optional[Dict[str, Any]],
    failure_reason: str,
) -> CandidateResult:
    """Repair an invalid, contradictory, or sanity-failing candidate IR."""
    previous_json = (
        json.dumps(previous_raw, indent=2, ensure_ascii=False, sort_keys=True)
        if previous_raw is not None
        else "null"
    )
    messages = [
        {
            "role": "system",
            "content": "\n\n".join(
                [
                    _PROMPT_PATH.read_text(),
                    "You are repairing a previous IR candidate. Return only one "
                    "valid JSON object for our IR v0.5. Do not output prose.",
                    "Do not wrap the IR inside keys such as output, result, "
                    "schema, data, patch, analysis, changes, or generated_ir. "
                    "The top-level object itself must be either the IR object "
                    "with version/bug/events/fsm/trigger, or an abort object.",
                    "The top-level object must contain a top-level trigger "
                    "object. The bug object may contain only name, key, and "
                    "description; never put bug_state, key_events, "
                    "sliced_events, or trigger metadata inside bug.",
                    "Transition action keys must be declared event names, never "
                    "state names. Bug states such as UAF or NPD are states, not "
                    "actions.",
                    "Always emit modeling, protocol_semantics, and "
                    "fsm.state_roles. Lowering never infers execution semantics "
                    "from bug name/key/description, event prose, or state "
                    "labels. Use protocol_semantics.guard_semantics for "
                    "nullable branch guards and exit_semantics for error-only "
                    "returns. Express action ordering directly in the FSM.",
                    "For alias use-after-free patterns, aliases are handled by "
                    "alias analysis. Use a real release/free Call event followed "
                    "by Use. Use CallFree only for direct memory deallocators; "
                    "for ownership-transfer APIs use OwnerRelease, "
                    "OwnerTransfer, OwnerTeardown, or a descriptive Call event "
                    "such as CallGiveback, CallRelease, or CallStop. Do not add "
                    "AllocRet unless the tracked object is a return value from "
                    "an allocator on the before-fix bug path.",
                    "Do not abort because an ownership-release binding needs an "
                    "argument-index correction. If the correct function and "
                    "tracked argument are visible, output the corrected "
                    "OwnerRelease/OwnerTransfer/OwnerTeardown IR.",
                    "For status-returning out-parameter APIs such as "
                    "request_firmware(&fw), use OutParamInit with a binding to "
                    "the out-parameter argument; do not model the int return as "
                    "Ret. OutParamInit is the safe-path source/init event; a "
                    "buggy path may use or clean up the pointer before that "
                    "event without needing AllocRet or BrNull.",
                    "When the bug is specifically that a may-fail producer's "
                    "status is ignored, use a descriptive Call event named "
                    "MayFailOutParam for the producer and UseOutParam for the "
                    "concrete consumer. Bind <indirect> only when the patch "
                    "actually calls through a function pointer.",
                    "For owner/container protocols, use OwnerFieldFree as the "
                    "Call event name only when a direct free consumes a value "
                    "loaded from an owner field and a later owner release can "
                    "run its callback. For Linux lists, use ListAdd/ListDel "
                    "Call names and ListNeighborLoad for next/prev recovery.",
                    "For NPD patterns, use AllocRet only for return-value "
                    "allocators and use Ref for dereference triggers.",
                    "For leak patterns, use Exit as the bug trigger when the "
                    "function still owns a resource at return. For "
                    "init-before-use/init-before-cleanup patterns, use "
                    "StoreInit, FieldStore, FieldStoreValue, FieldLoad, "
                    "FieldLoadValue, ListNeighborLoad, CountedByInit, or "
                    "StoreNull. For lock/atomic protocols, use "
                    "Lock, Unlock, or AtomicAccess rather than aborting just "
                    "because the patch mentions concurrency.",
                    "For managed lifetime double-free patterns, use "
                    "ManagedAlloc for devm_/dmam-managed allocator returns and "
                    "a concrete CallFree wrapper/manual-free event for the "
                    "framework or error-path free. The key chain may be "
                    "ManagedAlloc followed by CallFree.",
                    "For publish-before-complete/publish-before-init patterns, do not model the "
                    "publish API as a UAF release. Use CallPublish before the "
                    "required StoreInit, FieldStore, or CallFinalize event; the "
                    "bug is publishing before finalization. If the bug state is "
                    "UAF or the pattern's observable failure is a later use of "
                    "the prematurely published object, include Use in events, "
                    "trigger.key_events, and trigger.sliced_events after "
                    "CallPublish.",
                    "For __counted_by / fortify memcpy-order patterns, model "
                    "the counter assignment as CountedByInit or FieldStore and "
                    "the consuming memcpy/copy helper as a concrete Call event "
                    "or Use; this is an init-before-use protocol, not integer "
                    "range reasoning.",
                    "For retry/replay double-free patterns, a fix-only "
                    "StoreNull near the retry label is a safe reset, not a "
                    "bug key event. The double-free key chain remains two "
                    "CallFree-style events, and the transition from Freed on "
                    "the second CallFree must reach DoubleFree.",
                    "For completion/workqueue concurrency handoff patterns, "
                    "do not force a UAF shape unless the same slice has a real "
                    "release/free followed by a concrete Use. Prefer the v0.5 "
                    "lifecycle events QueueWork, WaitCompletion, WaitTimeout, "
                    "Complete, and CompletionDone, plus CallFree when memory "
                    "ownership is released.",
                    "For ordinary DOUBLE-FREE patterns: trigger.key_events "
                    "should start with two CallFree-style Call events (e.g. "
                    "[\"CallFree\", \"CallFree\"]). For managed lifetime "
                    "double-free patterns, use ManagedAlloc before CallFree "
                    "instead; do not invent a second explicit free when one "
                    "side is devres/device-managed cleanup. AllocRet must not "
                    "appear as a double-free key_event unless the pattern is "
                    "actually a raw allocator return. Do not reset Freed to "
                    "Init on the second CallFree; only StoreNull may reset a "
                    "Freed/stale pointer state to Init.",
                ]
            ),
        },
        {
            "role": "user",
            "content": "\n".join(
                [
                    "# Original grounded synthesis context",
                    prompt_context,
                    "",
                    "# Previous IR candidate",
                    "```json",
                    previous_json,
                    "```",
                    "",
                    "# Failure to repair",
                    failure_reason,
                    "",
                    "# Repair constraints",
                    "- Use only the event vocabulary supported by our IR v0.5.",
                    "- Do not invent assignment/alias events.",
                    "- Every transition action must be a declared event name.",
                    "- Every key event must appear in sliced_events.",
                    "- The key event chain must reach bug_state.",
                    "- Include explicit modeling, protocol_semantics, and "
                    "fsm.state_roles; descriptive text has no lowering effect.",
                    "- Put bug_state/key_events/sliced_events only in the top-level trigger object.",
                    "- Include merge rules that preserve danger states across Init joins.",
                    "",
                    "# Output",
                    "Return a corrected JSON object matching our IR v0.5, or "
                    "{\"abort\": \"...\"}.",
                ]
            ),
        },
    ]
    raw = llm.complete_json(messages, _IR_JSON_SCHEMA)
    return _validate_raw(raw, repaired=True)
