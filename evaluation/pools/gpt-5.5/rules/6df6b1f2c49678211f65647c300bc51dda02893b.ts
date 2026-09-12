{
  "action": {
    "Call": [
      {
        "CallRelease": [
          {
            "arg_idx": 0,
            "func_name": "input_free_device"
          }
        ]
      }
    ],
    "Ret": [
      {
        "AllocRet": [
          "hidpp_allocate_input"
        ]
      }
    ],
    "StoreNull": [],
    "Use": []
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "hidpp_connect_event_stale_input_uaf",
    "key_actions": [
      "AllocRet",
      "CallRelease",
      "Use"
    ],
    "name": "use-after-free through stale input device pointer"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "CallRelease": {
      "role": "release"
    },
    "StoreNull": {
      "role": "guard"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Allocated",
      "merge_state": "Allocated"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Cleared",
      "merge_state": "Cleared"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "ReleasedStale",
      "merge_state": "ReleasedStale"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "ReleasedCleared",
      "merge_state": "ReleasedCleared"
    },
    {
      "curr_state1": "Allocated",
      "curr_state2": "Cleared",
      "merge_state": "Allocated"
    },
    {
      "curr_state1": "ReleasedStale",
      "curr_state2": "ReleasedCleared",
      "merge_state": "ReleasedStale"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "StoreNull",
    "CallRelease",
    "Use"
  ],
  "state": [
    "Untracked",
    "Allocated",
    "Cleared",
    "ReleasedStale",
    "ReleasedCleared",
    "UAF"
  ],
  "state_roles": {
    "Allocated": "unknown",
    "Cleared": "safe",
    "Init": "init",
    "ReleasedCleared": "safe",
    "ReleasedStale": "danger",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "AllocRet",
      "curr_state": "Untracked",
      "next_state": "Allocated"
    },
    {
      "action": "StoreNull",
      "curr_state": "Allocated",
      "next_state": "Cleared"
    },
    {
      "action": "CallRelease",
      "curr_state": "Allocated",
      "next_state": "ReleasedStale"
    },
    {
      "action": "AllocRet",
      "curr_state": "Cleared",
      "next_state": "Allocated"
    },
    {
      "action": "CallRelease",
      "curr_state": "Cleared",
      "next_state": "ReleasedCleared"
    },
    {
      "action": "StoreNull",
      "curr_state": "ReleasedStale",
      "next_state": "ReleasedCleared"
    },
    {
      "action": "Use",
      "curr_state": "ReleasedStale",
      "next_state": "UAF"
    },
    {
      "action": "StoreNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallRelease",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "AllocRet",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "Use",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "StoreNull",
      "curr_state": "Cleared",
      "next_state": "Cleared"
    },
    {
      "action": "Use",
      "curr_state": "Cleared",
      "next_state": "Cleared"
    },
    {
      "action": "AllocRet",
      "curr_state": "ReleasedStale",
      "next_state": "ReleasedStale"
    },
    {
      "action": "CallRelease",
      "curr_state": "ReleasedStale",
      "next_state": "ReleasedStale"
    },
    {
      "action": "AllocRet",
      "curr_state": "ReleasedCleared",
      "next_state": "ReleasedCleared"
    },
    {
      "action": "StoreNull",
      "curr_state": "ReleasedCleared",
      "next_state": "ReleasedCleared"
    },
    {
      "action": "CallRelease",
      "curr_state": "ReleasedCleared",
      "next_state": "ReleasedCleared"
    },
    {
      "action": "Use",
      "curr_state": "ReleasedCleared",
      "next_state": "ReleasedCleared"
    },
    {
      "action": "AllocRet",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "StoreNull",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallRelease",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    }
  ]
}