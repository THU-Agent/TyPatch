{
  "action": {
    "Call": [
      {
        "CallInc": [
          {
            "arg_idx": 0,
            "func_name": "refcount_inc"
          }
        ]
      },
      {
        "CallDec": [
          {
            "arg_idx": 0,
            "func_name": "refcount_dec"
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
      "CallInc"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallInc"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "devlink_rate_node_create_parent_ref_leak",
    "key_actions": [
      "CallInc",
      "ErrExit"
    ],
    "name": "error-path refcount leak"
  },
  "context": {
    "end_action": [
      "CallDec"
    ],
    "start_action": [
      "CallInc"
    ]
  },
  "event_metadata": {
    "CallDec": {
      "role": "release"
    },
    "CallInc": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Incremented",
      "merge_state": "Incremented"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Decremented",
      "merge_state": "Decremented"
    }
  ],
  "sliced_action": [
    "CallInc",
    "CallDec",
    "ErrExit"
  ],
  "state": [
    "Incremented",
    "Decremented",
    "Leak"
  ],
  "state_roles": {
    "Decremented": "safe",
    "Incremented": "danger",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallDec",
      "curr_state": "Incremented",
      "next_state": "Decremented"
    },
    {
      "action": "ErrExit",
      "curr_state": "Incremented",
      "next_state": "Leak"
    },
    {
      "action": "CallInc",
      "curr_state": "Decremented",
      "next_state": "Incremented"
    },
    {
      "action": "CallInc",
      "curr_state": "Incremented",
      "next_state": "Incremented"
    },
    {
      "action": "CallDec",
      "curr_state": "Decremented",
      "next_state": "Decremented"
    },
    {
      "action": "ErrExit",
      "curr_state": "Decremented",
      "next_state": "Decremented"
    },
    {
      "action": "CallInc",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDec",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallInc",
      "curr_state": "Any",
      "next_state": "Incremented"
    },
    {
      "action": "CallDec",
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