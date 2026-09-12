{
  "action": {
    "BrNonNull": [],
    "Ret": [
      {
        "AllocRet": [
          "dma_alloc_coherent"
        ]
      }
    ],
    "Use": []
  },
  "analysis": {
    "action_sources": {
      "Use": [
        "call_arg",
        "binary_operand",
        "unary_operand"
      ]
    },
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "guard_aware_merge": true,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_candidate_generation": false,
    "path_sensitive_verify": true,
    "source_actions": [
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NullUse",
    "key": "qedf_dma_alloc_coherent_null_use",
    "key_actions": [
      "AllocRet",
      "Use"
    ],
    "name": "unchecked dma_alloc_coherent return use"
  },
  "context": {
    "end_action": [
      "BrNonNull"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "BrNonNull": {
      "role": "guard"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "MaybeNull",
      "merge_state": "MaybeNull"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "NonNull",
      "merge_state": "NonNull"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "BrNonNull",
    "Use"
  ],
  "state": [
    "Untracked",
    "MaybeNull",
    "NonNull",
    "NullUse"
  ],
  "state_roles": {
    "Init": "init",
    "MaybeNull": "danger",
    "NonNull": "safe",
    "NullUse": "bug"
  },
  "transition": [
    {
      "action": "AllocRet",
      "curr_state": "Untracked",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "MaybeNull",
      "next_state": "NonNull"
    },
    {
      "action": "Use",
      "curr_state": "MaybeNull",
      "next_state": "NullUse"
    },
    {
      "action": "AllocRet",
      "curr_state": "NonNull",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "AllocRet",
      "curr_state": "MaybeNull",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "NonNull",
      "next_state": "NonNull"
    },
    {
      "action": "Use",
      "curr_state": "NonNull",
      "next_state": "NonNull"
    },
    {
      "action": "AllocRet",
      "curr_state": "NullUse",
      "next_state": "NullUse"
    },
    {
      "action": "BrNonNull",
      "curr_state": "NullUse",
      "next_state": "NullUse"
    },
    {
      "action": "Use",
      "curr_state": "NullUse",
      "next_state": "NullUse"
    }
  ]
}
