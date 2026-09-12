{
  "action": {
    "Call": [
      {
        "CallFree": [
          {
            "arg_idx": 2,
            "func_name": "cfg80211_update_known_bss"
          }
        ]
      },
      {
        "CallUnlinkFree": [
          {
            "arg_idx": 1,
            "func_name": "__cfg80211_unlink_bss"
          }
        ]
      }
    ],
    "StoreNull": []
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
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "CallFree"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "cfg80211_update_assoc_bss_double_free",
    "key_actions": [
      "CallFree",
      "CallUnlinkFree"
    ],
    "name": "double-free of IE pointers when known-bss update fails"
  },
  "context": {
    "end_action": [
      "CallUnlinkFree"
    ],
    "start_action": [
      "CallFree"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "release"
    },
    "CallUnlinkFree": {
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
    "CallUnlinkFree",
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
      "action": "CallUnlinkFree",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallUnlinkFree",
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
      "action": "CallUnlinkFree",
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