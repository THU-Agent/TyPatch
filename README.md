<div align="center">

# TyPatch

**Transforming Linux repair patches into typestate rules for kernel bug detection**

<p>
  <a href="#quick-start">Quick start</a> ·
  <a href="#paper-evaluation">Paper evaluation</a> ·
  <a href="#repository-layout">Repository layout</a>
</p>

</div>

## Quick start

Install the pinned Python dependencies, point `TYPATCH_DATA` at the runtime
data bundle, and run one of the paper rule pools:

```bash
python3 -m pip install -r docker/requirements.txt

export TYPATCH_DATA=/path/to/artifact-data
export TYPATCH_RESULTS="$PWD/artifact-results"

./artifact evaluate --pool gpt-5.5
```

`TYPATCH_DATA` defaults to `/artifact/data` and `TYPATCH_RESULTS` defaults to
`/artifact/results`; setting both explicitly is recommended for local runs.
Each run creates a timestamped directory below the results root unless
`--run-name` is provided.

## Paper evaluation

Paper evaluation replays the rule pools used in the paper and does not call an
LLM. The available pools are:

```bash
./artifact evaluate --pool gpt-5.5
./artifact evaluate --pool deepseek-v4-pro
./artifact evaluate --pool opus-4.8
```

To evaluate all available pools, omit `--pool`:

```bash
./artifact evaluate
```

The runtime data directory must have the following layout:

```text
$TYPATCH_DATA/
├── compile/Database/SourceInfo/compile.db
├── linux-v6.16/
└── pools/
    ├── gpt-5.5/
    │   ├── rules/*.ts
    │   └── scope_map.json
    ├── deepseek-v4-pro/
    │   ├── rules/*.ts
    │   └── scope_map.json
    └── opus-4.8/
        ├── rules/*.ts
        └── scope_map.json
```

The compile database and Linux source tree are used by the shared analyzer;
the pool directory supplies the executable rules and their scope maps.

## Synthesize and scan

The synthesis path generates rules from repair commits, derives their scan
scope, and then runs the analyzer. It is separate from paper evaluation and
requires credentials for the selected LLM provider in the environment.

```bash
export TYPATCH_LLM_PROVIDER=openai   # or anthropic

# Quick test on one of the bundled RQ1 commits.
./artifact from-scratch --rq1 --limit 1
```

For `openai`, provide `OPENAI_API_KEY`; for `anthropic`, provide
`ANTHROPIC_API_KEY` (or `ANTHROPIC_AUTH_TOKEN`) and `ANTHROPIC_BASE_URL`.
The corresponding `*_MODEL` and `*_BASE_URL` variables can be used to select
an endpoint or model.

Use `--commit COMMIT_SHA` for one repair commit, or omit `--limit` to process
the complete bundled RQ1 commit list.

## Repository layout

| Path | Contents |
| --- | --- |
| `Analyzer/python/` | Patch loading, example selection, rule synthesis, validation, scope derivation, scanning, and report merging. |
| `evaluation/pools/` | Reference rule pools and their scope maps. |
| `datasets/rq1_100/` | The 100 repair-commit inputs used for RQ1. |
| `bin/typestate` | Prebuilt Linux x86-64 executable used by the Python runtime. |
| `DBSchema/`, `WorkDir/config/` | Database and runtime configuration. |
| `postprocess/` | Source/sink and cross-rule report deduplication. |
| `artifact` | Wrapper that sets the Python path and locates the bundled analyzer. |

## Paper

[arXiv abstract](https://arxiv.org/abs/2609.13728) ·
[PDF](https://arxiv.org/pdf/2609.13728)
