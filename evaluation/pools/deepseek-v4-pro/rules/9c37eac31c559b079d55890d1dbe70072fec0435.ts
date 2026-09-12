{
  "action": {
    "Call": [
      {
        "ResetDeassert": [
          {
            "arg_idx": 0,
            "func_name": "reset_control_deassert"
          }
        ]
      },
      {
        "ResetAssert": [
          {
            "arg_idx": 0,
            "func_name": "reset_control_assert"
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
      "ResetDeassert"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "ResetDeassert"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "riic-resume-refcount-leak",
    "key_actions": [
      "ResetDeassert",
      "ErrExit"
    ],
    "name": "reset-refcount-leak"
  },
  "context": {
    "end_action": [
      "ResetAssert"
    ],
    "start_action": [
      "ResetDeassert"
    ]
  },
  "event_metadata": {
    "Exit": {
      "role": "sink"
    },
    "ResetAssert": {
      "role": "release"
    },
    "ResetDeassert": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Deasserted",
      "merge_state": "Deasserted"
    }
  ],
  "sliced_action": [
    "ResetDeassert",
    "ResetAssert",
    "ErrExit"
  ],
  "state": [
    "Deasserted",
    "Leak"
  ],
  "state_roles": {
    "Deasserted": "danger",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "ResetAssert",
      "curr_state": "Deasserted",
      "next_state": "Any"
    },
    {
      "action": "ErrExit",
      "curr_state": "Deasserted",
      "next_state": "Leak"
    },
    {
      "action": "ResetDeassert",
      "curr_state": "Deasserted",
      "next_state": "Deasserted"
    },
    {
      "action": "ResetDeassert",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ResetAssert",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ResetDeassert",
      "curr_state": "Any",
      "next_state": "Deasserted"
    },
    {
      "action": "ResetAssert",
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