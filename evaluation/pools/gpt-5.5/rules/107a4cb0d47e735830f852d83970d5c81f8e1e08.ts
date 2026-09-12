{
  "action": {
    "Call": [
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "__free_page"
          }
        ]
      }
    ],
    "Ret": [
      {
        "AllocRet": [
          "rxgk_alloc_packet"
        ]
      }
    ],
    "Use": []
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
      "AllocRet",
      "CallFree"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "rxrpc-rxgk-issue-challenge-uaf",
    "key_actions": [
      "CallFree",
      "Use"
    ],
    "name": "use-after-free"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "AllocRet",
      "CallFree"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "CallFree": {
      "role": "source"
    },
    "Use": {
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
      "curr_state2": "Freed",
      "merge_state": "Freed"
    },
    {
      "curr_state1": "Allocated",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "CallFree",
    "Use"
  ],
  "state": [
    "Untracked",
    "Allocated",
    "Freed",
    "UAF"
  ],
  "state_roles": {
    "Allocated": "safe",
    "Freed": "danger",
    "Init": "init",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "AllocRet",
      "curr_state": "Untracked",
      "next_state": "Allocated"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Allocated",
      "next_state": "Freed"
    },
    {
      "action": "Use",
      "curr_state": "Freed",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "AllocRet",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "Use",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "AllocRet",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "AllocRet",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallFree",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    }
  ]
}