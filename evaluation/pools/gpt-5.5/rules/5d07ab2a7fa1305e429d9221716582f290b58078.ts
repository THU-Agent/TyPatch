{
  "action": {
    "Call": [
      {
        "CallManagedCleanupAction": [
          {
            "arg_idx": 2,
            "func_name": "devm_add_action_or_reset"
          }
        ]
      },
      {
        "CallManualCleanup": [
          {
            "arg_idx": 0,
            "func_name": "fsl_qspi_clk_disable_unprep"
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
      "CallManagedCleanupAction"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleCleanup",
    "key": "spi-fsl-qspi-devm-action-manual-cleanup-double-cleanup",
    "key_actions": [
      "CallManagedCleanupAction",
      "CallManualCleanup"
    ],
    "name": "double-cleanup"
  },
  "context": {
    "end_action": [
      "CallManualCleanup"
    ],
    "start_action": [
      "CallManagedCleanupAction"
    ]
  },
  "event_metadata": {
    "CallManagedCleanupAction": {
      "role": "source"
    },
    "CallManualCleanup": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "ManagedCleanupArmed",
      "merge_state": "ManagedCleanupArmed"
    }
  ],
  "sliced_action": [
    "CallManagedCleanupAction",
    "CallManualCleanup"
  ],
  "state": [
    "Untracked",
    "ManagedCleanupArmed",
    "DoubleCleanup"
  ],
  "state_roles": {
    "DoubleCleanup": "bug",
    "Init": "init",
    "ManagedCleanupArmed": "danger"
  },
  "transition": [
    {
      "action": "CallManagedCleanupAction",
      "curr_state": "Untracked",
      "next_state": "ManagedCleanupArmed"
    },
    {
      "action": "CallManualCleanup",
      "curr_state": "ManagedCleanupArmed",
      "next_state": "DoubleCleanup"
    },
    {
      "action": "CallManualCleanup",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallManagedCleanupAction",
      "curr_state": "ManagedCleanupArmed",
      "next_state": "ManagedCleanupArmed"
    },
    {
      "action": "CallManagedCleanupAction",
      "curr_state": "DoubleCleanup",
      "next_state": "DoubleCleanup"
    },
    {
      "action": "CallManualCleanup",
      "curr_state": "DoubleCleanup",
      "next_state": "DoubleCleanup"
    }
  ]
}