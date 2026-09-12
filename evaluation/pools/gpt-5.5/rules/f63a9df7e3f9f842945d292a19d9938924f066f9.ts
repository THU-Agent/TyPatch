{
  "action": {
    "Call": [
      {
        "CallMaySetC": [
          {
            "arg_idx": 6,
            "func_name": "proc_get_long"
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
    "key": "sysctl-proc-do-large-bitmap-uninit-c",
    "key_actions": [
      "CallMaySetC",
      "Use"
    ],
    "name": "uninitialized scalar use"
  },
  "context": {
    "end_action": [
      "StoreInit",
      "Use"
    ],
    "start_action": [
      "CallMaySetC"
    ]
  },
  "event_metadata": {
    "CallMaySetC": {
      "role": "source"
    },
    "StoreInit": {
      "role": "init"
    },
    "Use": {
      "object": {
        "use_sinks": [
          "branch"
        ]
      },
      "role": "sink"
    }
  },
  "merge": [],
  "sliced_action": [
    "CallMaySetC",
    "StoreInit",
    "Use"
  ],
  "state": [
    "Uninit",
    "MaybeUninit",
    "Initialized",
    "UninitUse"
  ],
  "state_roles": {
    "Init": "init",
    "Initialized": "safe",
    "MaybeUninit": "danger",
    "UninitUse": "bug"
  },
  "transition": [
    {
      "action": "CallMaySetC",
      "curr_state": "Uninit",
      "next_state": "MaybeUninit"
    },
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Initialized"
    },
    {
      "action": "StoreInit",
      "curr_state": "MaybeUninit",
      "next_state": "Initialized"
    },
    {
      "action": "Use",
      "curr_state": "MaybeUninit",
      "next_state": "UninitUse"
    },
    {
      "action": "Use",
      "curr_state": "Uninit",
      "next_state": "Uninit"
    },
    {
      "action": "CallMaySetC",
      "curr_state": "MaybeUninit",
      "next_state": "MaybeUninit"
    },
    {
      "action": "CallMaySetC",
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
      "action": "CallMaySetC",
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