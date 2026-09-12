{
  "action": {
    "Call": [
      {
        "OwnerTeardownHwrm": [
          {
            "arg_idx": 0,
            "func_name": "bnxt_free_hwrm_resources"
          }
        ]
      },
      {
        "CallPtpClear": [
          {
            "arg_idx": 0,
            "func_name": "bnxt_ptp_clear"
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
      "OwnerTeardownHwrm"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "InvalidPtpClear",
    "key": "bnxt_ptp_clear_after_hwrm_resources_free_npd",
    "key_actions": [
      "OwnerTeardownHwrm",
      "CallPtpClear"
    ],
    "name": "PTP clear after HWRM resource teardown"
  },
  "context": {
    "end_action": [
      "CallPtpClear"
    ],
    "start_action": [
      "OwnerTeardownHwrm"
    ]
  },
  "event_metadata": {
    "CallPtpClear": {
      "role": "sink"
    },
    "OwnerTeardownHwrm": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "HwrmTornDown",
      "merge_state": "HwrmTornDown"
    }
  ],
  "sliced_action": [
    "OwnerTeardownHwrm",
    "CallPtpClear"
  ],
  "state": [
    "Untracked",
    "HwrmTornDown",
    "InvalidPtpClear"
  ],
  "state_roles": {
    "HwrmTornDown": "danger",
    "Init": "init",
    "InvalidPtpClear": "bug"
  },
  "transition": [
    {
      "action": "OwnerTeardownHwrm",
      "curr_state": "Untracked",
      "next_state": "HwrmTornDown"
    },
    {
      "action": "CallPtpClear",
      "curr_state": "HwrmTornDown",
      "next_state": "InvalidPtpClear"
    },
    {
      "action": "CallPtpClear",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "OwnerTeardownHwrm",
      "curr_state": "HwrmTornDown",
      "next_state": "HwrmTornDown"
    },
    {
      "action": "OwnerTeardownHwrm",
      "curr_state": "InvalidPtpClear",
      "next_state": "InvalidPtpClear"
    },
    {
      "action": "CallPtpClear",
      "curr_state": "InvalidPtpClear",
      "next_state": "InvalidPtpClear"
    }
  ]
}