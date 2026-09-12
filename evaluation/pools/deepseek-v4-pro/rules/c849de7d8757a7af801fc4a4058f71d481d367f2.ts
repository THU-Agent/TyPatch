{
  "action": {
    "Call": [
      {
        "CallFreeReply": [
          {
            "arg_idx": 0,
            "func_name": "genlmsg_reply"
          }
        ]
      },
      {
        "CallFreeNlmsg": [
          {
            "arg_idx": 0,
            "func_name": "nlmsg_free"
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
      "CallFreeReply"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "netdev_bind_rx_double_free",
    "key_actions": [
      "CallFreeReply",
      "CallFreeNlmsg"
    ],
    "name": "double-free"
  },
  "context": {
    "end_action": [
      "CallFreeNlmsg"
    ],
    "start_action": [
      "CallFreeReply"
    ]
  },
  "event_metadata": {
    "CallFreeNlmsg": {
      "role": "release"
    },
    "CallFreeReply": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "DoubleFree",
      "merge_state": "DoubleFree"
    },
    {
      "curr_state1": "Freed",
      "curr_state2": "DoubleFree",
      "merge_state": "DoubleFree"
    }
  ],
  "sliced_action": [
    "CallFreeReply",
    "CallFreeNlmsg"
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
      "action": "CallFreeReply",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "CallFreeReply",
      "curr_state": "Freed",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFreeNlmsg",
      "curr_state": "Freed",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFreeNlmsg",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFreeReply",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFreeNlmsg",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    }
  ]
}