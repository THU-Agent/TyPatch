{
  "action": {
    "Call": [
      {
        "CallGetRuntimeSync": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_get_sync"
          }
        ]
      },
      {
        "CallPutRuntimeNoidle": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_put_noidle"
          }
        ]
      }
    ],
    "Exit": []
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
      "CallGetRuntimeSync"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "spi-meson-spifc-runtime-pm-leak",
    "key_actions": [
      "CallGetRuntimeSync",
      "Exit"
    ],
    "name": "runtime-pm-usage-counter-leak"
  },
  "context": {
    "end_action": [
      "CallPutRuntimeNoidle"
    ],
    "start_action": [
      "CallGetRuntimeSync"
    ]
  },
  "event_metadata": {
    "CallGetRuntimeSync": {
      "role": "source"
    },
    "CallPutRuntimeNoidle": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
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
    },
    {
      "curr_state1": "Acquired",
      "curr_state2": "Released",
      "merge_state": "Acquired"
    }
  ],
  "sliced_action": [
    "CallGetRuntimeSync",
    "CallPutRuntimeNoidle",
    "Exit"
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
      "action": "CallPutRuntimeNoidle",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "CallGetRuntimeSync",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "CallGetRuntimeSync",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallPutRuntimeNoidle",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallGetRuntimeSync",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPutRuntimeNoidle",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGetRuntimeSync",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallPutRuntimeNoidle",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "Exit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}