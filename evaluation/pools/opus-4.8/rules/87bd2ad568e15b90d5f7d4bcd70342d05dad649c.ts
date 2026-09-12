{
  "action": {
    "Call": [
      {
        "CallCreate": [
          {
            "arg_idx": 0,
            "func_name": "posix_cpu_timer_create"
          }
        ]
      },
      {
        "CallDel": [
          {
            "arg_idx": 0,
            "func_name": "posix_cpu_timer_del"
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
      "CallCreate"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallCreate"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "posix_cpu_nanosleep_pid_refcount_leak",
    "key_actions": [
      "CallCreate",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallDel"
    ],
    "start_action": [
      "CallCreate"
    ]
  },
  "event_metadata": {
    "CallCreate": {
      "role": "source"
    },
    "CallDel": {
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
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallCreate",
    "CallDel",
    "ErrExit"
  ],
  "state": [
    "Acquired",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Acquired": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallDel",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "CallCreate",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "CallCreate",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallDel",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallCreate",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDel",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallCreate",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallDel",
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