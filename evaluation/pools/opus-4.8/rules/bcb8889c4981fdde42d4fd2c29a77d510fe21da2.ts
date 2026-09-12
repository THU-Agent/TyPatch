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
    "initial_state": "Init",
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
    "key": "qcom_cpufreq_hw_devm_double_free",
    "key_actions": [
      "ManagedAlloc",
      "CallFree"
    ],
    "name": "managed-lifetime double free"
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
      "curr_state1": "Any",
      "curr_state2": "Managed",
      "merge_state": "Managed"
    }
  ],
  "sliced_action": [
    "ManagedAlloc",
    "CallFree"
  ],
  "state": [
    "Managed",
    "DoubleFree"
  ],
  "state_roles": {
    "DoubleFree": "bug",
    "Init": "init",
    "Managed": "danger"
  },
  "transition": [
    {
      "action": "CallFree",
      "curr_state": "Managed",
      "next_state": "DoubleFree"
    },
    {
      "action": "ManagedAlloc",
      "curr_state": "Managed",
      "next_state": "Managed"
    },
    {
      "action": "CallFree",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "ManagedAlloc",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "ManagedAlloc",
      "curr_state": "Any",
      "next_state": "Managed"
    },
    {
      "action": "CallFree",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}