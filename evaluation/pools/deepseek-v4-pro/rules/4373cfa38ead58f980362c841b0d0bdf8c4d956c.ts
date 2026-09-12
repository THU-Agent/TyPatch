{
  "action": {
    "Call": [
      {
        "ReleaseFuelGauge": [
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
        "AcquireFuelGauge": [
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
      "AcquireFuelGauge"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "cm-refcount-leak",
    "key_actions": [
      "AcquireFuelGauge",
      "Exit"
    ],
    "name": "refcount-leak"
  },
  "context": {
    "end_action": [
      "ReleaseFuelGauge"
    ],
    "start_action": [
      "AcquireFuelGauge"
    ]
  },
  "event_metadata": {
    "AcquireFuelGauge": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseFuelGauge": {
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
    "AcquireFuelGauge",
    "ReleaseFuelGauge",
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
      "action": "Exit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseFuelGauge",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "AcquireFuelGauge",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquireFuelGauge",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ReleaseFuelGauge",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireFuelGauge",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseFuelGauge",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireFuelGauge",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "Exit",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "ReleaseFuelGauge",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}