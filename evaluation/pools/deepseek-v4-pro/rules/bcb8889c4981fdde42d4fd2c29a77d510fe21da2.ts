{
  "action": {
    "Call": [
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
          }
        ]
      }
    ],
    "ManagedAlloc": []
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
      "ManagedAlloc"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "qcom_cpufreq_double_free",
    "key_actions": [
      "ManagedAlloc",
      "CallFree"
    ],
    "name": "double-free of devm-managed allocation"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "ManagedAlloc"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "release"
    },
    "ManagedAlloc": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Allocated",
      "merge_state": "Allocated"
    }
  ],
  "sliced_action": [
    "ManagedAlloc",
    "CallFree"
  ],
  "state": [
    "Untracked",
    "Allocated",
    "DoubleFree"
  ],
  "state_roles": {
    "Allocated": "danger",
    "DoubleFree": "bug",
    "Init": "init"
  },
  "transition": [
    {
      "action": "ManagedAlloc",
      "curr_state": "Untracked",
      "next_state": "Allocated"
    },
    {
      "action": "CallFree",
      "curr_state": "Allocated",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "ManagedAlloc",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "ManagedAlloc",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "CallFree",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    }
  ]
}