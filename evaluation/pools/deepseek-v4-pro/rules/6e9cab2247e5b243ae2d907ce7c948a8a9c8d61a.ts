{
  "action": {
    "Call": [
      {
        "CallRegister": [
          {
            "arg_idx": 0,
            "func_name": "dell_laptop_register_notifier"
          }
        ]
      },
      {
        "CallUnregister": [
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
      "CallRegister"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallRegister"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "dell-laptop-resource-leak",
    "key_actions": [
      "CallRegister",
      "ErrExit"
    ],
    "name": "resource-leak"
  },
  "context": {
    "end_action": [
      "CallUnregister"
    ],
    "start_action": [
      "CallRegister"
    ]
  },
  "event_metadata": {
    "CallRegister": {
      "role": "source"
    },
    "CallUnregister": {
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
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallRegister",
    "CallUnregister",
    "ErrExit"
  ],
  "state": [
    "Registered",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Registered": "danger",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallUnregister",
      "curr_state": "Registered",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Registered",
      "next_state": "Leak"
    },
    {
      "action": "CallRegister",
      "curr_state": "Released",
      "next_state": "Registered"
    },
    {
      "action": "CallRegister",
      "curr_state": "Registered",
      "next_state": "Registered"
    },
    {
      "action": "CallUnregister",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallRegister",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallUnregister",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRegister",
      "curr_state": "Any",
      "next_state": "Registered"
    },
    {
      "action": "CallUnregister",
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