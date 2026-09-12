{
  "action": {
    "Call": [
      {
        "OwnerRelease": [
          {
            "arg_idx": 0,
            "func_name": "of_node_put"
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
    "path_sensitive_candidate_generation": true,
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "OwnerRelease"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleRelease",
    "key": "emc2305_double_put_of_node",
    "key_actions": [
      "OwnerRelease",
      "OwnerRelease"
    ],
    "name": "double-put of_node reference"
  },
  "context": {
    "end_action": [
      "OwnerRelease"
    ],
    "start_action": [
      "OwnerRelease"
    ]
  },
  "event_metadata": {
    "OwnerRelease": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "OwnerRelease"
  ],
  "state": [
    "Untracked",
    "Released",
    "DoubleRelease"
  ],
  "state_roles": {
    "DoubleRelease": "bug",
    "Init": "init",
    "Released": "danger"
  },
  "transition": [
    {
      "action": "OwnerRelease",
      "curr_state": "Untracked",
      "next_state": "Released"
    },
    {
      "action": "OwnerRelease",
      "curr_state": "Released",
      "next_state": "DoubleRelease"
    },
    {
      "action": "OwnerRelease",
      "curr_state": "DoubleRelease",
      "next_state": "DoubleRelease"
    }
  ]
}