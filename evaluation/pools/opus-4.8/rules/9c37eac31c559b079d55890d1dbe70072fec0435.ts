{
  "action": {
    "Call": [
      {
        "CallDeassert": [
          {
            "arg_idx": 0,
            "func_name": "reset_control_deassert"
          }
        ]
      },
      {
        "CallAssert": [
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
      "CallDeassert"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallDeassert"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "riic_i2c_resume_noirq_reset_leak",
    "key_actions": [
      "CallDeassert",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallAssert"
    ],
    "start_action": [
      "CallDeassert"
    ]
  },
  "event_metadata": {
    "CallAssert": {
      "role": "release"
    },
    "CallDeassert": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Deasserted",
      "merge_state": "Deasserted"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Asserted",
      "merge_state": "Asserted"
    }
  ],
  "sliced_action": [
    "CallDeassert",
    "CallAssert",
    "ErrExit"
  ],
  "state": [
    "Deasserted",
    "Asserted",
    "Leak"
  ],
  "state_roles": {
    "Asserted": "safe",
    "Deasserted": "danger",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallAssert",
      "curr_state": "Deasserted",
      "next_state": "Asserted"
    },
    {
      "action": "ErrExit",
      "curr_state": "Deasserted",
      "next_state": "Leak"
    },
    {
      "action": "CallDeassert",
      "curr_state": "Asserted",
      "next_state": "Deasserted"
    },
    {
      "action": "CallDeassert",
      "curr_state": "Deasserted",
      "next_state": "Deasserted"
    },
    {
      "action": "CallAssert",
      "curr_state": "Asserted",
      "next_state": "Asserted"
    },
    {
      "action": "ErrExit",
      "curr_state": "Asserted",
      "next_state": "Asserted"
    },
    {
      "action": "CallDeassert",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallAssert",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDeassert",
      "curr_state": "Any",
      "next_state": "Deasserted"
    },
    {
      "action": "CallAssert",
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