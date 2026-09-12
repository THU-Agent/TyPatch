{
  "action": {
    "Call": [
      {
        "ListAdd": [
          {
            "arg_idx": 0,
            "func_name": "list_add"
          },
          {
            "arg_idx": 0,
            "func_name": "list_add_tail"
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
    ]
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
    "path_sensitive_candidate_generation": false,
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
    "bug_state": "FreedWhileListed",
    "key": "wm_adsp_ctl_listed_node_free",
    "key_actions": [
      "ListAdd",
      "CallFree"
    ],
    "name": "listed control freed before unlink"
  },
  "context": {
    "end_action": [
      "CallFree"
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
    }
  ],
  "sliced_action": [
    "ListAdd",
    "ListDel",
    "CallFree"
  ],
  "state": [
    "Untracked",
    "Listed",
    "Unlinked",
    "FreedWhileListed"
  ],
  "state_roles": {
    "FreedWhileListed": "bug",
    "Init": "init",
    "Listed": "danger",
    "Unlinked": "safe"
  },
  "transition": [
    {
      "action": "ListAdd",
      "curr_state": "Untracked",
      "next_state": "Listed"
    },
    {
      "action": "CallFree",
      "curr_state": "Listed",
      "next_state": "FreedWhileListed"
    },
    {
      "action": "ListDel",
      "curr_state": "Listed",
      "next_state": "Unlinked"
    },
    {
      "action": "CallFree",
      "curr_state": "Unlinked",
      "next_state": "Untracked"
    },
    {
      "action": "ListAdd",
      "curr_state": "Unlinked",
      "next_state": "Listed"
    },
    {
      "action": "CallFree",
      "curr_state": "FreedWhileListed",
      "next_state": "FreedWhileListed"
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
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "ListDel",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "ListAdd",
      "curr_state": "Listed",
      "next_state": "Listed"
    },
    {
      "action": "ListDel",
      "curr_state": "Unlinked",
      "next_state": "Unlinked"
    }
  ]
}
