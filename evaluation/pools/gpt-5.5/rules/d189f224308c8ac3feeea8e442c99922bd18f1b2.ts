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
    "key": "nfs_alloc_server_ida_id_error_path_leak",
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
      "role": "source"
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
      "curr_state2": "IdAllocated",
      "merge_state": "IdAllocated"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "IdFreed",
      "merge_state": "IdFreed"
    }
  ],
  "sliced_action": [
    "CallIdaAlloc",
    "CallIdaFree",
    "ErrExit"
  ],
  "state": [
    "IdAllocated",
    "IdFreed",
    "Leak"
  ],
  "state_roles": {
    "IdAllocated": "danger",
    "IdFreed": "safe",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallIdaFree",
      "curr_state": "IdAllocated",
      "next_state": "IdFreed"
    },
    {
      "action": "ErrExit",
      "curr_state": "IdAllocated",
      "next_state": "Leak"
    },
    {
      "action": "CallIdaAlloc",
      "curr_state": "IdFreed",
      "next_state": "IdAllocated"
    },
    {
      "action": "CallIdaAlloc",
      "curr_state": "IdAllocated",
      "next_state": "IdAllocated"
    },
    {
      "action": "CallIdaFree",
      "curr_state": "IdFreed",
      "next_state": "IdFreed"
    },
    {
      "action": "ErrExit",
      "curr_state": "IdFreed",
      "next_state": "IdFreed"
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
      "next_state": "IdAllocated"
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