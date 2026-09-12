{
  "action": {
    "Call": [
      {
        "AllocChanlist": [
          {
            "arg_idx": 0,
            "func_name": "meson_allocate_chanlist"
          }
        ]
      },
      {
        "FreeChanlist": [
          {
            "arg_idx": 0,
            "func_name": "meson_free_chanlist"
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
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "AllocChanlist"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "amlogic_gxl_meson_probe_double_chanlist_free",
    "key_actions": [
      "FreeChanlist",
      "FreeChanlist"
    ],
    "name": "double cleanup of chanlist on probe error path"
  },
  "context": {
    "end_action": [
      "FreeChanlist"
    ],
    "start_action": [
      "AllocChanlist"
    ]
  },
  "event_metadata": {
    "AllocChanlist": {
      "role": "source"
    },
    "FreeChanlist": {
      "role": "release"
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
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "AllocChanlist",
    "FreeChanlist"
  ],
  "state": [
    "Untracked",
    "Allocated",
    "Freed",
    "DoubleFree"
  ],
  "state_roles": {
    "Allocated": "danger",
    "DoubleFree": "bug",
    "Freed": "danger",
    "Init": "init"
  },
  "transition": [
    {
      "action": "AllocChanlist",
      "curr_state": "Untracked",
      "next_state": "Allocated"
    },
    {
      "action": "FreeChanlist",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "FreeChanlist",
      "curr_state": "Allocated",
      "next_state": "Freed"
    },
    {
      "action": "AllocChanlist",
      "curr_state": "Freed",
      "next_state": "Allocated"
    },
    {
      "action": "FreeChanlist",
      "curr_state": "Freed",
      "next_state": "DoubleFree"
    },
    {
      "action": "AllocChanlist",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "AllocChanlist",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "FreeChanlist",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    }
  ]
}