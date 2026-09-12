{
  "action": {
    "Call": [
      {
        "CallLock": [
          {
            "arg_idx": 0,
            "func_name": "mutex_lock"
          },
          {
            "arg_idx": 0,
            "func_name": "spin_lock"
          }
        ]
      },
      {
        "CallUnlock": [
          {
            "arg_idx": 0,
            "func_name": "mutex_unlock"
          },
          {
            "arg_idx": 0,
            "func_name": "spin_unlock"
          }
        ]
      }
    ],
    "ErrExit": []
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
    "suppress_err_exit_on_returned_call_actions": [
      "CallLock"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "MissingUnlock",
    "key": "missing-unlock-on-error-path-ca91cx42_master_rmw",
    "key_actions": [
      "CallLock",
      "ErrExit"
    ],
    "name": "missing unlock on error path"
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
      "role": "acquire"
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
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Unlocked",
      "merge_state": "Unlocked"
    }
  ],
  "sliced_action": [
    "CallLock",
    "CallUnlock",
    "ErrExit"
  ],
  "state": [
    "Locked",
    "Unlocked",
    "MissingUnlock"
  ],
  "state_roles": {
    "Init": "init",
    "Locked": "danger",
    "MissingUnlock": "bug",
    "Unlocked": "safe"
  },
  "transition": [
    {
      "action": "CallUnlock",
      "curr_state": "Locked",
      "next_state": "Unlocked"
    },
    {
      "action": "ErrExit",
      "curr_state": "Locked",
      "next_state": "MissingUnlock"
    },
    {
      "action": "CallLock",
      "curr_state": "Unlocked",
      "next_state": "Locked"
    },
    {
      "action": "CallLock",
      "curr_state": "Locked",
      "next_state": "Locked"
    },
    {
      "action": "CallUnlock",
      "curr_state": "Unlocked",
      "next_state": "Unlocked"
    },
    {
      "action": "ErrExit",
      "curr_state": "Unlocked",
      "next_state": "Unlocked"
    },
    {
      "action": "CallLock",
      "curr_state": "MissingUnlock",
      "next_state": "MissingUnlock"
    },
    {
      "action": "CallUnlock",
      "curr_state": "MissingUnlock",
      "next_state": "MissingUnlock"
    },
    {
      "action": "ErrExit",
      "curr_state": "MissingUnlock",
      "next_state": "MissingUnlock"
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
      "action": "ErrExit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}