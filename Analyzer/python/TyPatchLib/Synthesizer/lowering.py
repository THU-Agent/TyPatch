"""IR → `.ts` JSON.
"""

from __future__ import annotations

from copy import deepcopy
import re
from typing import Any, Dict, List

from .ir_schema import FUNCTION_BOUND_EVENT_KINDS, IR, Merge


INIT = "Init"
ANY = "Any"
UNINIT = "Uninit"
UNTRACKED = "Untracked"
_LEGACY_IR_VERSIONS = {"0.3", "0.4"}
_LEGACY_SAFE_STATE_TOKENS = ("nonnull", "safe", "ready", "valid", "checked")

_NON_CALL_KINDS = (
    "Use",
    "Ref",
    "BrNull",
    "BrNonNull",
    "Exit",
    "ErrExit",
    "StoreNull",
    "StoreInit",
    "FieldStore",
    "FieldStoreValue",
    "FieldLoad",
    "FieldLoadValue",
    "ListNeighborLoad",
    "Lock",
    "Unlock",
    "AtomicAccess",
    "ManagedAlloc",
    "QueueWork",
    "WaitCompletion",
    "WaitTimeout",
    "Complete",
    "CompletionDone",
    "CountedByInit",
)


_TRACK_OBJECT_KINDS = {
    "local_auto_scalar",
    "local_auto_int",
    "local_auto_integer",
    "local_auto_nonparam_int",
    "local_auto_nonparam_integer",
    "local_auto_ptr",
    "local_auto_pointer",
    "local_auto_float",
    "local_auto_floating",
    "local_cleanup_ptr",
    "local_cleanup_pointer",
    "local_named_scalar",
    "local_named_int",
    "local_named_integer",
    "local_named_nonparam_int",
    "local_named_nonparam_integer",
    "local_named_ptr",
    "local_named_pointer",
    "local_named_cleanup_ptr",
    "local_named_cleanup_pointer",
    "local_named_float",
    "local_named_floating",
    "local_auto_field_scalar",
    "local_named_field_scalar",
    "local_auto_array_elem_scalar",
    "local_auto_dynamic_array_elem_scalar",
    "local_named_array_elem_scalar",
    "local_named_dynamic_array_elem_scalar",
    "local_auto_aggregate_scalar",
    "local_named_aggregate_scalar",
}


def auto_complete_transitions(ir: IR) -> IR:
    """Fill in missing (state, sliced_event) transitions with self-loops."""
    ir = deepcopy(ir)
    sliced = set(ir.trigger.sliced_events)
    for state in ir.fsm.states:
        outs = ir.fsm.transitions.setdefault(state, {})
        for ev in sliced:
            if ev not in outs:
                outs[ev] = state  # self-loop: event doesn't change state
    return ir


def _uses_legacy_semantics(ir: IR) -> bool:
    """Whether an old stored IR needs the pre-v0.5 compatibility contract."""

    return ir.version in _LEGACY_IR_VERSIONS


def _has_explicit_protocol_semantics(ir: IR) -> bool:
    return "protocol_semantics" in ir.model_fields_set


def _legacy_bug_text(ir: IR) -> str:
    return f"{ir.bug.key} {ir.bug.name} {ir.bug.description}".lower()


def _effective_uninit(ir: IR) -> bool:
    """Select typed semantics, with a version-gated stored-IR fallback."""
    if ir.modeling is not None:
        return ir.modeling == "scalar_uninit_use"
    if not _uses_legacy_semantics(ir):
        return False
    text = _legacy_bug_text(ir)
    return "uninit" in text or "uninitialized" in text


def _is_counted_by_init_order_rule(ir: IR) -> bool:
    has_count_init = any(ev.kind == "CountedByInit" for ev in ir.events)
    has_sink_call = any(
        ev.kind == "Call" and ev.role == "sink" for ev in ir.events
    )
    if (
        not has_sink_call
        and _uses_legacy_semantics(ir)
        and not any(ev.role for ev in ir.events)
    ):
        has_sink_call = any(
            ev.kind == "Call" and ev.name == "CallCopy" for ev in ir.events
        )
    return has_count_init and has_sink_call


def _requires_same_function_report(ir: IR) -> bool:
    """Keep every source-to-Exit report inside its owning function.

    Interprocedural traversal can encounter a callee return after observing a
    source in the caller.  That return is not the caller's leak boundary, no
    matter which event kind represented the source, so source-kind allowlists
    are unsafe here.
    """
    key_events = ir.trigger.key_events
    return "Exit" in key_events and any(name != "Exit" for name in key_events)


def _uses_error_path_exit(ir: IR) -> bool:
    if "Exit" not in ir.trigger.key_events:
        return False
    if _has_explicit_protocol_semantics(ir):
        return ir.protocol_semantics.exit_semantics == "error_return"
    if not _uses_legacy_semantics(ir):
        return False
    text = _legacy_bug_text(ir)
    return "error_path" in text or "error path" in text or "error-path" in text


def _suppress_err_exit_returned_call_actions(ir: IR, use_error_exit: bool) -> List[str]:
    if not use_error_exit:
        return []
    event_kinds = {ev.name: ev.kind for ev in ir.events}
    suppressions: List[str] = []
    seen = set()
    for ev_name in ir.context.start_events:
        if event_kinds.get(ev_name) not in FUNCTION_BOUND_EVENT_KINDS | {"Ret"}:
            continue
        if ev_name in seen:
            continue
        suppressions.append(ev_name)
        seen.add(ev_name)
    return suppressions


def _is_bare_scalar_uninit_rule(ir: IR) -> bool:
    if not _effective_uninit(ir):
        return False
    event_kinds = {ev.name: ev.kind for ev in ir.events}
    return (
        ir.trigger.key_events == ["Use"]
        and set(ir.trigger.sliced_events).issubset({"StoreInit", "Use"})
        and event_kinds.get("Use") == "Use"
        and event_kinds.get("StoreInit") == "StoreInit"
    )


def _is_alloc_ret_use_rule(ir: IR) -> bool:
    by_name = {ev.name: ev for ev in ir.events}
    event_kinds = {ev.name: ev.kind for ev in ir.events}
    key_events = ir.trigger.key_events
    if _has_explicit_protocol_semantics(ir):
        nullable_guard = (
            ir.protocol_semantics.guard_semantics == "nonnull_branch"
        )
    else:
        nullable_guard = (
            _uses_legacy_semantics(ir)
            and any(
                ev.kind in {"BrNull", "BrNonNull"} for ev in ir.events
            )
        )
    return (
        nullable_guard
        and len(key_events) == 2
        and event_kinds.get(key_events[0]) == "Ret"
        and event_kinds.get(key_events[1]) == "Use"
        and by_name[key_events[0]].role in {None, "source", "acquire"}
        and by_name[key_events[1]].role in {None, "sink"}
    )


def _is_branch_null_deref_rule(ir: IR) -> bool:
    event_kinds = {ev.kind for ev in ir.events}
    if _has_explicit_protocol_semantics(ir):
        has_guard_semantics = (
            ir.protocol_semantics.guard_semantics == "nonnull_branch"
        )
    else:
        # BrNull/BrNonNull are already typed null-guard events. This structural
        # fallback preserves stored IRs without consulting bug prose.
        has_guard_semantics = bool({"BrNull", "BrNonNull"} & event_kinds)
    return (
        has_guard_semantics
        and "BrNull" in event_kinds
        and "Ref" in event_kinds
    )


def _explicit_track_objects(ir: IR) -> List[str]:
    kinds: List[str] = []
    seen = set()
    for ev in ir.events:
        if not ev.object:
            continue
        raw = ev.object.get("track_objects")
        if isinstance(raw, str):
            raw = [raw]
        if not isinstance(raw, list):
            continue
        for item in raw:
            if not isinstance(item, str):
                continue
            kind = item.lower()
            if kind not in _TRACK_OBJECT_KINDS or kind in seen:
                continue
            kinds.append(kind)
            seen.add(kind)
    return kinds


_USE_SINK_SOURCES = {
    "return": "load_return",
    "ret": "load_return",
    "branch": "load_branch",
    "condition": "load_branch",
    "load": "load",
}


def _explicit_use_sources(ir: IR) -> List[str]:
    sources: List[str] = []
    seen = set()
    for ev in ir.events:
        if ev.name != "Use" or not ev.object:
            continue
        raw = ev.object.get("use_sinks")
        if isinstance(raw, str):
            raw = [raw]
        if not isinstance(raw, list):
            continue
        for item in raw:
            if not isinstance(item, str):
                continue
            source = _USE_SINK_SOURCES.get(item.lower())
            if not source or source in seen:
                continue
            sources.append(source)
            seen.add(source)
    return sources


def _binding_target(binding: Any) -> Dict[str, Any]:
    target = {"func_name": binding.func, "arg_idx": binding.arg}
    field_path = binding.field_path or binding.field_name or binding.field
    if field_path:
        target["field_path"] = field_path
    return target


def _has_field_binding(ir: IR) -> bool:
    for ev in ir.events:
        for binding in ev.bindings:
            if binding.field_path or binding.field_name or binding.field:
                return True
    return False


def auto_add_init_merges(ir: IR) -> IR:
    """Conservatively preserve danger states across Init joins.

    The analyzer falls back to Init when no merge rule matches.  Synthesized
    rules frequently omit the standard ``Init + Danger -> Danger`` merge, which
    drops temporal state at branch joins and causes false negatives. Add that
    merge only for states explicitly typed as danger/unknown; state labels are
    descriptive metadata and never select execution semantics.
    """
    ir = deepcopy(ir)
    if _effective_uninit(ir):
        return ir
    existing = {(m.a, m.b, m.result) for m in ir.fsm.merges}
    existing |= {(m.b, m.a, m.result) for m in ir.fsm.merges}

    for state in ir.fsm.states:
        if state in {INIT, ir.trigger.bug_state}:
            continue
        role = ir.fsm.state_roles.get(state)
        if role is not None:
            if role not in {"danger", "unknown"}:
                continue
        elif _uses_legacy_semantics(ir) and not ir.fsm.state_roles:
            lowered = state.lower()
            if any(token in lowered for token in _LEGACY_SAFE_STATE_TOKENS):
                continue
        else:
            continue
        merge = (INIT, state, state)
        if merge not in existing:
            ir.fsm.merges.append(Merge(a=INIT, b=state, result=state))
            existing.add(merge)
            existing.add((state, INIT, state))
    return ir


def _rewrite_init(s: str) -> str:
    return ANY if s == INIT else s


def lower(ir: IR) -> Dict[str, Any]:
    uninit_rule = _effective_uninit(ir)
    protocol_rule = ir.modeling == "typestate_protocol"
    alloc_ret_use_rule = _is_alloc_ret_use_rule(ir)
    branch_null_deref_rule = _is_branch_null_deref_rule(ir)
    use_error_exit = _uses_error_path_exit(ir)
    initial_state = (
        UNINIT if uninit_rule else UNTRACKED if protocol_rule else INIT
    )

    def rewrite_state(s: str) -> str:
        if s != INIT:
            return s
        if uninit_rule or protocol_rule:
            return initial_state
        return ANY

    def rewrite_action_name(name: str) -> str:
        if use_error_exit and name == "Exit":
            return "ErrExit"
        return name

    # state list: drop legacy "Init"; engine uses "Any" as wildcard for
    # non-uninit rules.  Uninitialized-scalar rules need a real initial state,
    # because "uninitialized" is not a neutral/default state at CFG joins.
    states: List[str] = []
    if uninit_rule or protocol_rule:
        states.append(initial_state)
    for state in ir.fsm.states:
        lowered_state = rewrite_state(state)
        if lowered_state == ANY:
            continue
        if lowered_state not in states:
            states.append(lowered_state)

    # action.Call: array of single-key dicts (matches loadFromJson layout).
    call_groups: List[Dict[str, List[Dict[str, Any]]]] = []
    ret_groups: List[Dict[str, List[str]]] = []
    non_call_present: Dict[str, bool] = {k: False for k in _NON_CALL_KINDS}
    for ev in ir.events:
        if ev.kind in FUNCTION_BOUND_EVENT_KINDS:
            call_groups.append({
                ev.name: [
                    _binding_target(b)
                    for b in ev.bindings
                ]
            })
        elif ev.kind == "Ret":
            ret_groups.append({ev.name: list(ev.funcs)})
        else:
            action_kind = rewrite_action_name(ev.name) if ev.kind == "Exit" else ev.kind
            non_call_present[action_kind] = True

    action: Dict[str, Any] = {}
    if call_groups:
        action["Call"] = call_groups
    if ret_groups:
        action["Ret"] = ret_groups
    for kind in _NON_CALL_KINDS:
        if non_call_present[kind]:
            action[kind] = []

    transition: List[Dict[str, str]] = []
    raw: List[Dict[str, str]] = []
    for src, outs in ir.fsm.transitions.items():
        for ev_name, dst in outs.items():
            raw.append({
                "curr_state": rewrite_state(src),
                "action":     rewrite_action_name(ev_name),
                "next_state": rewrite_state(dst),
            })
    # Order transitions from most specific to least specific:
    # non-Any source states first, Any-sourced last. Within each group,
    # non-self-loops first, self-loops last. This prevents the engine's
    # linear transition scan from matching a general self-loop before a
    # specific bug-path transition.
    def _transition_key(t: Dict[str, str]) -> tuple:
        src_any = 1 if t["curr_state"] == ANY else 0
        self_loop = 1 if t["curr_state"] == t["next_state"] else 0
        return (src_any, self_loop)
    transition = sorted(raw, key=_transition_key)

    merge: List[Dict[str, str]] = []
    for m in ir.fsm.merges:
        if uninit_rule and INIT in {m.a, m.b, m.result}:
            continue
        merge.append({
            "curr_state1": rewrite_state(m.a),
            "curr_state2": rewrite_state(m.b),
            "merge_state": rewrite_state(m.result),
        })

    lowered = {
        "state":         states,
        "action":        action,
        "transition":    transition,
        "merge":         merge,
        "bug": {
            "name":        ir.bug.name,
            "key":         ir.bug.key,
            "key_actions": [rewrite_action_name(ev) for ev in ir.trigger.key_events],
            "bug_state":   ir.trigger.bug_state,
        },
        "sliced_action": [rewrite_action_name(ev) for ev in ir.trigger.sliced_events],
        "context": {
            "start_action": [rewrite_action_name(ev) for ev in ir.context.start_events],
            "end_action":   [rewrite_action_name(ev) for ev in ir.context.end_events],
        },
        "analysis": {
            # Preserve temporal evidence at branch joins unless an explicit
            # merge rule says otherwise.  The backend also supports
            # legacy_init and preserve_danger for controlled ablations.
            "merge_default": "must_init" if uninit_rule else "preserve_non_init",
            "initial_state": initial_state,
            # Experimental recall knob for uninit rules.  The C++
            # backend only applies this to local scalar slots so return-loads
            # such as `return err` are visible without treating every field load
            # as a scalar status use.
            "load_as_use": uninit_rule,
            "store_zero_as_init": uninit_rule,
            # Treat direct local scalar address-passing to ordinary calls as
            # out-parameter initialization for uninit rules. This suppresses
            # weak reports such as `helper(..., &ret); return ret;` where the
            # backend lacks a named OutParamInit contract.
            "call_outparam_as_init": uninit_rule,
            # Local uninit rules track stack slots in one function. Running
            # them on the interprocedural CFG lets call/return edges enter a
            # function after its local initializers and creates false paths.
            "intra_procedural_cfg": uninit_rule,
            # When load_as_use is enabled for uninit rules, suppress the
            # generic Use events from call args, store values, and arithmetic
            # operands. Those uses are normally preceded by a scalar load, which
            # is the narrower event we want to track.
            "use_load_only": uninit_rule,
        },
    }
    if _has_field_binding(ir) and "Exit" in ir.trigger.sliced_events:
        lowered["analysis"]["intra_procedural_cfg"] = True
        lowered["analysis"]["disable_slice"] = True
    if branch_null_deref_rule:
        lowered["analysis"]["suppress_condition_builder_branches"] = True
    suppress_err_exit_actions = _suppress_err_exit_returned_call_actions(
        ir,
        use_error_exit,
    )
    if suppress_err_exit_actions:
        lowered["analysis"]["suppress_err_exit_on_returned_call_actions"] = (
            suppress_err_exit_actions
        )
    if _is_counted_by_init_order_rule(ir):
        lowered["analysis"]["min_report_unique_actions"] = max(
            int(lowered["analysis"].get("min_report_unique_actions", 0)),
            2,
        )
    if _requires_same_function_report(ir):
        lowered["analysis"]["report_key_actions_same_function"] = True
        # Caller continuation after an inline/helper call can be labelled as
        # CallBypassLoop by the interprocedural CFG. Keep the acyclic-safe
        # subset so the tracked source can still reach its owning Exit.
        lowered["analysis"]["keep_call_bypass_loop"] = True
    if uninit_rule:
        lowered["analysis"]["backend"] = "fs"
        if _is_bare_scalar_uninit_rule(ir):
            lowered["analysis"]["action_sources"] = {
                "Use": _explicit_use_sources(ir) or ["load_return"]
            }
        else:
            lowered["analysis"]["action_sources"] = {"Use": ["load"]}
        track_objects = (
            ["local_named_nonparam_int"]
            if _is_bare_scalar_uninit_rule(ir)
            else []
        )
        for kind in _explicit_track_objects(ir):
            if kind not in track_objects:
                track_objects.append(kind)
        if track_objects:
            lowered["analysis"]["track_objects"] = track_objects
    elif alloc_ret_use_rule:
        lowered["analysis"]["action_sources"] = {
            "Use": ["call_arg", "binary_operand", "unary_operand"]
        }

    # Path-sensitive backend knobs, injected by bug shape so scans run
    # end-to-end without manual rule editing. Both features fail open
    # (uncertainty keeps the report).
    key_actions = lowered["bug"]["key_actions"]
    if (not uninit_rule
            and len(key_actions) == 2
            and key_actions[0] == key_actions[1]):
        # "Same operation twice" shape (double-free/double-release): the
        # report-time path-replay verifier can engage on these reports.
        # Uninit rules are excluded: their Use/Use reports are too numerous
        # and would only burn verifier budget (every one kept fail-open).
        lowered["analysis"]["path_sensitive_verify"] = True

    # IR v0.5 path semantics describe witness requirements rather than raw
    # backend switches. Map that semantic contract to one backend knob
    # bundle here so prompts/repair loops cannot tune budgets or pruning.
    path_semantics = ir.path_semantics
    if path_semantics and path_semantics.require_same_path:
        lowered["analysis"].update({
            "backend": "tdfs",
            "keep_call_bypass_loop": True,
            "path_sensitive_verify": True,
        })
        source_actions = list(ir.context.start_events)
        if not source_actions and ir.trigger.key_events:
            source_actions = [ir.trigger.key_events[0]]
        if source_actions:
            lowered["analysis"]["source_actions"] = [
                rewrite_action_name(name) for name in source_actions
            ]
            lowered["analysis"]["start_policy"] = "on_source_action"
        if len(set(key_actions)) >= 2:
            lowered["analysis"]["min_report_unique_actions"] = max(
                int(lowered["analysis"].get("min_report_unique_actions", 0)),
                2,
            )
        if path_semantics.source_visibility == "branch_local":
            lowered["analysis"]["path_sensitive_candidate_generation"] = True
        if path_semantics.require_distinct_key_locations:
            lowered["analysis"]["report_key_actions_distinct_locations"] = True
    event_kinds = {event.kind for event in ir.events}
    if _has_explicit_protocol_semantics(ir):
        nonnull_guard = (
            ir.protocol_semantics.guard_semantics == "nonnull_branch"
        )
    else:
        nonnull_guard = (
            _uses_legacy_semantics(ir)
            and bool({"BrNull", "BrNonNull"} & event_kinds)
            and bool({"Ref", "Use"} & event_kinds)
        )
    if not uninit_rule and nonnull_guard:
        # NULL-deref rules benefit from branch-guard-aware merging.
        lowered["analysis"]["guard_aware_merge"] = True

    event_metadata: Dict[str, Dict[str, Any]] = {}
    for ev in ir.events:
        meta: Dict[str, Any] = {}
        if ev.role:
            meta["role"] = ev.role
        if ev.object:
            meta["object"] = ev.object
        if ev.api_contract:
            meta["api_contract"] = ev.api_contract
        if meta:
            event_metadata[ev.name] = meta
    if event_metadata:
        lowered["event_metadata"] = event_metadata

    if ir.fsm.state_roles:
        lowered["state_roles"] = dict(ir.fsm.state_roles)

    event_names = {event.name for event in ir.events}
    if (
        _uses_legacy_semantics(ir)
        and not _has_explicit_protocol_semantics(ir)
        and (
            ir.bug.key == "unchecked_alloc_ret_npd"
            or (
                {"AllocRet", "Ref"}.issubset(event_names)
                and "npd" in ir.bug.key.lower()
            )
        )
    ):
        lowered["analysis"]["backend"] = "tdfs"

    return lowered
