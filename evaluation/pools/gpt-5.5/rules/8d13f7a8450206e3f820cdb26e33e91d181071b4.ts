{
  "action": {
    "Call": [
      {
        "CallGet": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_get_sync"
          }
        ]
      },
      {
        "CallPut": [
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
      "CallGet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallGet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "jh7110-trng-runtime-pm-refcount-leak",
    "key_actions": [
      "CallGet",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallPut"
    ],
    "start_action": [
      "CallGet"
    ]
  },
  "event_metadata": {
    "CallGet": {
      "role": "source"
    },
    "CallPut": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "RuntimePmHeld",
      "merge_state": "RuntimePmHeld"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "RuntimePmReleased",
      "merge_state": "RuntimePmReleased"
    },
    {
      "curr_state1": "RuntimePmHeld",
      "curr_state2": "RuntimePmReleased",
      "merge_state": "RuntimePmHeld"
    }
  ],
  "sliced_action": [
    "CallGet",
    "CallPut",
    "ErrExit"
  ],
  "state": [
    "RuntimePmHeld",
    "RuntimePmReleased",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "RuntimePmHeld": "danger",
    "RuntimePmReleased": "safe"
  },
  "transition": [
    {
      "action": "CallPut",
      "curr_state": "RuntimePmHeld",
      "next_state": "RuntimePmReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "RuntimePmHeld",
      "next_state": "Leak"
    },
    {
      "action": "CallGet",
      "curr_state": "RuntimePmReleased",
      "next_state": "RuntimePmHeld"
    },
    {
      "action": "CallGet",
      "curr_state": "RuntimePmHeld",
      "next_state": "RuntimePmHeld"
    },
    {
      "action": "CallPut",
      "curr_state": "RuntimePmReleased",
      "next_state": "RuntimePmReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "RuntimePmReleased",
      "next_state": "RuntimePmReleased"
    },
    {
      "action": "CallGet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGet",
      "curr_state": "Any",
      "next_state": "RuntimePmHeld"
    },
    {
      "action": "CallPut",
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