{
  "action": {
    "Call": [
      {
        "CallFreeUpdateKnownBss": [
          {
            "arg_idx": 2,
            "field_path": "pub.proberesp_ies",
            "func_name": "cfg80211_update_known_bss"
          }
        ]
      },
      {
        "CallFreeKfree": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
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
      "CallFreeUpdateKnownBss"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "wifi_cfg80211_double_free_ies",
    "key_actions": [
      "CallFreeUpdateKnownBss",
      "CallFreeKfree"
    ],
    "name": "double-free of IE pointer in cfg80211_update_assoc_bss_entry"
  },
  "context": {
    "end_action": [
      "CallFreeKfree"
    ],
    "start_action": [
      "CallFreeUpdateKnownBss"
    ]
  },
  "event_metadata": {
    "CallFreeKfree": {
      "role": "release"
    },
    "CallFreeUpdateKnownBss": {
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
    "CallFreeUpdateKnownBss",
    "StoreNull",
    "CallFreeKfree"
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
      "action": "CallFreeUpdateKnownBss",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "CallFreeKfree",
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
      "action": "CallFreeKfree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFreeUpdateKnownBss",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallFreeUpdateKnownBss",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFreeKfree",
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