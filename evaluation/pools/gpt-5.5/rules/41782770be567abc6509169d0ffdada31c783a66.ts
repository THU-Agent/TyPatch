{
  "action": {
    "Call": [
      {
        "CallInit": [
          {
            "arg_idx": 0,
            "func_name": "rhashtable_init"
          }
        ]
      },
      {
        "CallDestroy": [
          {
            "arg_idx": 0,
            "func_name": "rhashtable_destroy"
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
      "CallInit"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallInit"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "mtk_ppe_rhashtable_error_path_leak",
    "key_actions": [
      "CallInit",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallDestroy"
    ],
    "start_action": [
      "CallInit"
    ]
  },
  "event_metadata": {
    "CallDestroy": {
      "role": "release"
    },
    "CallInit": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Initialized",
      "merge_state": "Initialized"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Destroyed",
      "merge_state": "Destroyed"
    }
  ],
  "sliced_action": [
    "CallInit",
    "CallDestroy",
    "ErrExit"
  ],
  "state": [
    "Initialized",
    "Destroyed",
    "Leak"
  ],
  "state_roles": {
    "Destroyed": "safe",
    "Init": "init",
    "Initialized": "danger",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallDestroy",
      "curr_state": "Initialized",
      "next_state": "Destroyed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Initialized",
      "next_state": "Leak"
    },
    {
      "action": "CallInit",
      "curr_state": "Destroyed",
      "next_state": "Initialized"
    },
    {
      "action": "CallInit",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "CallDestroy",
      "curr_state": "Destroyed",
      "next_state": "Destroyed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Destroyed",
      "next_state": "Destroyed"
    },
    {
      "action": "CallInit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDestroy",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallInit",
      "curr_state": "Any",
      "next_state": "Initialized"
    },
    {
      "action": "CallDestroy",
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