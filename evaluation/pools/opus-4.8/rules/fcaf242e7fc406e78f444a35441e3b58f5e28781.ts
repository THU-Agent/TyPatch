{
  "action": {
    "Call": [
      {
        "ReleaseChan": [
          {
            "arg_idx": 0,
            "func_name": "dma_release_channel"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "AcquireChan": [
          "dma_request_chan"
        ]
      }
    ]
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
      "AcquireChan"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AcquireChan"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "pata_pxa_dma_channel_leak",
    "key_actions": [
      "AcquireChan",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "ReleaseChan"
    ],
    "start_action": [
      "AcquireChan"
    ]
  },
  "event_metadata": {
    "AcquireChan": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseChan": {
      "role": "release"
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
    "AcquireChan",
    "ReleaseChan",
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
      "action": "ReleaseChan",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AcquireChan",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquireChan",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseChan",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireChan",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseChan",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireChan",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseChan",
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