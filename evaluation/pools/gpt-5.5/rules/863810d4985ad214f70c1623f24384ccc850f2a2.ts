{
  "action": {
    "Call": [
      {
        "CallUseRaw": [
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
    "track_objects": [
      "local_named_scalar"
    ],
    "use_load_only": true
  },
  "bug": {
    "bug_state": "UninitUse",
    "key": "lenovo-wmi-other-lwmi-om-hwmon-write-raw-uninit",
    "key_actions": [
      "CallUseRaw"
    ],
    "name": "uninitialized-scalar-use"
  },
  "context": {
    "end_action": [
      "CallUseRaw"
    ],
    "start_action": [
      "StoreInit",
      "CallUseRaw"
    ]
  },
  "event_metadata": {
    "CallUseRaw": {
      "object": {
        "track_objects": [
          "local_named_scalar"
        ]
      },
      "role": "sink"
    },
    "StoreInit": {
      "object": {
        "track_objects": [
          "local_named_scalar"
        ]
      },
      "role": "init"
    }
  },
  "merge": [],
  "sliced_action": [
    "StoreInit",
    "CallUseRaw"
  ],
  "state": [
    "Uninit",
    "Initialized",
    "UninitUse"
  ],
  "state_roles": {
    "Init": "init",
    "Initialized": "safe",
    "UninitUse": "bug"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Initialized"
    },
    {
      "action": "CallUseRaw",
      "curr_state": "Uninit",
      "next_state": "UninitUse"
    },
    {
      "action": "StoreInit",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "CallUseRaw",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "StoreInit",
      "curr_state": "UninitUse",
      "next_state": "UninitUse"
    },
    {
      "action": "CallUseRaw",
      "curr_state": "UninitUse",
      "next_state": "UninitUse"
    }
  ]
}