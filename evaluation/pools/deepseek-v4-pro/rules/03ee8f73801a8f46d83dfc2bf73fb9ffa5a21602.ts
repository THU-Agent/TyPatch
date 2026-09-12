{
  "action": {
    "BrNonNull": [],
    "Ref": [],
    "Ret": [
      {
        "AllocRet": [
          "devm_kasprintf"
        ]
      }
    ]
  },
  "analysis": {
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
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NPD",
    "key": "mt7925_thermal_init_null_alloc_deref",
    "key_actions": [
      "AllocRet",
      "Ref"
    ],
    "name": "null-ptr-deref in mt7925_thermal_init after devm_kasprintf"
  },
  "context": {
    "end_action": [],
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
    "Ref": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Allocated",
      "merge_state": "Allocated"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "NonNull",
      "merge_state": "NonNull"
    },
    {
      "curr_state1": "Allocated",
      "curr_state2": "NonNull",
      "merge_state": "NonNull"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "BrNonNull",
    "Ref"
  ],
  "state": [
    "Untracked",
    "Allocated",
    "NonNull",
    "NPD"
  ],
  "state_roles": {
    "Allocated": "danger",
    "Init": "init",
    "NPD": "bug",
    "NonNull": "safe"
  },
  "transition": [
    {
      "action": "AllocRet",
      "curr_state": "Untracked",
      "next_state": "Allocated"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Allocated",
      "next_state": "NonNull"
    },
    {
      "action": "Ref",
      "curr_state": "Allocated",
      "next_state": "NPD"
    },
    {
      "action": "AllocRet",
      "curr_state": "NonNull",
      "next_state": "Allocated"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Ref",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "AllocRet",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "BrNonNull",
      "curr_state": "NonNull",
      "next_state": "NonNull"
    },
    {
      "action": "Ref",
      "curr_state": "NonNull",
      "next_state": "NonNull"
    },
    {
      "action": "AllocRet",
      "curr_state": "NPD",
      "next_state": "NPD"
    },
    {
      "action": "BrNonNull",
      "curr_state": "NPD",
      "next_state": "NPD"
    },
    {
      "action": "Ref",
      "curr_state": "NPD",
      "next_state": "NPD"
    }
  ]
}