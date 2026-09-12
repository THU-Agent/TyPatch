{
  "action": {
    "Call": [
      {
        "CallGet": [
          {
            "arg_idx": 0,
            "func_name": "pm_runtime_get_sync"
          }
        ]
      },
      {
        "CallPut": [
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
      "CallGet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "meson_spifc_remove_pm_runtime_leak",
    "key_actions": [
      "CallGet",
      "Exit"
    ],
    "name": "runtime PM usage-counter leak on remove"
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
      "role": "source"
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
      "curr_state2": "Got",
      "merge_state": "Got"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Put",
      "merge_state": "Put"
    }
  ],
  "sliced_action": [
    "CallGet",
    "CallPut",
    "Exit"
  ],
  "state": [
    "Got",
    "Put",
    "Leak"
  ],
  "state_roles": {
    "Got": "danger",
    "Init": "init",
    "Leak": "bug",
    "Put": "safe"
  },
  "transition": [
    {
      "action": "CallPut",
      "curr_state": "Got",
      "next_state": "Put"
    },
    {
      "action": "Exit",
      "curr_state": "Got",
      "next_state": "Leak"
    },
    {
      "action": "CallGet",
      "curr_state": "Put",
      "next_state": "Got"
    },
    {
      "action": "CallGet",
      "curr_state": "Got",
      "next_state": "Got"
    },
    {
      "action": "CallPut",
      "curr_state": "Put",
      "next_state": "Put"
    },
    {
      "action": "Exit",
      "curr_state": "Put",
      "next_state": "Put"
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
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGet",
      "curr_state": "Any",
      "next_state": "Got"
    },
    {
      "action": "CallPut",
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