{
  "action": {
    "Call": [
      {
        "CallZeroRange": [
          {
            "arg_idx": 0,
            "func_name": "ntfs_zero_range"
          }
        ]
      }
    ],
    "StoreInit": [],
    "Use": []
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
    "bug_state": "UninitUse",
    "key": "ntfs-uninitialized-err-write-simple-iomap-begin-non-resident",
    "key_actions": [
      "Use"
    ],
    "name": "uninitialized scalar use"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "StoreInit",
      "Use"
    ]
  },
  "event_metadata": {
    "CallZeroRange": {
      "role": "context"
    },
    "StoreInit": {
      "role": "init"
    },
    "Use": {
      "object": {
        "use_sinks": [
          "branch",
          "return"
        ]
      },
      "role": "sink"
    }
  },
  "merge": [],
  "sliced_action": [
    "CallZeroRange",
    "StoreInit",
    "Use"
  ],
  "state": [
    "Uninit",
    "Initialized",
    "UninitUse"
  ],
  "state_roles": {
    "Init": "danger",
    "Initialized": "safe",
    "UninitUse": "bug"
  },
  "transition": [
    {
      "action": "CallZeroRange",
      "curr_state": "Uninit",
      "next_state": "Initialized"
    },
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
      "action": "CallZeroRange",
      "curr_state": "Initialized",
      "next_state": "Initialized"
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
      "action": "CallZeroRange",
      "curr_state": "UninitUse",
      "next_state": "UninitUse"
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