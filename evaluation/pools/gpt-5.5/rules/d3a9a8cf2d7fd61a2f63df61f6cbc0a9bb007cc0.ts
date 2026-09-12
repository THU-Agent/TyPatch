{
  "action": {
    "Call": [
      {
        "OwnerTransfer": [
          {
            "arg_idx": 2,
            "func_name": "ipu7_bus_initialize_device"
          }
        ]
      },
      {
        "OwnerTeardown": [
          {
            "arg_idx": 0,
            "field_path": "pdata",
            "func_name": "put_device"
          },
          {
            "arg_idx": 0,
            "field_path": "pdata",
            "func_name": "ipu7_bus_add_device"
          }
        ]
      },
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
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
      "OwnerTransfer"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleFree",
    "key": "ipu7_pdata_indirect_release_double_free",
    "key_actions": [
      "OwnerTransfer",
      "OwnerTeardown",
      "CallFree"
    ],
    "name": "double-free after device teardown releases pdata"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "OwnerTransfer"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "sink"
    },
    "OwnerTeardown": {
      "role": "release"
    },
    "OwnerTransfer": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "OwnedByDevice",
      "merge_state": "OwnedByDevice"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "ReleasedByTeardown",
      "merge_state": "ReleasedByTeardown"
    },
    {
      "curr_state1": "OwnedByDevice",
      "curr_state2": "ReleasedByTeardown",
      "merge_state": "ReleasedByTeardown"
    }
  ],
  "sliced_action": [
    "OwnerTransfer",
    "OwnerTeardown",
    "CallFree"
  ],
  "state": [
    "Untracked",
    "OwnedByDevice",
    "ReleasedByTeardown",
    "DoubleFree"
  ],
  "state_roles": {
    "DoubleFree": "bug",
    "Init": "init",
    "OwnedByDevice": "safe",
    "ReleasedByTeardown": "danger"
  },
  "transition": [
    {
      "action": "OwnerTransfer",
      "curr_state": "Untracked",
      "next_state": "OwnedByDevice"
    },
    {
      "action": "OwnerTeardown",
      "curr_state": "OwnedByDevice",
      "next_state": "ReleasedByTeardown"
    },
    {
      "action": "CallFree",
      "curr_state": "ReleasedByTeardown",
      "next_state": "DoubleFree"
    },
    {
      "action": "OwnerTeardown",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "OwnerTransfer",
      "curr_state": "OwnedByDevice",
      "next_state": "OwnedByDevice"
    },
    {
      "action": "CallFree",
      "curr_state": "OwnedByDevice",
      "next_state": "OwnedByDevice"
    },
    {
      "action": "OwnerTransfer",
      "curr_state": "ReleasedByTeardown",
      "next_state": "ReleasedByTeardown"
    },
    {
      "action": "OwnerTeardown",
      "curr_state": "ReleasedByTeardown",
      "next_state": "ReleasedByTeardown"
    },
    {
      "action": "OwnerTransfer",
      "curr_state": "DoubleFree",
      "next_state": "DoubleFree"
    },
    {
      "action": "OwnerTeardown",
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