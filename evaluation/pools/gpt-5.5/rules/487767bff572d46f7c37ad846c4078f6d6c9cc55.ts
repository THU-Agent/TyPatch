{
  "action": {
    "StoreInit": [],
    "Use": []
  },
  "analysis": {
    "action_sources": {
      "Use": [
        "load_return"
      ]
    },
    "backend": "fs",
    "call_outparam_as_init": true,
    "initial_state": "Uninit",
    "intra_procedural_cfg": true,
    "load_as_use": true,
    "merge_default": "must_init",
    "path_sensitive_candidate_generation": false,
    "path_sensitive_verify": false,
    "store_zero_as_init": true,
    "track_objects": [
      "local_named_nonparam_int",
      "local_named_scalar"
    ],
    "use_load_only": true
  },
  "bug": {
    "bug_state": "UninitUse",
    "key": "dmz_iterate_devices-uninitialized-r-return",
    "key_actions": [
      "Use"
    ],
    "name": "uninitialized scalar return"
  },
  "context": {
    "end_action": [
      "StoreInit",
      "Use"
    ],
    "start_action": []
  },
  "event_metadata": {
    "StoreInit": {
      "role": "init"
    },
    "Use": {
      "object": {
        "functions": [
          "dmz_iterate_devices"
        ],
        "track_objects": [
          "local_named_scalar"
        ],
        "use_sinks": [
          "return"
        ],
        "variables": [
          "r"
        ]
      },
      "role": "sink"
    }
  },
  "merge": [],
  "sliced_action": [
    "StoreInit",
    "Use"
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
      "action": "Use",
      "curr_state": "Uninit",
      "next_state": "UninitUse"
    },
    {
      "action": "StoreInit",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "Use",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "StoreInit",
      "curr_state": "UninitUse",
      "next_state": "UninitUse"
    },
    {
      "action": "Use",
      "curr_state": "UninitUse",
      "next_state": "UninitUse"
    }
  ]
}
