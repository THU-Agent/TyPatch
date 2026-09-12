{
  "action": {
    "Call": [
      {
        "CallGetSync": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_get_sync"
          }
        ]
      },
      {
        "CallDisable": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_disable"
          }
        ]
      },
      {
        "CallPutNoidle": [
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
    "path_sensitive_candidate_generation": false,
    "path_sensitive_verify": true,
    "report_key_actions_same_function": true,
    "source_actions": [
      "CallGetSync"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "spi-orion-runtime-pm-usage-leak-remove",
    "key_actions": [
      "CallGetSync",
      "Exit"
    ],
    "name": "runtime-pm usage-count leak"
  },
  "context": {
    "end_action": [
      "CallPutNoidle"
    ],
    "start_action": [
      "CallGetSync"
    ]
  },
  "event_metadata": {
    "CallDisable": {
      "role": "teardown"
    },
    "CallGetSync": {
      "role": "source"
    },
    "CallPutNoidle": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Held",
      "merge_state": "Held"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Balanced",
      "merge_state": "Balanced"
    }
  ],
  "sliced_action": [
    "CallGetSync",
    "CallDisable",
    "CallPutNoidle",
    "Exit"
  ],
  "state": [
    "Held",
    "Balanced",
    "Leak"
  ],
  "state_roles": {
    "Balanced": "safe",
    "Held": "danger",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallPutNoidle",
      "curr_state": "Held",
      "next_state": "Balanced"
    },
    {
      "action": "Exit",
      "curr_state": "Held",
      "next_state": "Leak"
    },
    {
      "action": "CallGetSync",
      "curr_state": "Balanced",
      "next_state": "Held"
    },
    {
      "action": "CallGetSync",
      "curr_state": "Held",
      "next_state": "Held"
    },
    {
      "action": "CallDisable",
      "curr_state": "Held",
      "next_state": "Held"
    },
    {
      "action": "CallDisable",
      "curr_state": "Balanced",
      "next_state": "Balanced"
    },
    {
      "action": "CallPutNoidle",
      "curr_state": "Balanced",
      "next_state": "Balanced"
    },
    {
      "action": "Exit",
      "curr_state": "Balanced",
      "next_state": "Balanced"
    },
    {
      "action": "CallGetSync",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDisable",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPutNoidle",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGetSync",
      "curr_state": "Any",
      "next_state": "Held"
    },
    {
      "action": "CallDisable",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallPutNoidle",
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
