{
  "action": {
    "Call": [
      {
        "CallRegister": [
          {
            "arg_idx": 1,
            "func_name": "devm_spi_register_controller"
          }
        ]
      },
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "spi_controller_put"
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
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "CallRegister"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoublePut",
    "key": "double-put-after-devm",
    "key_actions": [
      "CallRegister",
      "CallFree"
    ],
    "name": "double-put"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "CallRegister"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "sink"
    },
    "CallRegister": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Registered",
      "merge_state": "Registered"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "DoublePut",
      "merge_state": "DoublePut"
    },
    {
      "curr_state1": "Registered",
      "curr_state2": "DoublePut",
      "merge_state": "DoublePut"
    }
  ],
  "sliced_action": [
    "CallRegister",
    "CallFree"
  ],
  "state": [
    "Untracked",
    "Registered",
    "DoublePut"
  ],
  "state_roles": {
    "DoublePut": "bug",
    "Init": "init",
    "Registered": "danger"
  },
  "transition": [
    {
      "action": "CallRegister",
      "curr_state": "Untracked",
      "next_state": "Registered"
    },
    {
      "action": "CallFree",
      "curr_state": "Registered",
      "next_state": "DoublePut"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallRegister",
      "curr_state": "Registered",
      "next_state": "Registered"
    },
    {
      "action": "CallRegister",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    },
    {
      "action": "CallFree",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    }
  ]
}