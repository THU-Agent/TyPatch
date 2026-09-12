{
  "action": {
    "Call": [
      {
        "CallInit": [
          {
            "arg_idx": 0,
            "func_name": "jbd2_journal_init_jbd_inode"
          }
        ]
      }
    ],
    "FieldStoreValue": []
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
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "FieldStoreValue"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "BadPublish",
    "key": "ext4_jinode_publish_before_init",
    "key_actions": [
      "FieldStoreValue",
      "CallInit"
    ],
    "name": "publish-before-initialization race"
  },
  "context": {
    "end_action": [
      "CallInit"
    ],
    "start_action": [
      "FieldStoreValue"
    ]
  },
  "event_metadata": {
    "CallInit": {
      "role": "init"
    },
    "FieldStoreValue": {
      "role": "publish"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Published",
      "merge_state": "Published"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Initialized",
      "merge_state": "Initialized"
    }
  ],
  "sliced_action": [
    "FieldStoreValue",
    "CallInit"
  ],
  "state": [
    "Untracked",
    "Published",
    "Initialized",
    "BadPublish"
  ],
  "state_roles": {
    "BadPublish": "bug",
    "Init": "init",
    "Initialized": "safe",
    "Published": "danger"
  },
  "transition": [
    {
      "action": "CallInit",
      "curr_state": "Untracked",
      "next_state": "Initialized"
    },
    {
      "action": "FieldStoreValue",
      "curr_state": "Untracked",
      "next_state": "Published"
    },
    {
      "action": "CallInit",
      "curr_state": "Published",
      "next_state": "BadPublish"
    },
    {
      "action": "FieldStoreValue",
      "curr_state": "Published",
      "next_state": "Published"
    },
    {
      "action": "CallInit",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "FieldStoreValue",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "CallInit",
      "curr_state": "BadPublish",
      "next_state": "BadPublish"
    },
    {
      "action": "FieldStoreValue",
      "curr_state": "BadPublish",
      "next_state": "BadPublish"
    }
  ]
}