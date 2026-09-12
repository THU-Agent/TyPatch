{
  "action": {
    "Call": [
      {
        "CallPin": [
          {
            "arg_idx": 0,
            "func_name": "atomic_inc"
          }
        ]
      },
      {
        "CallUnpin": [
          {
            "arg_idx": 0,
            "func_name": "atomic_dec"
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
      "CallPin"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleDecrement",
    "key": "gpib_command_ioctl_descriptor_busy_double_decrement",
    "key_actions": [
      "CallPin",
      "CallUnpin",
      "CallUnpin"
    ],
    "name": "double decrement of descriptor_busy"
  },
  "context": {
    "end_action": [
      "CallUnpin"
    ],
    "start_action": [
      "CallPin"
    ]
  },
  "event_metadata": {
    "CallPin": {
      "role": "source"
    },
    "CallUnpin": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Pinned",
      "merge_state": "Pinned"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Unpinned",
      "merge_state": "Unpinned"
    },
    {
      "curr_state1": "Pinned",
      "curr_state2": "Unpinned",
      "merge_state": "Pinned"
    }
  ],
  "sliced_action": [
    "CallPin",
    "CallUnpin"
  ],
  "state": [
    "Untracked",
    "Pinned",
    "Unpinned",
    "DoubleDecrement"
  ],
  "state_roles": {
    "DoubleDecrement": "bug",
    "Init": "init",
    "Pinned": "danger",
    "Unpinned": "safe"
  },
  "transition": [
    {
      "action": "CallPin",
      "curr_state": "Untracked",
      "next_state": "Pinned"
    },
    {
      "action": "CallUnpin",
      "curr_state": "Pinned",
      "next_state": "Unpinned"
    },
    {
      "action": "CallPin",
      "curr_state": "Unpinned",
      "next_state": "Pinned"
    },
    {
      "action": "CallUnpin",
      "curr_state": "Unpinned",
      "next_state": "DoubleDecrement"
    },
    {
      "action": "CallUnpin",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallPin",
      "curr_state": "Pinned",
      "next_state": "Pinned"
    },
    {
      "action": "CallPin",
      "curr_state": "DoubleDecrement",
      "next_state": "DoubleDecrement"
    },
    {
      "action": "CallUnpin",
      "curr_state": "DoubleDecrement",
      "next_state": "DoubleDecrement"
    }
  ]
}