{
  "action": {
    "Call": [
      {
        "CallAcquireRef": [
          {
            "arg_idx": 0,
            "field_path": "ref",
            "func_name": "kref_get_unless_zero"
          }
        ]
      },
      {
        "CallReleaseRef": [
          {
            "arg_idx": 0,
            "func_name": "nvmet_ctrl_put"
          }
        ]
      }
    ],
    "ErrExit": []
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "disable_slice": true,
    "initial_state": "Init",
    "intra_procedural_cfg": true,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_same_function": true,
    "source_actions": [
      "CallAcquireRef"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallAcquireRef"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "nvmet-sq-create-refcount-leak",
    "key_actions": [
      "CallAcquireRef",
      "ErrExit"
    ],
    "name": "refcount leak in nvmet_sq_create()"
  },
  "context": {
    "end_action": [
      "CallReleaseRef"
    ],
    "start_action": [
      "CallAcquireRef"
    ]
  },
  "event_metadata": {
    "CallAcquireRef": {
      "role": "acquire"
    },
    "CallReleaseRef": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Referenced",
      "merge_state": "Referenced"
    }
  ],
  "sliced_action": [
    "CallAcquireRef",
    "CallReleaseRef",
    "ErrExit"
  ],
  "state": [
    "Referenced",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Referenced": "danger"
  },
  "transition": [
    {
      "action": "CallReleaseRef",
      "curr_state": "Referenced",
      "next_state": "Any"
    },
    {
      "action": "ErrExit",
      "curr_state": "Referenced",
      "next_state": "Leak"
    },
    {
      "action": "CallAcquireRef",
      "curr_state": "Referenced",
      "next_state": "Referenced"
    },
    {
      "action": "CallAcquireRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallReleaseRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallAcquireRef",
      "curr_state": "Any",
      "next_state": "Referenced"
    },
    {
      "action": "CallReleaseRef",
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