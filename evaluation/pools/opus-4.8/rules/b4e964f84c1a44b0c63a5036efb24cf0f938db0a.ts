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
    "store_zero_as_init": true,
    "track_objects": [
      "local_named_nonparam_int"
    ],
    "use_load_only": true
  },
  "bug": {
    "bug_state": "UninitUse",
    "key": "gaudi_debugfs_read_dma_uninit_rc_zero_size",
    "key_actions": [
      "Use"
    ],
    "name": "uninitialized scalar return"
  },
  "context": {
    "end_action": [],
    "start_action": []
  },
  "event_metadata": {
    "StoreInit": {
      "role": "init"
    },
    "Use": {
      "object": {
        "track_objects": [
          "local_named_nonparam_int"
        ],
        "use_sinks": [
          "return"
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