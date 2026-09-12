{
  "action": {
    "Call": [
      {
        "OwnerTeardown": [
          {
            "arg_idx": 0,
            "field_path": "hwrm_dma_pool",
            "func_name": "bnxt_free_hwrm_resources"
          }
        ]
      }
    ],
    "Use": []
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
      "OwnerTeardown"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "bnxt_ptp_clear_after_free_hwrm_resources_uaf",
    "key_actions": [
      "OwnerTeardown",
      "Use"
    ],
    "name": "use-after-free via wrong teardown order"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "OwnerTeardown"
    ]
  },
  "event_metadata": {
    "OwnerTeardown": {
      "role": "source"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "OwnerTeardown",
    "Use"
  ],
  "state": [
    "Untracked",
    "Freed",
    "UAF"
  ],
  "state_roles": {
    "Freed": "danger",
    "Init": "init",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "OwnerTeardown",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "Use",
      "curr_state": "Freed",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "OwnerTeardown",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "OwnerTeardown",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    }
  ]
}