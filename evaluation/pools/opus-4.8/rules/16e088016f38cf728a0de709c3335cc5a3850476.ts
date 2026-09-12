{
  "action": {
    "Call": [
      {
        "CallEnable": [
          {
            "arg_idx": 0,
            "func_name": "nf_connlabels_get"
          }
        ]
      },
      {
        "CallDisable": [
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
      "CallEnable"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallEnable"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "act_ct_nf_connlabels_leak_error_path",
    "key_actions": [
      "CallEnable",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallDisable"
    ],
    "start_action": [
      "CallEnable"
    ]
  },
  "event_metadata": {
    "CallDisable": {
      "role": "release"
    },
    "CallEnable": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Enabled",
      "merge_state": "Enabled"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Disabled",
      "merge_state": "Disabled"
    }
  ],
  "sliced_action": [
    "CallEnable",
    "CallDisable",
    "ErrExit"
  ],
  "state": [
    "Enabled",
    "Disabled",
    "Leak"
  ],
  "state_roles": {
    "Disabled": "safe",
    "Enabled": "danger",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallDisable",
      "curr_state": "Enabled",
      "next_state": "Disabled"
    },
    {
      "action": "ErrExit",
      "curr_state": "Enabled",
      "next_state": "Leak"
    },
    {
      "action": "CallEnable",
      "curr_state": "Disabled",
      "next_state": "Enabled"
    },
    {
      "action": "CallEnable",
      "curr_state": "Enabled",
      "next_state": "Enabled"
    },
    {
      "action": "CallDisable",
      "curr_state": "Disabled",
      "next_state": "Disabled"
    },
    {
      "action": "ErrExit",
      "curr_state": "Disabled",
      "next_state": "Disabled"
    },
    {
      "action": "CallEnable",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDisable",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallEnable",
      "curr_state": "Any",
      "next_state": "Enabled"
    },
    {
      "action": "CallDisable",
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