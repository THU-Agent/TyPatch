from __future__ import annotations

import re
from collections import deque
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

from .auto_extract import extract_from_patch
from .func_classifier import classify_func, is_direct_memory_free, REFCOUNT_PUT, QUEUE_PURGE, RESOURCE_LOOKUP
from .ir_schema import FUNCTION_BOUND_EVENT_KINDS, IR

# Fallback blacklist used when kernel_root is not available for grep-based classification.
_NON_FREE_FUNCS = {
    "of_node_put", "kobject_put", "put_device", "kref_put", "dev_put",
    "fwnode_handle_put", "module_put", "clk_put", "irq_put",
    "skb_queue_purge", "__skb_queue_purge", "skb_queue_purge_reason",
    "skb_queue_drain",
    "platform_get_resource", "platform_get_resource_byname",
    "v3d_job_cleanup", "hci_uart_close",
}

_DEALLOC_SINGLE_OBJECT_SKIP = {
    "kmem_cache_free_bulk",
}

_RELEASE_SEMANTIC_TOKENS = (
    "release",
    "giveback",
    "free",
    "destroy",
    "stop",
    "close",
    "put",
    "drop",
    "detach",
    "unregister",
    "dealloc",
    "teardown",
    "publish",
)

_GENERIC_EVENT_PREFIXES = ("AllocRet", "CallFree")
_GENERIC_EVENT_NAMES = {"Use", "Ref", "BrNull", "BrNonNull"}
_MANAGED_LIFETIME_EVENTS = {"ManagedAlloc"}
_FIELD_STATE_EVENTS = {
    "FieldStore",
    "FieldStoreValue",
    "FieldLoad",
    "FieldLoadValue",
    "StoreInit",
    "StoreNull",
    "OutParamInit",
    "CountedByInit",
}
_OWNER_RELEASE_EVENT_KINDS = {
    "OwnerRelease",
    "OwnerTransfer",
    "OwnerTeardown",
}
_ASYNC_LIFECYCLE_EVENTS = {
    "QueueWork",
    "WaitCompletion",
    "WaitTimeout",
    "Complete",
    "CompletionDone",
}
_CALL_NAME_RE = re.compile(r"\b([A-Za-z_]\w*)\s*\(")


@dataclass
class SanityFinding:
    check: str
    passed: bool
    code: str = ""
    details: List[str] = field(default_factory=list)


def check_reachability(ir: IR) -> SanityFinding:
    """Is `bug_state` reachable from `initial` via the transition graph?"""
    adj = {s: set() for s in ir.fsm.states}
    for src, outs in ir.fsm.transitions.items():
        for _, dst in outs.items():
            adj.setdefault(src, set()).add(dst)

    visited = {ir.fsm.initial}
    queue = deque([ir.fsm.initial])
    while queue:
        s = queue.popleft()
        for nxt in adj.get(s, ()):
            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)

    if ir.trigger.bug_state in visited:
        return SanityFinding(check="reachability", passed=True)
    return SanityFinding(
        check="reachability",
        passed=False,
        code="BUG_STATE_UNREACHABLE",
        details=[
            f"bug_state {ir.trigger.bug_state!r} is unreachable from initial "
            f"{ir.fsm.initial!r}; the .ts will never report a bug."
        ],
    )


def check_completeness(ir: IR) -> SanityFinding:
    """Every (state, sliced_event) pair should have an outgoing edge."""
    sliced = list(ir.trigger.sliced_events)
    missing: List[str] = []
    for s in ir.fsm.states:
        outs = ir.fsm.transitions.get(s, {})
        for ev in sliced:
            if ev not in outs:
                missing.append(f"({s}, {ev})")

    if not missing:
        return SanityFinding(check="completeness", passed=True)
    return SanityFinding(
        check="completeness",
        passed=False,
        code="MISSING_TRANSITION",
        details=missing,
    )


def check_key_event_path(ir: IR) -> SanityFinding:
    """Do trigger key events form an ordered path from initial to bug_state?"""
    if not ir.trigger.key_events:
        return SanityFinding(
            check="key_event_path",
            passed=False,
            code="EMPTY_KEY_EVENTS",
            details=["trigger.key_events is empty"],
        )

    state = ir.fsm.initial
    details: List[str] = []
    for ev in ir.trigger.key_events:
        outs = ir.fsm.transitions.get(state, {})
        if ev not in outs:
            details.append(f"missing transition ({state}, {ev})")
            return SanityFinding(
                check="key_event_path",
                passed=False,
                code="KEY_CHAIN_NOT_A_PATH",
                details=details,
            )
        state = outs[ev]

    if state != ir.trigger.bug_state:
        return SanityFinding(
            check="key_event_path",
            passed=False,
            code="KEY_CHAIN_NOT_BUG_TRIGGER",
            details=[
                f"key_events end in {state!r}, not bug_state {ir.trigger.bug_state!r}"
            ],
        )

    return SanityFinding(check="key_event_path", passed=True)


def check_key_events_are_sliced(ir: IR) -> SanityFinding:
    """Every key event must be retained by the downstream slice."""
    sliced = set(ir.trigger.sliced_events)
    missing = [ev for ev in ir.trigger.key_events if ev not in sliced]
    if not missing:
        return SanityFinding(check="key_events_sliced", passed=True)
    return SanityFinding(
        check="key_events_sliced",
        passed=False,
        code="KEY_EVENT_NOT_SLICED",
        details=[
            "key_events missing from trigger.sliced_events: "
            + ", ".join(missing)
        ],
    )


def check_uaf_shape(ir: IR) -> SanityFinding:
    """UAF checkers must be driven by a release/free followed by a use.

    The release event may be a direct memory free (`CallFree`) or another
    ownership-release call (for example URB giveback).  Do not force every UAF
    pattern into `CallFree`; that encourages generic `kfree`/`vfree` bindings
    for non-memory-release APIs.
    """
    bug_text = f"{ir.bug.key} {ir.bug.name} {ir.bug.description}".lower()
    if "uaf" not in bug_text and "use-after-free" not in bug_text:
        return SanityFinding(check="uaf_shape", passed=True)

    events_by_name = {event.name: event for event in ir.events}
    if "Use" not in events_by_name:
        if not _is_async_lifecycle_uaf(ir):
            return SanityFinding(
                check="uaf_shape",
                passed=False,
                code="UAF_MISSING_USE_EVENT",
                details=["Use"],
            )

    key_events = list(ir.trigger.key_events)
    sliced_events = set(ir.trigger.sliced_events)
    if _is_async_lifecycle_uaf(ir):
        missing = [
            event_name
            for event_name in key_events
            if event_name not in sliced_events
        ]
        if missing:
            return SanityFinding(
                check="uaf_shape",
                passed=False,
                code="ASYNC_UAF_KEY_NOT_SLICED",
                details=[
                    "async lifecycle key events must appear in trigger.sliced_events: "
                    + ", ".join(missing)
                ],
            )
        return SanityFinding(check="uaf_shape", passed=True)

    if "Use" not in key_events or "Use" not in sliced_events:
        return SanityFinding(
            check="uaf_shape",
            passed=False,
            code="UAF_KEY_OR_SLICE_MISSING_USE",
            details=[
                "Use must appear in trigger.key_events and trigger.sliced_events",
            ],
        )

    release_events = [
        event_name
        for event_name in key_events[: key_events.index("Use")]
        if event_name in events_by_name and _is_release_like_event(events_by_name[event_name])
    ]
    if not release_events:
        return SanityFinding(
            check="uaf_shape",
            passed=False,
            code="UAF_MISSING_RELEASE_BEFORE_USE",
            details=["UAF key_events must contain a Call release event before Use"],
        )

    missing_slice = [event_name for event_name in release_events if event_name not in sliced_events]
    if missing_slice:
        return SanityFinding(
            check="uaf_shape",
            passed=False,
            code="UAF_RELEASE_NOT_SLICED",
            details=[
                "release key events must appear in trigger.sliced_events: "
                + ", ".join(missing_slice)
            ],
        )

    non_free_release_events = [
        events_by_name[event_name]
        for event_name in release_events
        if not event_name.startswith("CallFree")
    ]
    weak_release_events = []
    for event in non_free_release_events:
        if event.kind in _OWNER_RELEASE_EVENT_KINDS:
            continue
        haystack = " ".join(
            [event.name, event.description, *(binding.func for binding in event.bindings)]
        ).lower()
        if not any(token in haystack for token in _RELEASE_SEMANTIC_TOKENS):
            weak_release_events.append(event.name)
    if weak_release_events:
        return SanityFinding(
            check="uaf_shape",
            passed=False,
            code="UAF_RELEASE_CALL_LACKS_SEMANTIC_ANCHOR",
            details=[
                "Non-CallFree UAF release calls must be semantically anchored "
                "as release/giveback/stop/destroy/etc.: "
                + ", ".join(weak_release_events)
            ],
        )

    return SanityFinding(check="uaf_shape", passed=True)


def _is_release_like_event(event) -> bool:
    if event.kind in _OWNER_RELEASE_EVENT_KINDS:
        return True
    return event.kind == "Call"


def _is_async_lifecycle_uaf(ir: IR) -> bool:
    """Completion/workqueue races can be lifecycle bugs without an explicit Use.

    A fix such as wait-for-completion timeout ownership handoff may be described
    as UAF in the commit message, but the visible protocol is queue/wait/free/
    complete. Requiring a generic `Use` event makes the model invent unstable IR
    for these cases.
    """
    key_events = set(ir.trigger.key_events)
    sliced_events = set(ir.trigger.sliced_events)
    if not (key_events | sliced_events) & _ASYNC_LIFECYCLE_EVENTS:
        return False
    if "CallFree" in key_events or "CallFree" in sliced_events:
        return True
    if key_events & {"QueueWork", "WaitCompletion", "WaitTimeout", "Complete"}:
        return True
    return False


def check_double_free_shape(ir: IR) -> SanityFinding:
    """Double-free checkers must be driven by two deallocator events."""
    bug_text = f"{ir.bug.key} {ir.bug.name} {ir.bug.description}".lower()
    if (
        "double_free" not in bug_text
        and "double-free" not in bug_text
        and "double free" not in bug_text
    ):
        return SanityFinding(check="double_free_shape", passed=True)

    event_names = {event.name for event in ir.events}
    event_kinds = {event.name: event.kind for event in ir.events}
    _RELEASE_KINDS = {"OwnerRelease", "OwnerTransfer", "OwnerTeardown"}
    has_free_style = (
        any(event_name.startswith("CallFree") for event_name in event_names)
        or any(event_kinds.get(n) in _RELEASE_KINDS for n in event_names)
        or any(
            any(kw in n.lower() for kw in ("free", "release", "put", "destroy", "drop", "unref"))
            for n in event_names
            if event_kinds.get(n) == "Call"
        )
    )
    if not has_free_style:
        return SanityFinding(
            check="double_free_shape",
            passed=False,
            code="DOUBLE_FREE_MISSING_CALLFREE_EVENT",
            details=["CallFree"],
        )

    events_by_name = {event.name: event for event in ir.events}
    key_events = list(ir.trigger.key_events)
    if len(key_events) < 2:
        return SanityFinding(
            check="double_free_shape",
            passed=False,
            code="DOUBLE_FREE_KEY_MISSING_SECOND_FREE",
            details=["trigger.key_events must contain two deallocator events"],
        )

    managed_key = (
        key_events[0] in _MANAGED_LIFETIME_EVENTS
        and key_events[1] in events_by_name
        and events_by_name[key_events[1]].kind == "Call"
        and key_events[1].startswith("CallFree")
    )
    if managed_key:
        missing_slice = [
            event_name
            for event_name in key_events[:2]
            if event_name not in set(ir.trigger.sliced_events)
        ]
        if missing_slice:
            return SanityFinding(
                check="double_free_shape",
                passed=False,
                code="MANAGED_DOUBLE_FREE_KEY_NOT_SLICED",
                details=[
                    "ManagedAlloc and CallFree must appear in trigger.sliced_events: "
                    + ", ".join(missing_slice)
                ],
            )
        return SanityFinding(check="double_free_shape", passed=True)

    field_state_key = (
        any(
            event_name in events_by_name
            and (
                events_by_name[event_name].kind in _FIELD_STATE_EVENTS
                or event_name in _FIELD_STATE_EVENTS
            )
            for event_name in key_events
        )
        and any(
            event_name in events_by_name
            and events_by_name[event_name].kind in FUNCTION_BOUND_EVENT_KINDS
            and event_name.startswith("CallFree")
            for event_name in key_events
        )
    )
    if field_state_key:
        missing_slice = [
            event_name
            for event_name in key_events
            if event_name not in set(ir.trigger.sliced_events)
        ]
        if missing_slice:
            return SanityFinding(
                check="double_free_shape",
                passed=False,
                code="FIELD_STATE_FREE_KEY_NOT_SLICED",
                details=[
                    "field-state free key events must appear in trigger.sliced_events: "
                    + ", ".join(missing_slice)
                ],
            )
        return SanityFinding(check="double_free_shape", passed=True)

    # Ownership-release events are semantically equivalent to a second free
    _FREE_STYLE_KINDS = {"Call", "OwnerRelease", "OwnerTransfer", "OwnerTeardown"}

    first_two = key_events[:2]
    bad_events = []
    for event_name in first_two:
        if event_name not in events_by_name:
            bad_events.append(event_name)
            continue
        ev = events_by_name[event_name]
        # Accept CallFree-prefixed Call events
        if ev.kind == "Call" and event_name.startswith("CallFree"):
            continue
        # Accept ownership-release/transfer/teardown events as deallocators
        if ev.kind in _FREE_STYLE_KINDS and ev.kind != "Call":
            continue
        # Accept Call events with free/release/put/destroy/drop in name
        if ev.kind == "Call" and any(
            kw in event_name.lower()
            for kw in ("free", "release", "put", "destroy", "drop", "teardown", "unref", "close", "remove")
        ):
            continue
        bad_events.append(event_name)
    if bad_events:
        return SanityFinding(
            check="double_free_shape",
            passed=False,
            code="DOUBLE_FREE_KEY_NOT_TWO_FREE_CALLS",
            details=[
                "the first two trigger.key_events must be CallFree-style Call events",
                "bad events: " + ", ".join(bad_events),
            ],
        )

    missing_slice = [
        event_name
        for event_name in first_two
        if event_name not in set(ir.trigger.sliced_events)
    ]
    if missing_slice:
        return SanityFinding(
            check="double_free_shape",
            passed=False,
            code="DOUBLE_FREE_CALLFREE_NOT_SLICED",
            details=[
                "deallocator key events must appear in trigger.sliced_events: "
                + ", ".join(missing_slice)
            ],
        )

    return SanityFinding(check="double_free_shape", passed=True)


def check_patch_anchored_shape(ir: IR, patch_diff: Optional[str]) -> SanityFinding:
    """Reject key events that are not supported by the patch evidence."""
    if not patch_diff:
        return SanityFinding(check="patch_anchored_shape", passed=True)

    bug_text = f"{ir.bug.key} {ir.bug.name} {ir.bug.description}".lower()
    if "uaf" not in bug_text and "use-after-free" not in bug_text:
        return SanityFinding(check="patch_anchored_shape", passed=True)

    extracted = extract_from_patch(patch_diff)
    context_deallocators = _context_direct_deallocators(patch_diff)
    has_deallocator_evidence = bool(extracted["deallocators"] or context_deallocators)
    has_allocator_evidence = bool(extracted["allocators"])
    alloc_required = any(
        event_name.startswith("AllocRet") for event_name in ir.trigger.key_events
    )

    if has_deallocator_evidence and not has_allocator_evidence and alloc_required:
        return SanityFinding(
            check="patch_anchored_shape",
            passed=False,
            code="UAF_ALLOCRET_REQUIRED_WITHOUT_ALLOCATOR_EVIDENCE",
            details=[
                "The patch contains deallocator movement/removal evidence but "
                "no return-value allocator evidence; UAF key_events should not "
                "require AllocRet for this pattern.",
                "deallocators: " + ", ".join(extracted["deallocators"]),
            ],
        )

    # If synthesis invented a direct CallFree event but the patch evidence does not
    # contain a free/deallocator, it is probably modeling an ownership-release
    # API (e.g. usb_hcd_giveback_urb) as generic kfree/vfree.  Reject this so the
    # repair pass can either use a descriptive CallRelease/CallGiveback event or
    # abort honestly.
    if (
        any(event_name.startswith("CallFree") for event_name in ir.trigger.key_events)
        and not has_deallocator_evidence
    ):
        return SanityFinding(
            check="patch_anchored_shape",
            passed=False,
            code="UAF_CALLFREE_WITHOUT_PATCH_DEALLOCATOR_EVIDENCE",
            details=[
                "UAF rule uses CallFree, but patch extraction found no "
                "direct deallocator evidence. Use a descriptive Call release "
                "event for ownership-transfer APIs, or abort if v0.2 cannot "
                "model the release."
            ],
        )

    return SanityFinding(check="patch_anchored_shape", passed=True)


def _context_direct_deallocators(patch_diff: str) -> list[str]:
    """Find direct-free calls that appear in hunk context.

    Some UAF fixes add a lock/guard around an existing free rather than moving
    or adding the free itself.  In those cases the deallocator is visible only
    as unchanged hunk context, but it is still legitimate grounding for a
    CallFree event.
    """
    names: set[str] = set()
    for line in patch_diff.splitlines():
        if not line or line[0] not in {" ", "+", "-"}:
            continue
        if line.startswith(("+++", "---")):
            continue
        text = line[1:]
        for match in _CALL_NAME_RE.finditer(text):
            func = match.group(1)
            if is_direct_memory_free(func):
                names.add(func)
    return sorted(names)


def check_merge_conflicts(ir: IR) -> SanityFinding:
    """Same (a, b) state pair must appear at most once."""
    seen: dict = {}
    for m in ir.fsm.merges:
        key = (min(m.a, m.b), max(m.a, m.b))
        if key in seen:
            if seen[key] == m.result:
                detail = f"({m.a}, {m.b}) -> {m.result!r} appears more than once"
                code = "DUPLICATE_MERGE_PAIR"
            else:
                detail = f"({m.a}, {m.b}) -> both {seen[key]!r} and {m.result!r}"
                code = "CONFLICTING_MERGE_RULES"
            return SanityFinding(
                check="merge_conflicts",
                passed=False,
                code=code,
                details=[detail],
            )
        seen[key] = m.result
    return SanityFinding(check="merge_conflicts", passed=True)


def check_bug_state_absorbing(ir: IR) -> SanityFinding:
    """Bug state must self-loop on every sliced event (no exit transitions)."""
    bug = ir.trigger.bug_state
    outs = ir.fsm.transitions.get(bug, {})
    bad = [
        f"{bug} --{ev}--> {outs[ev]}"
        for ev in ir.trigger.sliced_events
        if ev in outs and outs[ev] != bug
    ]
    if bad:
        return SanityFinding(
            check="bug_state_absorbing",
            passed=False,
            code="BUG_STATE_HAS_EXIT_TRANSITION",
            details=bad,
        )
    return SanityFinding(check="bug_state_absorbing", passed=True)


def check_callfree_semantics(
    ir: IR, kernel_root: Optional[Path] = None
) -> SanityFinding:
    """CallFree bindings must be single-object memory-release functions."""
    for ev in ir.events:
        if ev.kind not in FUNCTION_BOUND_EVENT_KINDS or not ev.name.startswith("CallFree"):
            continue
        bad = [
            b.func
            for b in ev.bindings
            if b.func in _NON_FREE_FUNCS
            or b.func in _DEALLOC_SINGLE_OBJECT_SKIP
            or kernel_root and classify_func(b.func, kernel_root) in (REFCOUNT_PUT, QUEUE_PURGE, RESOURCE_LOOKUP)
        ]
        if bad:
            return SanityFinding(
                check="callfree_semantics",
                passed=False,
                code="CALLFREE_BINDS_NON_FREE_FUNC",
                details=[
                    f"{ev.name} binds non-single-object-memory-free function(s): "
                    + ", ".join(bad)
                ],
            )
    return SanityFinding(check="callfree_semantics", passed=True)


def check_npd_source_required(ir: IR) -> SanityFinding:
    """NPD rules must have a real source event (not Any --Ref--> NPD directly)."""
    bug_text = f"{ir.bug.key} {ir.bug.name}".lower()
    if "npd" not in bug_text and "null" not in bug_text:
        return SanityFinding(check="npd_source_required", passed=True)
    if any(event.kind == "OutParamInit" for event in ir.events):
        return SanityFinding(check="npd_source_required", passed=True)
    # Check if Any/Init directly transitions to bug_state on Ref without a source
    bug = ir.trigger.bug_state
    init_outs = ir.fsm.transitions.get(ir.fsm.initial, {})
    any_outs = ir.fsm.transitions.get("Any", {})
    for ev, dst in {**any_outs, **init_outs}.items():
        if dst == bug and ev in ("Ref", "Use"):
            return SanityFinding(
                check="npd_source_required",
                passed=False,
                code="NPD_NO_SOURCE_EVENT",
                details=[f"{ir.fsm.initial}/Any --{ev}--> {bug}: NPD needs a source event (AllocRet/BrNull/etc.) before Ref"],
            )
    return SanityFinding(check="npd_source_required", passed=True)


def check_npd_null_guard_direction(ir: IR) -> SanityFinding:
    """Reject NULL-edge guards that incorrectly make a nullable value safe.

    BrNull is emitted on the CFG edge where the checked value is NULL.  Merely
    observing that edge cannot make a later dereference/use safe; the safe
    continuation after patterns such as ``if (!ptr) return`` is BrNonNull.
    """
    bug_text = f"{ir.bug.key} {ir.bug.name} {ir.bug.description}".lower()
    if "npd" not in bug_text and "null" not in bug_text:
        return SanityFinding(check="npd_null_guard_direction", passed=True)

    event_kinds = {event.name: event.kind for event in ir.events}
    key_events = ir.trigger.key_events
    if len(key_events) != 2:
        return SanityFinding(check="npd_null_guard_direction", passed=True)

    source, sink = key_events
    if not (
        source.startswith("AllocRet")
        and event_kinds.get(source) == "Ret"
        and event_kinds.get(sink) in {"Use", "Ref"}
        and "BrNull" in event_kinds
    ):
        return SanityFinding(check="npd_null_guard_direction", passed=True)

    transitions = ir.fsm.transitions
    post_source = transitions.get(ir.fsm.initial, {}).get(source)
    if not post_source:
        return SanityFinding(check="npd_null_guard_direction", passed=True)
    if transitions.get(post_source, {}).get(sink) != ir.trigger.bug_state:
        return SanityFinding(check="npd_null_guard_direction", passed=True)

    post_null = transitions.get(post_source, {}).get("BrNull")
    if not post_null:
        return SanityFinding(check="npd_null_guard_direction", passed=True)
    if transitions.get(post_null, {}).get(sink) == ir.trigger.bug_state:
        return SanityFinding(check="npd_null_guard_direction", passed=True)

    return SanityFinding(
        check="npd_null_guard_direction",
        passed=False,
        code="NPD_BRNULL_SUPPRESSES_NULL_PATH",
        details=[
            "BrNull is the CFG edge on which the tracked return value is NULL, "
            f"but {post_source} --BrNull--> {post_null} suppresses a later "
            f"{sink} report. Use BrNonNull for the safe continuation; a NULL "
            "edge may exit, but it must not make a later dereference safe."
        ],
    )


def check_rule_specificity(ir: IR) -> SanityFinding:
    """Reject overly broad, low-complexity generic allocator/null rules."""
    if len(ir.fsm.states) >= 4:
        return SanityFinding(check="rule_specificity", passed=True)

    alloc_ret_events = [event for event in ir.events if event.name.startswith("AllocRet")]
    if not any(len(event.funcs) > 5 or len(event.bindings) > 5 for event in alloc_ret_events):
        return SanityFinding(check="rule_specificity", passed=True)

    domain_events = [
        event.name
        for event in ir.events
        if event.name not in _GENERIC_EVENT_NAMES
        and not event.name.startswith(_GENERIC_EVENT_PREFIXES)
    ]
    if domain_events:
        return SanityFinding(check="rule_specificity", passed=True)

    return SanityFinding(
        check="rule_specificity",
        passed=False,
        code="RULE_TOO_BROAD_LOW_COMPLEXITY",
        details=[
            "FSM has fewer than 4 states, AllocRet has more than 5 funcs/bindings, "
            "and the rule has no domain-specific events."
        ],
    )


def _event_is_anchored(event) -> bool:
    if event.object or event.api_contract or event.role:
        return True
    if event.kind == "Ret" and event.funcs:
        return True
    if event.kind in FUNCTION_BOUND_EVENT_KINDS and event.bindings:
        return True
    return False


def check_generic_action_anchoring(ir: IR) -> SanityFinding:
    """Reject rules driven only by unbound backend-global actions.

    Backend-global singleton events such as Use, StoreNull, and AtomicAccess are
    useful only when another event anchors the object or protocol. Without that
    anchor, a synthesized rule degenerates into "report ordinary code shape
    anywhere in the kernel".
    """
    bug_text = f"{ir.bug.key} {ir.bug.name} {ir.bug.description}".lower()
    if "uninit" in bug_text or "uninitialized" in bug_text:
        return SanityFinding(check="generic_action_anchoring", passed=True)
    if _is_async_lifecycle_uaf(ir):
        return SanityFinding(check="generic_action_anchoring", passed=True)

    events_by_name = {event.name: event for event in ir.events}
    anchored_events = [
        event.name for event in ir.events if _event_is_anchored(event)
    ]
    if anchored_events:
        return SanityFinding(check="generic_action_anchoring", passed=True)

    event_kinds = {
        events_by_name[name].kind
        for name in ir.trigger.key_events
        if name in events_by_name
    }
    broad_key_kinds = {
        "Use",
        "Ref",
        "StoreNull",
        "StoreInit",
        "FieldStore",
        "FieldLoad",
        "AtomicAccess",
    }
    source_anchor_kinds = {
        "AllocRet",
        "OutParamInit",
        "OptionalResourceRet",
        "ManagedAlloc",
        "CountedByInit",
    }
    # BrNull / BrNonNull are deliberately excluded: they describe a check on an
    # already-tracked object, not an entry point that starts tracking.  A rule
    # with only BrNull/BrNonNull/Ref and no Call/Ret/OutParamInit/ManagedAlloc
    # has no way to identify which object to trace.

    has_source_anchor = any(
        event.kind in source_anchor_kinds
        or event.name.startswith("AllocRet")
        or event.name.startswith("OptionalResourceRet")
        for event in ir.events
    )
    if ("npd" in bug_text or "null" in bug_text) and not has_source_anchor:
        return SanityFinding(
            check="generic_action_anchoring",
            passed=False,
            code="NPD_RULE_LACKS_ANCHORED_SOURCE",
            details=[
                "NPD/null rules driven by StoreNull/Use/Ref need an anchored "
                "source such as AllocRet, BrNull/BrNonNull, OutParamInit, "
                "or explicit object/API metadata."
            ],
        )

    if event_kinds and event_kinds.issubset(broad_key_kinds):
        return SanityFinding(
            check="generic_action_anchoring",
            passed=False,
            code="UNANCHORED_GENERIC_KEY_EVENTS",
            details=[
                "trigger.key_events are only backend-global singleton actions "
                f"({', '.join(sorted(event_kinds))}) and no event has function, "
                "object, role, or API-contract anchoring."
            ],
        )

    return SanityFinding(check="generic_action_anchoring", passed=True)


def run_sanity(
    ir: IR,
    patch_diff: Optional[str] = None,
    kernel_root: Optional[Path] = None,
) -> List[SanityFinding]:
    findings = [
        check_reachability(ir),
        check_key_event_path(ir),
        check_key_events_are_sliced(ir),
        check_uaf_shape(ir),
        check_double_free_shape(ir),
        check_completeness(ir),
        check_merge_conflicts(ir),
        check_bug_state_absorbing(ir),
        check_callfree_semantics(ir, kernel_root),
        check_npd_source_required(ir),
        check_npd_null_guard_direction(ir),
        check_rule_specificity(ir),
        check_generic_action_anchoring(ir),
    ]
    if patch_diff is not None:
        findings.append(check_patch_anchored_shape(ir, patch_diff))
    return findings
