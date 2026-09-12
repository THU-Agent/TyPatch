{
  "action": {
    "Call": [
      {
        "KrefGet": [
          {
            "arg_idx": 0,
            "func_name": "kref_get"
          }
        ]
      },
      {
        "KrefPut": [
          {
            "arg_idx": 0,
            "func_name": "kref_put"
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
      "KrefGet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "KrefGet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "ipmi-refcount-leak",
    "key_actions": [
      "KrefGet",
      "ErrExit"
    ],
    "name": "refcount leak in i_ipmi_request"
  },
  "context": {
    "end_action": [
      "KrefPut"
    ],
    "start_action": [
      "KrefGet"
    ]
  },
  "event_metadata": {
    "Exit": {
      "role": "sink"
    },
    "KrefGet": {
      "role": "source"
    },
    "KrefPut": {
      "role": "release"
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
    "KrefGet",
    "KrefPut",
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
      "action": "KrefPut",
      "curr_state": "Acquired",
      "next_state": "Any"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "KrefGet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "KrefGet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "KrefPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "KrefGet",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "KrefPut",
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