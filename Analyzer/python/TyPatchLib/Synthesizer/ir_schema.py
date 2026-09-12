from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


EventKind = Literal[
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
]
EventRole = Literal[
    "source", "sink", "guard", "acquire", "release", "balance",
    "publish", "unpublish", "init", "fail", "exit", "teardown",
    "context", "other",
]
StateRole = Literal["init", "safe", "danger", "bug", "unknown"]
Modeling = Literal[
    "scalar_uninit_use", "resource_leak", "partial_init_copy", "alloc_free",
    "typestate_protocol",
]
PathSourceVisibility = Literal["stable", "branch_local"]
GuardSemantics = Literal["none", "nonnull_branch"]
ExitSemantics = Literal["any_return", "error_return"]

FUNCTION_BOUND_EVENT_KINDS = {
    "Call",
    "OutParamInit",
    "OwnerRelease",
    "OwnerTransfer",
    "OwnerTeardown",
}

SINGLETON_EVENT_KINDS = {
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
}


class Binding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    func: str
    arg: int
    field: Optional[str] = None
    field_name: Optional[str] = None
    field_path: Optional[str] = None

    @model_validator(mode="after")
    def _validate_binding(self) -> "Binding":
        field_values = [
            value
            for value in (self.field, self.field_name, self.field_path)
            if value is not None
        ]
        for value in field_values:
            if not value:
                raise ValueError("binding field must be non-empty when present")
        if len(set(field_values)) > 1:
            raise ValueError("binding field aliases must agree")
        return self


class Event(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    kind: EventKind
    description: str = ""
    # Optional protocol metadata used by sanity/merge/voting.  Older IRs do not
    # need to populate these fields; they are preserved by lowering as metadata
    # but the C++ backend still keys execution on kind/name/bindings/funcs.
    role: Optional[EventRole] = None
    object: Optional[Dict[str, Any]] = None
    api_contract: Optional[Dict[str, Any]] = None
    bindings: List[Binding] = Field(default_factory=list)
    funcs: List[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def _validate_event(self) -> "Event":
        if self.kind in FUNCTION_BOUND_EVENT_KINDS:
            if not self.bindings:
                raise ValueError(
                    f"{self.kind} event must declare at least one binding"
                )
            for b in self.bindings:
                if b.arg < 0:
                    raise ValueError(f"binding arg must be non-negative, got {b.arg}")
                if not b.func:
                    raise ValueError("binding func must be non-empty")
            if self.funcs:
                raise ValueError(
                    f"{self.kind} event must not declare funcs; use bindings"
                )
        elif self.kind == "Ret":
            if self.bindings:
                raise ValueError("Ret event must not declare bindings")
            if not self.funcs:
                raise ValueError("Ret event must declare at least one function in funcs")
            if any(not f for f in self.funcs):
                raise ValueError("Ret funcs must be non-empty")
        else:
            if self.name != self.kind:
                raise ValueError(
                    f"non-Call event name must equal kind: got name={self.name!r}, kind={self.kind!r}"
                )
            if self.bindings:
                raise ValueError("non-Call event must not declare bindings")
            if self.funcs:
                raise ValueError("non-Call/non-Ret event must not declare funcs")
        return self


class Bug(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    key: str
    description: str = ""


class Merge(BaseModel):
    model_config = ConfigDict(extra="forbid")

    a: str
    b: str
    result: str


class FSM(BaseModel):
    model_config = ConfigDict(extra="forbid")

    states: List[str]
    initial: str
    transitions: Dict[str, Dict[str, str]]
    merges: List[Merge] = Field(default_factory=list)
    state_roles: Dict[str, StateRole] = Field(default_factory=dict)


class Trigger(BaseModel):
    model_config = ConfigDict(extra="forbid")

    bug_state: str
    key_events: List[str] = Field(default_factory=list)
    sliced_events: List[str] = Field(default_factory=list)


class Context(BaseModel):
    model_config = ConfigDict(extra="forbid")

    start_events: List[str] = Field(default_factory=list)
    end_events: List[str] = Field(default_factory=list)


class PathSemantics(BaseModel):
    """Semantic path requirements, deliberately separated from backend knobs.

    The synthesizer may describe what must be true of a witness path, but it
    cannot select verifier budgets, CFG implementations, or pruning policy.
    Lowering maps this small semantic contract to the supported backend
    configuration deterministically.
    """

    model_config = ConfigDict(extra="forbid")

    require_same_path: bool = False
    source_visibility: PathSourceVisibility = "stable"
    require_distinct_key_locations: bool = False

    @model_validator(mode="after")
    def _validate_path_semantics(self) -> "PathSemantics":
        if self.source_visibility == "branch_local" and not self.require_same_path:
            raise ValueError(
                "branch_local source visibility requires require_same_path=true"
            )
        if self.require_distinct_key_locations and not self.require_same_path:
            raise ValueError(
                "distinct key locations require require_same_path=true"
            )
        return self


class ProtocolSemantics(BaseModel):
    """Backend-independent semantic requirements for lowering.

    These fields describe what makes a protocol witness meaningful.  They are
    intentionally not backend names or tuning knobs: lowering owns the
    deterministic mapping to the executor configuration.
    """

    model_config = ConfigDict(extra="forbid")

    guard_semantics: GuardSemantics = "none"
    exit_semantics: ExitSemantics = "any_return"


class Provenance(BaseModel):
    model_config = ConfigDict(extra="ignore")

    kind: Literal["single", "merged"] = "single"
    source_commits: List[str] = Field(default_factory=list)
    cluster_id: Optional[str] = None
    merged_from: List[str] = Field(default_factory=list)


class IR(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    version: str
    bug: Bug
    events: List[Event]
    fsm: FSM
    trigger: Trigger
    context: Context = Field(default_factory=Context)
    # Explicit modeling angle for new IRs. Lowering may keep version-gated
    # compatibility for older stored IRs, but v0.5 synthesis must not infer it
    # from bug prose.
    modeling: Optional[Modeling] = None
    # Typed protocol requirements. New v0.5 synthesis must make execution
    # semantics explicit here rather than relying on names or descriptions.
    protocol_semantics: ProtocolSemantics = Field(
        default_factory=ProtocolSemantics
    )
    # Optional IR-v0.5 semantic contract.  Older v0.3/v0.4 IRs omit it and
    # retain the legacy lowering behavior.
    path_semantics: Optional[PathSemantics] = None
    provenance: Optional[Provenance] = Field(default=None, alias="_provenance")

    @model_validator(mode="after")
    def _validate_ir(self) -> "IR":
        # 1. event names unique
        names = [e.name for e in self.events]
        seen: set = set()
        for n in names:
            if n in seen:
                raise ValueError(f"duplicate event name: {n!r}")
            seen.add(n)

        # 2. at most one event per singleton non-binding kind
        non_call_seen: set = set()
        for e in self.events:
            if e.kind in SINGLETON_EVENT_KINDS:
                if e.kind in non_call_seen:
                    raise ValueError(f"multiple events declared for non-Call kind {e.kind!r}")
                non_call_seen.add(e.kind)

        declared_events = set(names)
        declared_states = set(self.fsm.states)

        # 3. fsm.initial must be declared
        if self.fsm.initial != "Init":
            raise ValueError("fsm.initial must be 'Init'")
        if self.fsm.initial not in declared_states:
            raise ValueError(f"fsm.initial {self.fsm.initial!r} not in states")

        # 4. transitions reference declared events and states
        for src, outs in self.fsm.transitions.items():
            if src not in declared_states:
                raise ValueError(f"transition source {src!r} is an undeclared state")
            for ev, dst in outs.items():
                if ev not in declared_events:
                    raise ValueError(f"transition on {ev!r} is an undeclared event")
                if dst not in declared_states:
                    raise ValueError(f"transition target {dst!r} is an undeclared state")

        # 5. trigger.bug_state declared and not Init
        if self.trigger.bug_state == "Init":
            raise ValueError("bug_state must not be Init")
        if self.trigger.bug_state not in declared_states:
            raise ValueError(f"bug_state {self.trigger.bug_state!r} not declared in states")

        # 6. trigger.sliced_events / key_events subset of declared events
        for ev in self.trigger.sliced_events:
            if ev not in declared_events:
                raise ValueError(f"sliced_events references undeclared event {ev!r}")
        for ev in self.trigger.key_events:
            if ev not in declared_events:
                raise ValueError(f"key_events references undeclared event {ev!r}")

        # 7. merges reference declared states
        for m in self.fsm.merges:
            for s in (m.a, m.b, m.result):
                if s not in declared_states:
                    raise ValueError(f"merge references undeclared state {s!r}")

        # 8. optional state roles reference declared states
        for s in self.fsm.state_roles:
            if s not in declared_states:
                raise ValueError(f"state_roles references undeclared state {s!r}")

        # Path replay is intended for ordered protocols, not a one-action
        # report dressed up with backend hints.
        if self.path_semantics and self.path_semantics.require_same_path:
            if len(self.trigger.key_events) < 2:
                raise ValueError(
                    "require_same_path needs at least two ordered key_events"
                )
            if self.modeling == "scalar_uninit_use":
                raise ValueError(
                    "scalar_uninit_use cannot request ordered path replay; "
                    "use typestate_protocol for an outparam/lifecycle protocol"
                )

        event_kinds = {event.kind for event in self.events}
        semantics = self.protocol_semantics
        if semantics.guard_semantics == "nonnull_branch":
            if not ({"BrNull", "BrNonNull"} & event_kinds):
                raise ValueError(
                    "nonnull_branch guard semantics requires BrNull or "
                    "BrNonNull"
                )
            if not ({"Ref", "Use"} & event_kinds):
                raise ValueError(
                    "nonnull_branch guard semantics requires a Ref or Use sink"
                )
        if semantics.exit_semantics == "error_return" and "Exit" not in event_kinds:
            raise ValueError(
                "error_return exit semantics requires an Exit event"
            )
        return self
