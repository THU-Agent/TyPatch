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
      "local_named_nonparam_int"
    ],
    "use_load_only": true
  },
  "bug": {
    "bug_state": "Bug",
    "key": "ntfs-uninit-err",
    "key_actions": [
      "Use"
    ],
    "name": "uninitialized scalar use"
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
      "object": {
        "use_sinks": [
          "branch"
        ]
      },
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Inited",
      "curr_state2": "Bug",
      "merge_state": "Bug"
    }
  ],
  "sliced_action": [
    "StoreInit",
    "Use"
  ],
  "state": [
    "Uninit",
    "Inited",
    "Bug"
  ],
  "state_roles": {
    "Bug": "bug",
    "Init": "danger",
    "Inited": "safe"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Inited"
    },
    {
      "action": "Use",
      "curr_state": "Uninit",
      "next_state": "Bug"
    },
    {
      "action": "StoreInit",
      "curr_state": "Inited",
      "next_state": "Inited"
    },
    {
      "action": "Use",
      "curr_state": "Inited",
      "next_state": "Inited"
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