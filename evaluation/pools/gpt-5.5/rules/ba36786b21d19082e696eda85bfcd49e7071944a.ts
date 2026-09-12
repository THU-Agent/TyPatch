{
  "action": {
    "Call": [
      {
        "CallGet": [
          {
            "arg_idx": 0,
            "func_name": "dma_fence_get"
          }
        ]
      },
      {
        "CallPut": [
          {
            "arg_idx": 0,
            "func_name": "dma_fence_put"
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
      "CallGet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallGet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "drm-xe-range-fence-insert-dma-fence-ref-leak",
    "key_actions": [
      "CallGet",
      "ErrExit"
    ],
    "name": "error-path refcount leak"
  },
  "context": {
    "end_action": [
      "CallPut"
    ],
    "start_action": [
      "CallGet"
    ]
  },
  "event_metadata": {
    "CallGet": {
      "role": "acquire"
    },
    "CallPut": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Referenced",
      "merge_state": "Referenced"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallGet",
    "CallPut",
    "ErrExit"
  ],
  "state": [
    "Referenced",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Referenced": "danger",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallPut",
      "curr_state": "Referenced",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Referenced",
      "next_state": "Leak"
    },
    {
      "action": "CallGet",
      "curr_state": "Released",
      "next_state": "Referenced"
    },
    {
      "action": "CallGet",
      "curr_state": "Referenced",
      "next_state": "Referenced"
    },
    {
      "action": "CallPut",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallGet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGet",
      "curr_state": "Any",
      "next_state": "Referenced"
    },
    {
      "action": "CallPut",
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