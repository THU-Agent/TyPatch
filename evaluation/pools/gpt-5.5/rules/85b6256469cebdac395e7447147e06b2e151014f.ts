{
  "action": {
    "Call": [
      {
        "OutParamInit": [
          {
            "arg_idx": 1,
            "func_name": "fb_get_options"
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
    "path_sensitive_candidate_generation": true,
    "path_sensitive_verify": true,
    "source_actions": [
      "OutParamInit"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "fbdev_modedb_fb_find_mode_mode_option_buf_uaf",
    "key_actions": [
      "OutParamInit",
      "CallFree",
      "Use"
    ],
    "name": "use-after-free"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "OutParamInit"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "release"
    },
    "OutParamInit": {
      "role": "source"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Live",
      "merge_state": "Live"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "OutParamInit",
    "CallFree",
    "Use"
  ],
  "state": [
    "Untracked",
    "Live",
    "Freed",
    "UAF"
  ],
  "state_roles": {
    "Freed": "danger",
    "Init": "init",
    "Live": "safe",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "OutParamInit",
      "curr_state": "Untracked",
      "next_state": "Live"
    },
    {
      "action": "CallFree",
      "curr_state": "Live",
      "next_state": "Freed"
    },
    {
      "action": "OutParamInit",
      "curr_state": "Freed",
      "next_state": "Live"
    },
    {
      "action": "Use",
      "curr_state": "Freed",
      "next_state": "UAF"
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
      "action": "OutParamInit",
      "curr_state": "Live",
      "next_state": "Live"
    },
    {
      "action": "Use",
      "curr_state": "Live",
      "next_state": "Live"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "OutParamInit",
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