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
      "local_named_nonparam_int",
      "local_named_scalar"
    ],
    "use_load_only": true
  },
  "bug": {
    "bug_state": "UninitUse",
    "key": "dmz_iterate_devices_uninit_r",
    "key_actions": [
      "Use"
    ],
    "name": "uninitialized return variable"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "StoreInit"
    ]
  },
  "event_metadata": {
    "StoreInit": {
      "role": "init"
    },
    "Use": {
      "object": {
        "track_objects": [
          "local_named_scalar"
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
    "Assigned",
    "UninitUse"
  ],
  "state_roles": {
    "Assigned": "safe",
    "Init": "init",
    "UninitUse": "bug"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Assigned"
    },
    {
      "action": "Use",
      "curr_state": "Uninit",
      "next_state": "UninitUse"
    },
    {
      "action": "StoreInit",
      "curr_state": "Assigned",
      "next_state": "Assigned"
    },
    {
      "action": "Use",
      "curr_state": "Assigned",
      "next_state": "Assigned"
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