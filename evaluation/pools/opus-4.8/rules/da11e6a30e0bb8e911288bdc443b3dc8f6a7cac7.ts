{
  "action": {
    "Call": [
      {
        "CallAlloc": [
          {
            "arg_idx": 0,
            "func_name": "dma_alloc_wc"
          }
        ]
      },
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "dma_free_wc"
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
      "CallAlloc"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallAlloc"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "imxfb_fb_add_videomode_unchecked_leak",
    "key_actions": [
      "CallAlloc",
      "ErrExit"
    ],
    "name": "error-path resource-leak on unchecked fb_add_videomode failure"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "CallAlloc"
    ]
  },
  "event_metadata": {
    "CallAlloc": {
      "role": "source"
    },
    "CallFree": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Allocated",
      "merge_state": "Allocated"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallAlloc",
    "CallFree",
    "ErrExit"
  ],
  "state": [
    "Allocated",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Allocated": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallFree",
      "curr_state": "Allocated",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Allocated",
      "next_state": "Leak"
    },
    {
      "action": "CallAlloc",
      "curr_state": "Released",
      "next_state": "Allocated"
    },
    {
      "action": "CallAlloc",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "CallFree",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallAlloc",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallFree",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallAlloc",
      "curr_state": "Any",
      "next_state": "Allocated"
    },
    {
      "action": "CallFree",
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