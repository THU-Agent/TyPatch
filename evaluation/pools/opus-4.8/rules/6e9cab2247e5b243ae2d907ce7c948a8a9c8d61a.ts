{
  "action": {
    "Call": [
      {
        "CallRegisterNotifier": [
          {
            "arg_idx": 0,
            "func_name": "dell_laptop_register_notifier"
          }
        ]
      },
      {
        "CallUnregisterNotifier": [
          {
            "arg_idx": 0,
            "func_name": "dell_laptop_unregister_notifier"
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
      "CallRegisterNotifier"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallRegisterNotifier"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "dell_laptop_init_error_path_leak",
    "key_actions": [
      "CallRegisterNotifier",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallUnregisterNotifier"
    ],
    "start_action": [
      "CallRegisterNotifier"
    ]
  },
  "event_metadata": {
    "CallRegisterNotifier": {
      "role": "source"
    },
    "CallUnregisterNotifier": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Registered",
      "merge_state": "Registered"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Unregistered",
      "merge_state": "Unregistered"
    }
  ],
  "sliced_action": [
    "CallRegisterNotifier",
    "CallUnregisterNotifier",
    "ErrExit"
  ],
  "state": [
    "Registered",
    "Unregistered",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Registered": "danger",
    "Unregistered": "safe"
  },
  "transition": [
    {
      "action": "CallUnregisterNotifier",
      "curr_state": "Registered",
      "next_state": "Unregistered"
    },
    {
      "action": "ErrExit",
      "curr_state": "Registered",
      "next_state": "Leak"
    },
    {
      "action": "CallRegisterNotifier",
      "curr_state": "Unregistered",
      "next_state": "Registered"
    },
    {
      "action": "CallRegisterNotifier",
      "curr_state": "Registered",
      "next_state": "Registered"
    },
    {
      "action": "CallUnregisterNotifier",
      "curr_state": "Unregistered",
      "next_state": "Unregistered"
    },
    {
      "action": "ErrExit",
      "curr_state": "Unregistered",
      "next_state": "Unregistered"
    },
    {
      "action": "CallRegisterNotifier",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallUnregisterNotifier",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRegisterNotifier",
      "curr_state": "Any",
      "next_state": "Registered"
    },
    {
      "action": "CallUnregisterNotifier",
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