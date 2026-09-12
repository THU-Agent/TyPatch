{
  "action": {
    "Call": [
      {
        "CallDestroy": [
          {
            "arg_idx": 0,
            "func_name": "fb_destroy_modelist"
          }
        ]
      },
      {
        "ClearStaleMode": [
          {
            "arg_idx": 0,
            "func_name": "fbcon_delete_modelist"
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
    "source_actions": [
      "CallDestroy"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "fbdev_store_modes_uaf_stale_mode",
    "key_actions": [
      "CallDestroy",
      "Use"
    ],
    "name": "use-after-free of stale mode pointer after modelist destroy"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallDestroy"
    ]
  },
  "event_metadata": {
    "CallDestroy": {
      "role": "release"
    },
    "ClearStaleMode": {
      "role": "guard"
    },
    "Use": {
      "role": "sink"
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
    "CallDestroy",
    "ClearStaleMode",
    "Use"
  ],
  "state": [
    "Untracked",
    "Freed",
    "UAF"
  ],
  "state_roles": {
    "Freed": "danger",
    "Init": "init",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "CallDestroy",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "ClearStaleMode",
      "curr_state": "Freed",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "Freed",
      "next_state": "UAF"
    },
    {
      "action": "ClearStaleMode",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallDestroy",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallDestroy",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "ClearStaleMode",
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