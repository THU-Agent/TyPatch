{
  "action": {
    "Call": [
      {
        "CallFinalize": [
          {
            "arg_idx": 0,
            "func_name": "jbd2_journal_init_jbd_inode"
          }
        ]
      },
      {
        "CallUse": [
          {
            "arg_idx": 1,
            "func_name": "jbd2_submit_inode_data"
          },
          {
            "arg_idx": 1,
            "func_name": "jbd2_wait_inode_data"
          },
          {
            "arg_idx": 1,
            "func_name": "jbd2_journal_begin_ordered_truncate"
          }
        ]
      }
    ],
    "FieldStore": []
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
      "FieldStore"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Bug",
    "key": "ext4-jinode-publish-before-init",
    "key_actions": [
      "FieldStore",
      "CallUse"
    ],
    "name": "publish-before-initialization"
  },
  "context": {
    "end_action": [
      "CallFinalize",
      "CallUse"
    ],
    "start_action": [
      "FieldStore"
    ]
  },
  "event_metadata": {
    "CallFinalize": {
      "role": "init"
    },
    "CallUse": {
      "role": "sink"
    },
    "FieldStore": {
      "role": "publish"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Initialized",
      "merge_state": "Initialized"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "PublishedUninit",
      "merge_state": "PublishedUninit"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "PublishedInit",
      "merge_state": "PublishedInit"
    },
    {
      "curr_state1": "Initialized",
      "curr_state2": "PublishedUninit",
      "merge_state": "PublishedUninit"
    }
  ],
  "sliced_action": [
    "CallFinalize",
    "FieldStore",
    "CallUse"
  ],
  "state": [
    "Untracked",
    "Initialized",
    "PublishedUninit",
    "PublishedInit",
    "Bug"
  ],
  "state_roles": {
    "Bug": "bug",
    "Init": "init",
    "Initialized": "safe",
    "PublishedInit": "safe",
    "PublishedUninit": "danger"
  },
  "transition": [
    {
      "action": "CallFinalize",
      "curr_state": "Untracked",
      "next_state": "Initialized"
    },
    {
      "action": "FieldStore",
      "curr_state": "Untracked",
      "next_state": "PublishedUninit"
    },
    {
      "action": "FieldStore",
      "curr_state": "Initialized",
      "next_state": "PublishedInit"
    },
    {
      "action": "CallFinalize",
      "curr_state": "PublishedUninit",
      "next_state": "PublishedInit"
    },
    {
      "action": "CallUse",
      "curr_state": "PublishedUninit",
      "next_state": "Bug"
    },
    {
      "action": "CallUse",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFinalize",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "CallUse",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "FieldStore",
      "curr_state": "PublishedUninit",
      "next_state": "PublishedUninit"
    },
    {
      "action": "CallFinalize",
      "curr_state": "PublishedInit",
      "next_state": "PublishedInit"
    },
    {
      "action": "FieldStore",
      "curr_state": "PublishedInit",
      "next_state": "PublishedInit"
    },
    {
      "action": "CallUse",
      "curr_state": "PublishedInit",
      "next_state": "PublishedInit"
    },
    {
      "action": "CallFinalize",
      "curr_state": "Bug",
      "next_state": "Bug"
    },
    {
      "action": "FieldStore",
      "curr_state": "Bug",
      "next_state": "Bug"
    },
    {
      "action": "CallUse",
      "curr_state": "Bug",
      "next_state": "Bug"
    }
  ]
}