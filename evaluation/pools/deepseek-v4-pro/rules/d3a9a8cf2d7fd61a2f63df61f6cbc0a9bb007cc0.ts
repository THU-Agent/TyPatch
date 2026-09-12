{
  "action": {
    "Call": [
      {
        "FreePutDevice": [
          {
            "arg_idx": 0,
            "field_path": "pdata",
            "func_name": "put_device"
          }
        ]
      },
      {
        "FreeKfree": [
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
      "FreePutDevice"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "ipu7_double_free_put_device_kfree",
    "key_actions": [
      "FreePutDevice",
      "FreeKfree"
    ],
    "name": "double-free after put_device"
  },
  "context": {
    "end_action": [
      "FreeKfree"
    ],
    "start_action": [
      "FreePutDevice"
    ]
  },
  "event_metadata": {
    "FreeKfree": {
      "role": "release"
    },
    "FreePutDevice": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "FreePutDevice",
    "FreeKfree"
  ],
  "state": [
    "Untracked",
    "Freed",
    "DoubleFree"
  ],
  "state_roles": {
    "DoubleFree": "bug",
    "Freed": "danger",
    "Init": "init"
  },
  "transition": [
    {
      "action": "FreePutDevice",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "FreeKfree",
      "curr_state": "Freed",
      "next_state": "DoubleFree"
    },
    {
      "action": "FreeKfree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "FreePutDevice",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "FreePutDevice",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "FreeKfree",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    }
  ]
}