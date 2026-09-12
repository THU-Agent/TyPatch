{
  "action": {
    "Call": [
      {
        "CallProcGetLong": [
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
    "key": "uninit-var-proc_do_large_bitmap",
    "key_actions": [
      "CallProcGetLong",
      "Use"
    ],
    "name": "Uninitialized scalar variable"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallProcGetLong"
    ]
  },
  "event_metadata": {
    "CallProcGetLong": {
      "role": "context"
    },
    "StoreInit": {
      "role": "guard"
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
    "StoreInit",
    "CallProcGetLong",
    "Use"
  ],
  "state": [
    "Uninit",
    "Safe",
    "UninitUse"
  ],
  "state_roles": {
    "Init": "danger",
    "Safe": "safe",
    "UninitUse": "bug"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Safe"
    },
    {
      "action": "Use",
      "curr_state": "Uninit",
      "next_state": "UninitUse"
    },
    {
      "action": "CallProcGetLong",
      "curr_state": "Uninit",
      "next_state": "Uninit"
    },
    {
      "action": "StoreInit",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "CallProcGetLong",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "Use",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "StoreInit",
      "curr_state": "UninitUse",
      "next_state": "UninitUse"
    },
    {
      "action": "CallProcGetLong",
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