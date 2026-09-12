{
  "action": {
    "Call": [
      {
        "CallPut": [
          {
            "arg_idx": 0,
            "func_name": "cgroup_put"
          }
        ]
      }
    ],
    "StoreNull": []
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
      "CallPut"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoublePut",
    "key": "scx_sub_enable_cgroup_double_put",
    "key_actions": [
      "CallPut",
      "CallPut"
    ],
    "name": "cgroup double-put on sub-sched abort path"
  },
  "context": {
    "end_action": [
      "CallPut"
    ],
    "start_action": [
      "CallPut"
    ]
  },
  "event_metadata": {
    "CallPut": {
      "role": "source"
    },
    "StoreNull": {
      "role": "guard"
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
    "CallPut",
    "StoreNull"
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
      "action": "CallPut",
      "curr_state": "Untracked",
      "next_state": "Put"
    },
    {
      "action": "CallPut",
      "curr_state": "Put",
      "next_state": "DoublePut"
    },
    {
      "action": "StoreNull",
      "curr_state": "Put",
      "next_state": "Untracked"
    },
    {
      "action": "StoreNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallPut",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    },
    {
      "action": "StoreNull",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    }
  ]
}