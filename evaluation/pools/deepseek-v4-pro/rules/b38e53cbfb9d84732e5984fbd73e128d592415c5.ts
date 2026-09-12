{
  "action": {
    "Call": [
      {
        "CallCopyToUser": [
          {
            "arg_idx": 1,
            "func_name": "copy_to_user"
          }
        ]
      }
    ],
    "Ret": [
      {
        "AllocUninit": [
          "kmalloc"
        ]
      },
      {
        "AllocInit": [
          "kzalloc"
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
    "source_actions": [
      "AllocUninit"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "usblp-statusbuf-kmalloc-leak",
    "key_actions": [
      "AllocUninit",
      "CallCopyToUser"
    ],
    "name": "usblp-uninitialized-heap-leak"
  },
  "context": {
    "end_action": [
      "CallCopyToUser"
    ],
    "start_action": [
      "AllocUninit"
    ]
  },
  "event_metadata": {
    "AllocInit": {
      "role": "guard"
    },
    "AllocUninit": {
      "role": "source"
    },
    "CallCopyToUser": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Uninit",
      "merge_state": "Uninit"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Safe",
      "merge_state": "Safe"
    },
    {
      "curr_state1": "Uninit",
      "curr_state2": "Safe",
      "merge_state": "Uninit"
    },
    {
      "curr_state1": "Uninit",
      "curr_state2": "Leak",
      "merge_state": "Leak"
    },
    {
      "curr_state1": "Safe",
      "curr_state2": "Leak",
      "merge_state": "Leak"
    }
  ],
  "sliced_action": [
    "AllocUninit",
    "AllocInit",
    "CallCopyToUser"
  ],
  "state": [
    "Uninit",
    "Safe",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Safe": "safe",
    "Uninit": "danger"
  },
  "transition": [
    {
      "action": "CallCopyToUser",
      "curr_state": "Uninit",
      "next_state": "Leak"
    },
    {
      "action": "AllocUninit",
      "curr_state": "Uninit",
      "next_state": "Uninit"
    },
    {
      "action": "AllocInit",
      "curr_state": "Uninit",
      "next_state": "Uninit"
    },
    {
      "action": "AllocUninit",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "AllocInit",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "CallCopyToUser",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "AllocUninit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocInit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallCopyToUser",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocUninit",
      "curr_state": "Any",
      "next_state": "Uninit"
    },
    {
      "action": "AllocInit",
      "curr_state": "Any",
      "next_state": "Safe"
    },
    {
      "action": "CallCopyToUser",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}