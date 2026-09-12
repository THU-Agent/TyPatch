{
  "action": {
    "Call": [
      {
        "CallHashDel": [
          {
            "arg_idx": 0,
            "func_name": "hash_del"
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
    ],
    "Exit": []
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Init",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_same_function": true,
    "source_actions": [
      "CallHashDel"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "rocker-hash_del-leak",
    "key_actions": [
      "CallHashDel",
      "Exit"
    ],
    "name": "memory leak in ofdpa_port_fdb after hash_del"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "CallHashDel"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "release"
    },
    "CallHashDel": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Removed",
      "merge_state": "Removed"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    },
    {
      "curr_state1": "Removed",
      "curr_state2": "Freed",
      "merge_state": "Removed"
    }
  ],
  "sliced_action": [
    "CallHashDel",
    "CallFree",
    "Exit"
  ],
  "state": [
    "Removed",
    "Freed",
    "Leak"
  ],
  "state_roles": {
    "Freed": "safe",
    "Init": "init",
    "Leak": "bug",
    "Removed": "danger"
  },
  "transition": [
    {
      "action": "CallFree",
      "curr_state": "Removed",
      "next_state": "Freed"
    },
    {
      "action": "Exit",
      "curr_state": "Removed",
      "next_state": "Leak"
    },
    {
      "action": "CallHashDel",
      "curr_state": "Removed",
      "next_state": "Removed"
    },
    {
      "action": "CallHashDel",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "Exit",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallHashDel",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallFree",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallHashDel",
      "curr_state": "Any",
      "next_state": "Removed"
    },
    {
      "action": "CallFree",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "Exit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}