{
  "action": {
    "Call": [
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "video_device_release"
          }
        ]
      }
    ],
    "StoreNull": []
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "CallFree"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "most_video_register_double_free",
    "key_actions": [
      "CallFree",
      "CallFree"
    ],
    "name": "double-free on video register failure"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "CallFree"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "release"
    },
    "StoreNull": {
      "role": "guard"
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
    "CallFree",
    "StoreNull"
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
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "DoubleFree"
    },
    {
      "action": "StoreNull",
      "curr_state": "Freed",
      "next_state": "Untracked"
    },
    {
      "action": "StoreNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFree",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "StoreNull",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    }
  ]
}