{
  "action": {
    "Call": [
      {
        "CallFree": [
          {
            "arg_idx": 2,
            "func_name": "dm_helpers_free_gpu_mem"
          }
        ]
      }
    ],
    "StoreNull": []
  },
  "analysis": {
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "path_sensitive_verify": true,
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "dcn42_double_free",
    "key_actions": [
      "CallFree",
      "CallFree"
    ],
    "name": "double-free of smu_wm_set"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "CallFree"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "release"
    },
    "StoreNull": {
      "role": "guard"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "CallFree",
    "StoreNull"
  ],
  "state": [
    "Untracked",
    "Freed",
    "DoubleFree"
  ],
  "state_roles": {
    "DoubleFree": "bug",
    "Freed": "danger",
    "Init": "init"
  },
  "transition": [
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "DoubleFree"
    },
    {
      "action": "StoreNull",
      "curr_state": "Freed",
      "next_state": "Untracked"
    },
    {
      "action": "StoreNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFree",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "StoreNull",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    }
  ]
}