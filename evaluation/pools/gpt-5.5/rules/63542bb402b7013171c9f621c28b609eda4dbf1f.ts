{
  "action": {
    "Call": [
      {
        "OwnerTransfer": [
          {
            "arg_idx": 1,
            "func_name": "devm_spi_register_controller"
          }
        ]
      },
      {
        "CallPut": [
          {
            "arg_idx": 0,
            "func_name": "spi_controller_put"
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
      "OwnerTransfer"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoublePut",
    "key": "spi-meson-spicc-devm-controller-double-put",
    "key_actions": [
      "OwnerTransfer",
      "CallPut"
    ],
    "name": "double-put after devm-managed registration"
  },
  "context": {
    "end_action": [
      "CallPut"
    ],
    "start_action": [
      "OwnerTransfer"
    ]
  },
  "event_metadata": {
    "CallPut": {
      "role": "sink"
    },
    "OwnerTransfer": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "DevmManaged",
      "merge_state": "DevmManaged"
    }
  ],
  "sliced_action": [
    "OwnerTransfer",
    "CallPut"
  ],
  "state": [
    "Untracked",
    "DevmManaged",
    "DoublePut"
  ],
  "state_roles": {
    "DevmManaged": "danger",
    "DoublePut": "bug",
    "Init": "init"
  },
  "transition": [
    {
      "action": "OwnerTransfer",
      "curr_state": "Untracked",
      "next_state": "DevmManaged"
    },
    {
      "action": "CallPut",
      "curr_state": "DevmManaged",
      "next_state": "DoublePut"
    },
    {
      "action": "CallPut",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "OwnerTransfer",
      "curr_state": "DevmManaged",
      "next_state": "DevmManaged"
    },
    {
      "action": "OwnerTransfer",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    },
    {
      "action": "CallPut",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    }
  ]
}