{
  "action": {
    "Call": [
      {
        "OwnerTransfer": [
          {
            "arg_idx": 0,
            "func_name": "genlmsg_reply"
          }
        ]
      },
      {
        "CallFree": [
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
    "source_actions": [
      "OwnerTransfer"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "netdev_genlmsg_reply_nlmsg_free_double_free",
    "key_actions": [
      "OwnerTransfer",
      "CallFree"
    ],
    "name": "double-free after reply consumes skb"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "OwnerTransfer"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "sink"
    },
    "OwnerTransfer": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Transferred",
      "merge_state": "Transferred"
    }
  ],
  "sliced_action": [
    "OwnerTransfer",
    "CallFree"
  ],
  "state": [
    "Untracked",
    "Transferred",
    "DoubleFree"
  ],
  "state_roles": {
    "DoubleFree": "bug",
    "Init": "init",
    "Transferred": "danger"
  },
  "transition": [
    {
      "action": "OwnerTransfer",
      "curr_state": "Untracked",
      "next_state": "Transferred"
    },
    {
      "action": "CallFree",
      "curr_state": "Transferred",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "OwnerTransfer",
      "curr_state": "Transferred",
      "next_state": "Transferred"
    },
    {
      "action": "OwnerTransfer",
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