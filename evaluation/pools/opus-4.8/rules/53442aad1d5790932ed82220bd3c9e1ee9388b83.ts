{
  "action": {
    "Call": [
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
          }
        ]
      }
    ],
    "Exit": [],
    "Ret": [
      {
        "AllocRet": [
          "ofdpa_fdb_tbl_find"
        ]
      }
    ]
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
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "rocker_ofdpa_port_fdb_leak",
    "key_actions": [
      "AllocRet",
      "Exit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "CallFree": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Live",
      "merge_state": "Live"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "CallFree",
    "Exit"
  ],
  "state": [
    "Live",
    "Freed",
    "Leak"
  ],
  "state_roles": {
    "Freed": "safe",
    "Init": "init",
    "Leak": "bug",
    "Live": "danger"
  },
  "transition": [
    {
      "action": "CallFree",
      "curr_state": "Live",
      "next_state": "Freed"
    },
    {
      "action": "Exit",
      "curr_state": "Live",
      "next_state": "Leak"
    },
    {
      "action": "AllocRet",
      "curr_state": "Freed",
      "next_state": "Live"
    },
    {
      "action": "AllocRet",
      "curr_state": "Live",
      "next_state": "Live"
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
      "action": "AllocRet",
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
      "action": "AllocRet",
      "curr_state": "Any",
      "next_state": "Live"
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