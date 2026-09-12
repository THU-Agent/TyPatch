{
  "action": {
    "BrNonNull": [],
    "Call": [
      {
        "CallUnlink": [
          {
            "arg_idx": 0,
            "func_name": "hash_del"
          }
        ]
      },
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
          }
        ]
      }
    ],
    "Exit": [],
    "Ret": [
      {
        "OptionalResourceRet": [
          "ofdpa_fdb_tbl_find"
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Init",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_same_function": true,
    "source_actions": [
      "OptionalResourceRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "rocker-ofdpa-fdb-hash-del-leak",
    "key_actions": [
      "OptionalResourceRet",
      "CallUnlink",
      "Exit"
    ],
    "name": "resource leak"
  },
  "context": {
    "end_action": [
      "CallFree",
      "Exit"
    ],
    "start_action": [
      "OptionalResourceRet"
    ]
  },
  "event_metadata": {
    "BrNonNull": {
      "role": "guard"
    },
    "CallFree": {
      "role": "release"
    },
    "CallUnlink": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "OptionalResourceRet": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Found",
      "merge_state": "Found"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Unlinked",
      "merge_state": "Unlinked"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    },
    {
      "curr_state1": "Found",
      "curr_state2": "Unlinked",
      "merge_state": "Unlinked"
    }
  ],
  "sliced_action": [
    "OptionalResourceRet",
    "BrNonNull",
    "CallUnlink",
    "CallFree",
    "Exit"
  ],
  "state": [
    "Found",
    "Unlinked",
    "Freed",
    "Leak"
  ],
  "state_roles": {
    "Found": "unknown",
    "Freed": "safe",
    "Init": "init",
    "Leak": "bug",
    "Unlinked": "danger"
  },
  "transition": [
    {
      "action": "CallUnlink",
      "curr_state": "Found",
      "next_state": "Unlinked"
    },
    {
      "action": "CallFree",
      "curr_state": "Found",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Unlinked",
      "next_state": "Freed"
    },
    {
      "action": "Exit",
      "curr_state": "Unlinked",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Freed",
      "next_state": "Found"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Found",
      "next_state": "Found"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Found",
      "next_state": "Found"
    },
    {
      "action": "Exit",
      "curr_state": "Found",
      "next_state": "Found"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Unlinked",
      "next_state": "Unlinked"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Unlinked",
      "next_state": "Unlinked"
    },
    {
      "action": "CallUnlink",
      "curr_state": "Unlinked",
      "next_state": "Unlinked"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallUnlink",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "Exit",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallUnlink",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallFree",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Any",
      "next_state": "Found"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallUnlink",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallFree",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "Exit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}