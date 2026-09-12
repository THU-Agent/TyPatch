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
    "key": "act_ct_nf_connlabels_leak_error_path",
    "key_actions": [
      "CallGetLabels",
      "ErrExit"
    ],
    "name": "nf_connlabels leak on error paths"
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
      "curr_state2": "Acquired",
      "merge_state": "Acquired"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallGetLabels",
    "CallPutLabels",
    "ErrExit"
  ],
  "state": [
    "Acquired",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Acquired": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallPutLabels",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "CallGetLabels",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "CallGetLabels",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallPutLabels",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
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
      "next_state": "Acquired"
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