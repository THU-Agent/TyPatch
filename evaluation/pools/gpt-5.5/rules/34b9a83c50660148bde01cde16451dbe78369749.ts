{
  "action": {
    "Call": [
      {
        "CallGetRef": [
          {
            "arg_idx": 0,
            "func_name": "kref_get_unless_zero"
          }
        ]
      },
      {
        "CallPutRef": [
          {
            "arg_idx": 0,
            "field_path": "ref",
            "func_name": "nvmet_ctrl_put"
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
      "CallGetRef"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallGetRef"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "nvmet-sq-create-refcount-leak",
    "key_actions": [
      "CallGetRef",
      "ErrExit"
    ],
    "name": "error-path refcount leak"
  },
  "context": {
    "end_action": [
      "CallPutRef"
    ],
    "start_action": [
      "CallGetRef"
    ]
  },
  "event_metadata": {
    "CallGetRef": {
      "role": "acquire"
    },
    "CallPutRef": {
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
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallGetRef",
    "CallPutRef",
    "ErrExit"
  ],
  "state": [
    "RefHeld",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "RefHeld": "danger",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallPutRef",
      "curr_state": "RefHeld",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "RefHeld",
      "next_state": "Leak"
    },
    {
      "action": "CallGetRef",
      "curr_state": "Released",
      "next_state": "RefHeld"
    },
    {
      "action": "CallGetRef",
      "curr_state": "RefHeld",
      "next_state": "RefHeld"
    },
    {
      "action": "CallPutRef",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallGetRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPutRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGetRef",
      "curr_state": "Any",
      "next_state": "RefHeld"
    },
    {
      "action": "CallPutRef",
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