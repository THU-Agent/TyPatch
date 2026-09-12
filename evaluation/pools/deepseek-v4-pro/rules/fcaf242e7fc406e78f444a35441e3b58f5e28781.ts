{
  "action": {
    "Call": [
      {
        "ReleaseDmaChan": [
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
        "AcquireDmaChan": [
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
      "AcquireDmaChan"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AcquireDmaChan"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "pata_pxa_dma_leak",
    "key_actions": [
      "AcquireDmaChan",
      "ErrExit"
    ],
    "name": "DMA channel leak on probe error"
  },
  "context": {
    "end_action": [
      "ReleaseDmaChan"
    ],
    "start_action": [
      "AcquireDmaChan"
    ]
  },
  "event_metadata": {
    "AcquireDmaChan": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseDmaChan": {
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
    "AcquireDmaChan",
    "ReleaseDmaChan",
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
      "action": "ReleaseDmaChan",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AcquireDmaChan",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquireDmaChan",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseDmaChan",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireDmaChan",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseDmaChan",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireDmaChan",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseDmaChan",
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