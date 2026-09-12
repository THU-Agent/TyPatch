{
  "action": {
    "Call": [
      {
        "CallUse": [
          {
            "arg_idx": 2,
            "func_name": "lwmi_om_fan_get_set"
          }
        ]
      }
    ],
    "StoreInit": []
  },
  "analysis": {
    "action_sources": {
      "Use": [
        "load"
      ]
    },
    "backend": "fs",
    "call_outparam_as_init": true,
    "initial_state": "Uninit",
    "intra_procedural_cfg": true,
    "load_as_use": true,
    "merge_default": "must_init",
    "store_zero_as_init": true,
    "use_load_only": true
  },
  "bug": {
    "bug_state": "Bug",
    "key": "uninit-raw-lwmi-om",
    "key_actions": [
      "CallUse"
    ],
    "name": "uninitialized scalar use"
  },
  "context": {
    "end_action": [
      "CallUse"
    ],
    "start_action": [
      "StoreInit"
    ]
  },
  "event_metadata": {
    "CallUse": {
      "role": "sink"
    },
    "StoreInit": {
      "role": "guard"
    }
  },
  "merge": [],
  "sliced_action": [
    "StoreInit",
    "CallUse"
  ],
  "state": [
    "Uninit",
    "Initialized",
    "Bug"
  ],
  "state_roles": {
    "Bug": "bug",
    "Init": "danger",
    "Initialized": "safe"
  },
  "transition": [
    {
      "action": "CallUse",
      "curr_state": "Uninit",
      "next_state": "Bug"
    },
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Initialized"
    },
    {
      "action": "CallUse",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "StoreInit",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "CallUse",
      "curr_state": "Bug",
      "next_state": "Bug"
    },
    {
      "action": "StoreInit",
      "curr_state": "Bug",
      "next_state": "Bug"
    }
  ]
}