{
  "action": {
    "BrNonNull": [],
    "Ret": [
      {
        "MaybeNullRet": [
          "devm_kasprintf"
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
    "path_sensitive_verify": true,
    "source_actions": [
      "MaybeNullRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NPD",
    "key": "mt7925_thermal_init_devm_kasprintf_npd",
    "key_actions": [
      "MaybeNullRet",
      "Use"
    ],
    "name": "nullable devm_kasprintf return dereference"
  },
  "context": {
    "end_action": [
      "BrNonNull"
    ],
    "start_action": [
      "MaybeNullRet"
    ]
  },
  "event_metadata": {
    "BrNonNull": {
      "role": "guard"
    },
    "MaybeNullRet": {
      "role": "source"
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
    "MaybeNullRet",
    "BrNonNull",
    "Use"
  ],
  "state": [
    "Untracked",
    "MaybeNull",
    "NonNull",
    "NPD"
  ],
  "state_roles": {
    "Init": "init",
    "MaybeNull": "danger",
    "NPD": "bug",
    "NonNull": "safe"
  },
  "transition": [
    {
      "action": "MaybeNullRet",
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
      "next_state": "NPD"
    },
    {
      "action": "MaybeNullRet",
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
      "action": "MaybeNullRet",
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
      "action": "MaybeNullRet",
      "curr_state": "NPD",
      "next_state": "NPD"
    },
    {
      "action": "BrNonNull",
      "curr_state": "NPD",
      "next_state": "NPD"
    },
    {
      "action": "Use",
      "curr_state": "NPD",
      "next_state": "NPD"
    }
  ]
}