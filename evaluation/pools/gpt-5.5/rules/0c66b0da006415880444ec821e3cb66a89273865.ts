{
  "action": {
    "Call": [
      {
        "TransferToSched": [
          {
            "arg_idx": 1,
            "func_name": "scx_alloc_and_add_sched"
          }
        ]
      },
      {
        "CgroupPut": [
          {
            "arg_idx": 0,
            "func_name": "cgroup_put"
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
    "source_actions": [
      "TransferToSched"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoublePut",
    "key": "sched_ext-cgroup-double-put-sub-sched-abort",
    "key_actions": [
      "TransferToSched",
      "CgroupPut"
    ],
    "name": "double-put after ownership transfer"
  },
  "context": {
    "end_action": [
      "CgroupPut"
    ],
    "start_action": [
      "TransferToSched"
    ]
  },
  "event_metadata": {
    "CgroupPut": {
      "role": "sink"
    },
    "TransferToSched": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Transferred",
      "merge_state": "Transferred"
    }
  ],
  "sliced_action": [
    "TransferToSched",
    "CgroupPut"
  ],
  "state": [
    "Untracked",
    "Transferred",
    "DoublePut"
  ],
  "state_roles": {
    "DoublePut": "bug",
    "Init": "init",
    "Transferred": "danger"
  },
  "transition": [
    {
      "action": "TransferToSched",
      "curr_state": "Untracked",
      "next_state": "Transferred"
    },
    {
      "action": "CgroupPut",
      "curr_state": "Transferred",
      "next_state": "DoublePut"
    },
    {
      "action": "CgroupPut",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "TransferToSched",
      "curr_state": "Transferred",
      "next_state": "Transferred"
    },
    {
      "action": "TransferToSched",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    },
    {
      "action": "CgroupPut",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    }
  ]
}