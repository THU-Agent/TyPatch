{
  "action": {
    "Call": [
      {
        "CallRegisterAction": [
          {
            "arg_idx": 2,
            "func_name": "devm_add_action_or_reset"
          }
        ]
      },
      {
        "CallMutDestroy": [
          {
            "arg_idx": 0,
            "field_path": "lock",
            "func_name": "mutex_destroy"
          }
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "CallRegisterAction"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleCleanup",
    "key": "double-cleanup",
    "key_actions": [
      "CallRegisterAction",
      "CallMutDestroy"
    ],
    "name": "double cleanup via managed action and manual cleanup"
  },
  "context": {
    "end_action": [
      "CallMutDestroy"
    ],
    "start_action": [
      "CallRegisterAction"
    ]
  },
  "event_metadata": {
    "CallMutDestroy": {
      "role": "sink"
    },
    "CallRegisterAction": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Managed",
      "merge_state": "Managed"
    }
  ],
  "sliced_action": [
    "CallRegisterAction",
    "CallMutDestroy"
  ],
  "state": [
    "Untracked",
    "Managed",
    "DoubleCleanup"
  ],
  "state_roles": {
    "DoubleCleanup": "bug",
    "Init": "init",
    "Managed": "danger"
  },
  "transition": [
    {
      "action": "CallRegisterAction",
      "curr_state": "Untracked",
      "next_state": "Managed"
    },
    {
      "action": "CallMutDestroy",
      "curr_state": "Managed",
      "next_state": "DoubleCleanup"
    },
    {
      "action": "CallMutDestroy",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallRegisterAction",
      "curr_state": "Managed",
      "next_state": "Managed"
    },
    {
      "action": "CallRegisterAction",
      "curr_state": "DoubleCleanup",
      "next_state": "DoubleCleanup"
    },
    {
      "action": "CallMutDestroy",
      "curr_state": "DoubleCleanup",
      "next_state": "DoubleCleanup"
    }
  ]
}