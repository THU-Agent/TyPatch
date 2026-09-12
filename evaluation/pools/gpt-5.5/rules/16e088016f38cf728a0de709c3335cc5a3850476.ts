{
  "action": {
    "Call": [
      {
        "CallGetLabels": [
          {
            "arg_idx": 0,
            "func_name": "nf_connlabels_get"
          }
        ]
      },
      {
        "CallPutLabels": [
          {
            "arg_idx": 0,
            "func_name": "nf_connlabels_put"
          }
        ]
      }
    ],
    "ErrExit": []
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
    "report_key_actions_same_function": true,
    "source_actions": [
      "CallGetLabels"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallGetLabels"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "act_ct_nf_connlabels_error_path_leak",
    "key_actions": [
      "CallGetLabels",
      "ErrExit"
    ],
    "name": "error-path nf_connlabels reference leak"
  },
  "context": {
    "end_action": [
      "CallPutLabels"
    ],
    "start_action": [
      "CallGetLabels"
    ]
  },
  "event_metadata": {
    "CallGetLabels": {
      "role": "source"
    },
    "CallPutLabels": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "LabelsHeld",
      "merge_state": "LabelsHeld"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "LabelsReleased",
      "merge_state": "LabelsReleased"
    }
  ],
  "sliced_action": [
    "CallGetLabels",
    "CallPutLabels",
    "ErrExit"
  ],
  "state": [
    "LabelsHeld",
    "LabelsReleased",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "LabelsHeld": "danger",
    "LabelsReleased": "safe",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallPutLabels",
      "curr_state": "LabelsHeld",
      "next_state": "LabelsReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "LabelsHeld",
      "next_state": "Leak"
    },
    {
      "action": "CallGetLabels",
      "curr_state": "LabelsReleased",
      "next_state": "LabelsHeld"
    },
    {
      "action": "CallGetLabels",
      "curr_state": "LabelsHeld",
      "next_state": "LabelsHeld"
    },
    {
      "action": "CallPutLabels",
      "curr_state": "LabelsReleased",
      "next_state": "LabelsReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "LabelsReleased",
      "next_state": "LabelsReleased"
    },
    {
      "action": "CallGetLabels",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPutLabels",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGetLabels",
      "curr_state": "Any",
      "next_state": "LabelsHeld"
    },
    {
      "action": "CallPutLabels",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "ErrExit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}