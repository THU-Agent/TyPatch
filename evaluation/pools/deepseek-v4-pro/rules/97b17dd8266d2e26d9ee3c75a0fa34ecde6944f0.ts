{
  "action": {
    "Call": [
      {
        "CallEnable": [
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
      "CallEnable"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "spi-orion-runtime-pm-leak",
    "key_actions": [
      "CallEnable",
      "Exit"
    ],
    "name": "runtime-pm-usage-leak"
  },
  "context": {
    "end_action": [
      "CallDisable"
    ],
    "start_action": [
      "CallEnable"
    ]
  },
  "event_metadata": {
    "CallDisable": {
      "role": "release"
    },
    "CallEnable": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Enabled",
      "merge_state": "Enabled"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallEnable",
    "CallDisable",
    "Exit"
  ],
  "state": [
    "Enabled",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Enabled": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallDisable",
      "curr_state": "Enabled",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Enabled",
      "next_state": "Leak"
    },
    {
      "action": "CallEnable",
      "curr_state": "Released",
      "next_state": "Enabled"
    },
    {
      "action": "CallEnable",
      "curr_state": "Enabled",
      "next_state": "Enabled"
    },
    {
      "action": "CallDisable",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallEnable",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDisable",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallEnable",
      "curr_state": "Any",
      "next_state": "Enabled"
    },
    {
      "action": "CallDisable",
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