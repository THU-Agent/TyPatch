{
  "action": {
    "Call": [
      {
        "CallRefGet": [
          {
            "arg_idx": 0,
            "func_name": "kref_get"
          }
        ]
      },
      {
        "CallRefPut": [
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
      "CallRefGet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallRefGet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "ipmi_supplied_recv_refcount_leak",
    "key_actions": [
      "CallRefGet",
      "ErrExit"
    ],
    "name": "error-path refcount leak"
  },
  "context": {
    "end_action": [
      "CallRefPut"
    ],
    "start_action": [
      "CallRefGet"
    ]
  },
  "event_metadata": {
    "CallRefGet": {
      "role": "source"
    },
    "CallRefPut": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "RefHeld",
      "merge_state": "RefHeld"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "RefReleased",
      "merge_state": "RefReleased"
    }
  ],
  "sliced_action": [
    "CallRefGet",
    "CallRefPut",
    "ErrExit"
  ],
  "state": [
    "RefHeld",
    "RefReleased",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "RefHeld": "danger",
    "RefReleased": "safe"
  },
  "transition": [
    {
      "action": "CallRefPut",
      "curr_state": "RefHeld",
      "next_state": "RefReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "RefHeld",
      "next_state": "Leak"
    },
    {
      "action": "CallRefGet",
      "curr_state": "RefReleased",
      "next_state": "RefHeld"
    },
    {
      "action": "CallRefGet",
      "curr_state": "RefHeld",
      "next_state": "RefHeld"
    },
    {
      "action": "CallRefPut",
      "curr_state": "RefReleased",
      "next_state": "RefReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "RefReleased",
      "next_state": "RefReleased"
    },
    {
      "action": "CallRefGet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRefPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRefGet",
      "curr_state": "Any",
      "next_state": "RefHeld"
    },
    {
      "action": "CallRefPut",
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