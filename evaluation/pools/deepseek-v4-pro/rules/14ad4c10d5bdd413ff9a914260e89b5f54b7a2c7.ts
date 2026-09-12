{
  "action": {
    "BrNonNull": [],
    "Call": [
      {
        "CallEntryNullable": [
          {
            "arg_idx": 2,
            "func_name": "ucsi_sync_control_common"
          }
        ]
      }
    ],
    "Ref": []
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
      "CallEntryNullable"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NPD",
    "key": "null_deref_cci_ucsi",
    "key_actions": [
      "CallEntryNullable",
      "Ref"
    ],
    "name": "null pointer dereference on cci in ucsi_sync_control_common"
  },
  "context": {
    "end_action": [
      "BrNonNull"
    ],
    "start_action": [
      "CallEntryNullable"
    ]
  },
  "event_metadata": {
    "BrNonNull": {
      "role": "guard"
    },
    "CallEntryNullable": {
      "role": "source"
    },
    "Ref": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Nullable",
      "merge_state": "Nullable"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "NonNull",
      "merge_state": "NonNull"
    }
  ],
  "sliced_action": [
    "CallEntryNullable",
    "BrNonNull",
    "Ref"
  ],
  "state": [
    "Untracked",
    "Nullable",
    "NonNull",
    "NPD"
  ],
  "state_roles": {
    "Init": "init",
    "NPD": "bug",
    "NonNull": "safe",
    "Nullable": "danger"
  },
  "transition": [
    {
      "action": "CallEntryNullable",
      "curr_state": "Untracked",
      "next_state": "Nullable"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Nullable",
      "next_state": "NonNull"
    },
    {
      "action": "Ref",
      "curr_state": "Nullable",
      "next_state": "NPD"
    },
    {
      "action": "CallEntryNullable",
      "curr_state": "NonNull",
      "next_state": "Nullable"
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
      "action": "CallEntryNullable",
      "curr_state": "Nullable",
      "next_state": "Nullable"
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
      "action": "CallEntryNullable",
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