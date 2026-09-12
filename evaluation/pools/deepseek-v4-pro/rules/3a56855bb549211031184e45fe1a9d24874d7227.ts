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
    "bug_state": "Bug",
    "key": "scarlett2-uninit-err",
    "key_actions": [
      "Use"
    ],
    "name": "uninitialized scalar variable"
  },
  "context": {
    "end_action": [],
    "start_action": []
  },
  "event_metadata": {
    "StoreInit": {
      "role": "guard"
    },
    "Use": {
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
    "Bug"
  ],
  "state_roles": {
    "Bug": "bug",
    "Init": "danger",
    "Initialized": "safe"
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
      "next_state": "Bug"
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
      "curr_state": "Bug",
      "next_state": "Bug"
    },
    {
      "action": "Use",
      "curr_state": "Bug",
      "next_state": "Bug"
    }
  ]
}