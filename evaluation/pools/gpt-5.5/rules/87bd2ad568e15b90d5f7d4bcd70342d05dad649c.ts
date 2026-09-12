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
        "CallDelete": [
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
    "key": "posix-cpu-timers-do_cpu_nanosleep-pid-ref-leak",
    "key_actions": [
      "CallCreate",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallDelete"
    ],
    "start_action": [
      "CallCreate"
    ]
  },
  "event_metadata": {
    "CallCreate": {
      "role": "acquire"
    },
    "CallDelete": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Created",
      "merge_state": "Created"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Deleted",
      "merge_state": "Deleted"
    }
  ],
  "sliced_action": [
    "CallCreate",
    "CallDelete",
    "ErrExit"
  ],
  "state": [
    "Created",
    "Deleted",
    "Leak"
  ],
  "state_roles": {
    "Created": "danger",
    "Deleted": "safe",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallDelete",
      "curr_state": "Created",
      "next_state": "Deleted"
    },
    {
      "action": "ErrExit",
      "curr_state": "Created",
      "next_state": "Leak"
    },
    {
      "action": "CallCreate",
      "curr_state": "Deleted",
      "next_state": "Created"
    },
    {
      "action": "CallCreate",
      "curr_state": "Created",
      "next_state": "Created"
    },
    {
      "action": "CallDelete",
      "curr_state": "Deleted",
      "next_state": "Deleted"
    },
    {
      "action": "ErrExit",
      "curr_state": "Deleted",
      "next_state": "Deleted"
    },
    {
      "action": "CallCreate",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDelete",
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
      "next_state": "Created"
    },
    {
      "action": "CallDelete",
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