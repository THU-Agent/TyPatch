{
  "action": {
    "Call": [
      {
        "CallFree": [
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
    "initial_state": "Init",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "CallFree"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "bnxt_ptp_enable_uaf",
    "key_actions": [
      "CallFree",
      "Use"
    ],
    "name": "use-after-free of hwrm_dma_pool"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallFree"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "source"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "CallFree",
    "Use"
  ],
  "state": [
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
      "action": "Use",
      "curr_state": "Freed",
      "next_state": "UAF"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "CallFree",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallFree",
      "curr_state": "Any",
      "next_state": "Freed"
    },
    {
      "action": "Use",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}