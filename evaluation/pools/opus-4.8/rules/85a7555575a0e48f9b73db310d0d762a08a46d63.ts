{
  "action": {
    "Call": [
      {
        "ListAdd": [
          {
            "arg_idx": 0,
            "func_name": "list_add"
          }
        ]
      },
      {
        "ListDel": [
          {
            "arg_idx": 0,
            "func_name": "list_del"
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
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "ListAdd"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "wm_adsp_create_control_listed_free",
    "key_actions": [
      "ListAdd",
      "CallFree",
      "Use"
    ],
    "name": "listed node container freed before unlink"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "ListAdd"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "sink"
    },
    "ListAdd": {
      "role": "publish"
    },
    "ListDel": {
      "role": "unpublish"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Listed",
      "merge_state": "Listed"
    },
    {
      "curr_state1": "Listed",
      "curr_state2": "Unlinked",
      "merge_state": "Listed"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "FreedWhileListed",
      "merge_state": "FreedWhileListed"
    }
  ],
  "sliced_action": [
    "ListAdd",
    "ListDel",
    "CallFree",
    "Use"
  ],
  "state": [
    "Untracked",
    "Listed",
    "Unlinked",
    "FreedWhileListed",
    "UAF"
  ],
  "state_roles": {
    "FreedWhileListed": "danger",
    "Init": "init",
    "Listed": "danger",
    "UAF": "bug",
    "Unlinked": "safe"
  },
  "transition": [
    {
      "action": "ListAdd",
      "curr_state": "Untracked",
      "next_state": "Listed"
    },
    {
      "action": "ListDel",
      "curr_state": "Listed",
      "next_state": "Unlinked"
    },
    {
      "action": "CallFree",
      "curr_state": "Listed",
      "next_state": "FreedWhileListed"
    },
    {
      "action": "ListAdd",
      "curr_state": "Unlinked",
      "next_state": "Listed"
    },
    {
      "action": "CallFree",
      "curr_state": "Unlinked",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "FreedWhileListed",
      "next_state": "UAF"
    },
    {
      "action": "ListDel",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "ListAdd",
      "curr_state": "Listed",
      "next_state": "Listed"
    },
    {
      "action": "Use",
      "curr_state": "Listed",
      "next_state": "Listed"
    },
    {
      "action": "ListDel",
      "curr_state": "Unlinked",
      "next_state": "Unlinked"
    },
    {
      "action": "Use",
      "curr_state": "Unlinked",
      "next_state": "Unlinked"
    },
    {
      "action": "ListAdd",
      "curr_state": "FreedWhileListed",
      "next_state": "FreedWhileListed"
    },
    {
      "action": "ListDel",
      "curr_state": "FreedWhileListed",
      "next_state": "FreedWhileListed"
    },
    {
      "action": "CallFree",
      "curr_state": "FreedWhileListed",
      "next_state": "FreedWhileListed"
    },
    {
      "action": "ListAdd",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "ListDel",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallFree",
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