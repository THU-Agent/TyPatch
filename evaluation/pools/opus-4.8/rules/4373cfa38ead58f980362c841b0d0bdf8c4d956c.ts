{
  "action": {
    "Call": [
      {
        "ReleaseRef": [
          {
            "arg_idx": 0,
            "func_name": "power_supply_put"
          }
        ]
      }
    ],
    "Exit": [],
    "Ret": [
      {
        "AcquireRef": [
          "power_supply_get_by_name"
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
      "AcquireRef"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "charger_manager_is_full_charged_refcount_leak",
    "key_actions": [
      "AcquireRef",
      "Exit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "ReleaseRef"
    ],
    "start_action": [
      "AcquireRef"
    ]
  },
  "event_metadata": {
    "AcquireRef": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseRef": {
      "role": "release"
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
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "AcquireRef",
    "ReleaseRef",
    "Exit"
  ],
  "state": [
    "Held",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Held": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "ReleaseRef",
      "curr_state": "Held",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Held",
      "next_state": "Leak"
    },
    {
      "action": "AcquireRef",
      "curr_state": "Released",
      "next_state": "Held"
    },
    {
      "action": "AcquireRef",
      "curr_state": "Held",
      "next_state": "Held"
    },
    {
      "action": "ReleaseRef",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireRef",
      "curr_state": "Any",
      "next_state": "Held"
    },
    {
      "action": "ReleaseRef",
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