{
  "action": {
    "Call": [
      {
        "ExplicitPut": [
          {
            "arg_idx": 0,
            "func_name": "of_node_put"
          }
        ]
      },
      {
        "IteratorPut": [
          {
            "arg_idx": 1,
            "func_name": "for_each_child_of_node"
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
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "ExplicitPut"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoublePut",
    "key": "hwmon-emc2305-double-of-node-put",
    "key_actions": [
      "ExplicitPut",
      "IteratorPut"
    ],
    "name": "double-put"
  },
  "context": {
    "end_action": [
      "IteratorPut"
    ],
    "start_action": [
      "ExplicitPut"
    ]
  },
  "event_metadata": {
    "ExplicitPut": {
      "role": "source"
    },
    "IteratorPut": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Put",
      "merge_state": "Put"
    }
  ],
  "sliced_action": [
    "ExplicitPut",
    "IteratorPut"
  ],
  "state": [
    "Untracked",
    "Put",
    "DoublePut"
  ],
  "state_roles": {
    "DoublePut": "bug",
    "Init": "init",
    "Put": "danger"
  },
  "transition": [
    {
      "action": "ExplicitPut",
      "curr_state": "Untracked",
      "next_state": "Put"
    },
    {
      "action": "IteratorPut",
      "curr_state": "Untracked",
      "next_state": "Put"
    },
    {
      "action": "ExplicitPut",
      "curr_state": "Put",
      "next_state": "DoublePut"
    },
    {
      "action": "IteratorPut",
      "curr_state": "Put",
      "next_state": "DoublePut"
    },
    {
      "action": "ExplicitPut",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    },
    {
      "action": "IteratorPut",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    }
  ]
}