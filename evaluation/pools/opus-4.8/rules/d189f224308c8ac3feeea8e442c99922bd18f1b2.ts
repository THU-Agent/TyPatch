{
  "action": {
    "Call": [
      {
        "CallIdaAlloc": [
          {
            "arg_idx": 0,
            "func_name": "ida_alloc"
          }
        ]
      },
      {
        "CallIdaFree": [
          {
            "arg_idx": 0,
            "func_name": "ida_free"
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
      "CallIdaAlloc"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallIdaAlloc"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "nfs_alloc_server_error_path_ida_leak",
    "key_actions": [
      "CallIdaAlloc",
      "ErrExit"
    ],
    "name": "error-path resource leak"
  },
  "context": {
    "end_action": [
      "CallIdaFree"
    ],
    "start_action": [
      "CallIdaAlloc"
    ]
  },
  "event_metadata": {
    "CallIdaAlloc": {
      "role": "acquire"
    },
    "CallIdaFree": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "IdaAllocated",
      "merge_state": "IdaAllocated"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "IdaFreed",
      "merge_state": "IdaFreed"
    }
  ],
  "sliced_action": [
    "CallIdaAlloc",
    "CallIdaFree",
    "ErrExit"
  ],
  "state": [
    "IdaAllocated",
    "IdaFreed",
    "Leak"
  ],
  "state_roles": {
    "IdaAllocated": "danger",
    "IdaFreed": "safe",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallIdaFree",
      "curr_state": "IdaAllocated",
      "next_state": "IdaFreed"
    },
    {
      "action": "ErrExit",
      "curr_state": "IdaAllocated",
      "next_state": "Leak"
    },
    {
      "action": "CallIdaAlloc",
      "curr_state": "IdaFreed",
      "next_state": "IdaAllocated"
    },
    {
      "action": "CallIdaAlloc",
      "curr_state": "IdaAllocated",
      "next_state": "IdaAllocated"
    },
    {
      "action": "CallIdaFree",
      "curr_state": "IdaFreed",
      "next_state": "IdaFreed"
    },
    {
      "action": "ErrExit",
      "curr_state": "IdaFreed",
      "next_state": "IdaFreed"
    },
    {
      "action": "CallIdaAlloc",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallIdaFree",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallIdaAlloc",
      "curr_state": "Any",
      "next_state": "IdaAllocated"
    },
    {
      "action": "CallIdaFree",
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