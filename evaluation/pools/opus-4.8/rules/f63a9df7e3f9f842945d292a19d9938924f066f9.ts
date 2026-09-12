{
  "action": {
    "StoreInit": [],
    "Use": []
  },
  "analysis": {
    "action_sources": {
      "Use": [
        "load_branch"
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
    "key": "proc_do_large_bitmap_uninit_c",
    "key_actions": [
      "Use"
    ],
    "name": "uninitialized-scalar-use"
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
          "branch"
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
    "Stored",
    "UninitUse"
  ],
  "state_roles": {
    "Init": "init",
    "Stored": "safe",
    "UninitUse": "bug"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Stored"
    },
    {
      "action": "Use",
      "curr_state": "Uninit",
      "next_state": "UninitUse"
    },
    {
      "action": "StoreInit",
      "curr_state": "Stored",
      "next_state": "Stored"
    },
    {
      "action": "Use",
      "curr_state": "Stored",
      "next_state": "Stored"
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