"""Synthesis report aggregation and on-disk format."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional


class Verdict(str, Enum):
    SYNTH_OK = "synth_ok"
    ABORT = "abort"
    SANITY_FAIL = "sanity_fail"
    SCHEMA_FAIL = "schema_fail"
    LOWERING_FAIL = "lowering_fail"


@dataclass
class GenerationReport:
    """Metrics and outcome for candidate rule generation."""

    ok: Optional[bool] = None
    ms: Optional[int] = None
    abort: bool = False
    abort_reason: str = ""
    schema_error: Optional[str] = None
    tokens: Dict[str, int] = field(default_factory=dict)


@dataclass
class LoweringReport:
    ok: Optional[bool] = None
    ts_path: Optional[str] = None
    error: Optional[str] = None


@dataclass
class SynthesisReport:
    commit_or_cluster_id: str
    generation: GenerationReport = field(default_factory=GenerationReport)
    sanity_findings: List[Dict[str, Any]] = field(default_factory=list)
    lowering: LoweringReport = field(default_factory=LoweringReport)
    metadata: Dict[str, Any] = field(default_factory=dict)
    verdict: Verdict = Verdict.SYNTH_OK

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["verdict"] = self.verdict.value
        return data

    def write(self, path: Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_dict(), indent=2, sort_keys=True))
