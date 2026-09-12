{
  "action": {
    "Call": [
      {
        "CallRefcntInc": [
          {
            "arg_idx": 0,
            "field_path": "refcnt",
            "func_name": "refcount_inc"
          }
        ]
      },
      {
        "CallRefcntDec": [
          {
            "arg_idx": 0,
            "field_path": "refcnt",
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
    "disable_slice": true,
    "initial_state": "Init",
    "intra_procedural_cfg": true,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_same_function": true,
    "source_actions": [
      "CallRefcntInc"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallRefcntInc"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "devlink-rate-node-parent-refcnt-leak",
    "key_actions": [
      "CallRefcntInc",
      "ErrExit"
    ],
    "name": "devlink rate node create parent refcnt leak"
  },
  "context": {
    "end_action": [
      "CallRefcntDec"
    ],
    "start_action": [
      "CallRefcntInc"
    ]
  },
  "event_metadata": {
    "CallRefcntDec": {
      "role": "release"
    },
    "CallRefcntInc": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Incd",
      "merge_state": "Incd"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Decd",
      "merge_state": "Decd"
    }
  ],
  "sliced_action": [
    "CallRefcntInc",
    "CallRefcntDec",
    "ErrExit"
  ],
  "state": [
    "Incd",
    "Decd",
    "Leak"
  ],
  "state_roles": {
    "Decd": "safe",
    "Incd": "danger",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallRefcntDec",
      "curr_state": "Incd",
      "next_state": "Decd"
    },
    {
      "action": "ErrExit",
      "curr_state": "Incd",
      "next_state": "Leak"
    },
    {
      "action": "CallRefcntInc",
      "curr_state": "Decd",
      "next_state": "Incd"
    },
    {
      "action": "CallRefcntInc",
      "curr_state": "Incd",
      "next_state": "Incd"
    },
    {
      "action": "CallRefcntDec",
      "curr_state": "Decd",
      "next_state": "Decd"
    },
    {
      "action": "ErrExit",
      "curr_state": "Decd",
      "next_state": "Decd"
    },
    {
      "action": "CallRefcntInc",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRefcntDec",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRefcntInc",
      "curr_state": "Any",
      "next_state": "Incd"
    },
    {
      "action": "CallRefcntDec",
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