{
  "action": {
    "Call": [
      {
        "CallLock": [
          {
            "arg_idx": 0,
            "func_name": "mutex_lock"
          }
        ]
      },
      {
        "CallUnlock": [
          {
            "arg_idx": 0,
            "func_name": "mutex_unlock"
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
      "CallLock"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "rtc-ds1374-lock-imbalance",
    "key_actions": [
      "CallLock",
      "Exit"
    ],
    "name": "lock imbalance"
  },
  "context": {
    "end_action": [
      "CallUnlock"
    ],
    "start_action": [
      "CallLock"
    ]
  },
  "event_metadata": {
    "CallLock": {
      "role": "source"
    },
    "CallUnlock": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Locked",
      "merge_state": "Locked"
    }
  ],
  "sliced_action": [
    "CallLock",
    "CallUnlock",
    "Exit"
  ],
  "state": [
    "Locked",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Locked": "danger"
  },
  "transition": [
    {
      "action": "CallUnlock",
      "curr_state": "Locked",
      "next_state": "Any"
    },
    {
      "action": "Exit",
      "curr_state": "Locked",
      "next_state": "Leak"
    },
    {
      "action": "CallLock",
      "curr_state": "Locked",
      "next_state": "Locked"
    },
    {
      "action": "CallLock",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallUnlock",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallLock",
      "curr_state": "Any",
      "next_state": "Locked"
    },
    {
      "action": "CallUnlock",
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