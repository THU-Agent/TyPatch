{
  "action": {
    "Call": [
      {
        "OwnerTeardown": [
          {
            "arg_idx": 0,
            "func_name": "put_device"
          }
        ]
      },
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
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
      "OwnerTeardown"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "ipu7_pdata_double_free_after_put_device",
    "key_actions": [
      "OwnerTeardown",
      "CallFree"
    ],
    "name": "double-free of pdata after device teardown release"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "OwnerTeardown"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "sink"
    },
    "OwnerTeardown": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "OwnerTeardown",
    "CallFree"
  ],
  "state": [
    "Untracked",
    "Released",
    "DoubleFree"
  ],
  "state_roles": {
    "DoubleFree": "bug",
    "Init": "init",
    "Released": "danger"
  },
  "transition": [
    {
      "action": "OwnerTeardown",
      "curr_state": "Untracked",
      "next_state": "Released"
    },
    {
      "action": "CallFree",
      "curr_state": "Released",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "OwnerTeardown",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "OwnerTeardown",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFree",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    }
  ]
}