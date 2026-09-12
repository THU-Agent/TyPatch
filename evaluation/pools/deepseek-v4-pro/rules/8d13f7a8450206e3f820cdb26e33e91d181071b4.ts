{
  "action": {
    "Call": [
      {
        "CallAcquire": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_get_sync"
          }
        ]
      },
      {
        "CallRelease": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_put_sync_autosuspend"
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
      "CallAcquire"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallAcquire"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "starfive_trng_read_pm_leak",
    "key_actions": [
      "CallAcquire",
      "ErrExit"
    ],
    "name": "resource-leak: pm_runtime_get_sync without put on error paths"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "CallAcquire"
    ]
  },
  "event_metadata": {
    "CallAcquire": {
      "role": "source"
    },
    "CallRelease": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Acquired",
      "merge_state": "Acquired"
    }
  ],
  "sliced_action": [
    "CallAcquire",
    "CallRelease",
    "ErrExit"
  ],
  "state": [
    "Acquired",
    "Leak"
  ],
  "state_roles": {
    "Acquired": "danger",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallRelease",
      "curr_state": "Acquired",
      "next_state": "Any"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "CallAcquire",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallAcquire",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRelease",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallAcquire",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallRelease",
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