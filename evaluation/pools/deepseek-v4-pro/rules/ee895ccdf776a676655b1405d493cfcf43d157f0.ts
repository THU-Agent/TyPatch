{
  "action": {
    "Call": [
      {
        "CallClkEnable": [
          {
            "arg_idx": 0,
            "func_name": "clk_prepare_enable"
          }
        ]
      },
      {
        "CallClkDisable": [
          {
            "arg_idx": 0,
            "func_name": "clk_disable_unprepare"
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
      "CallClkEnable"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallClkEnable"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "sram_probe_clock_leak",
    "key_actions": [
      "CallClkEnable",
      "ErrExit"
    ],
    "name": "enabled clock leak on error path"
  },
  "context": {
    "end_action": [
      "CallClkDisable"
    ],
    "start_action": [
      "CallClkEnable"
    ]
  },
  "event_metadata": {
    "CallClkDisable": {
      "role": "release"
    },
    "CallClkEnable": {
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
    "CallClkEnable",
    "CallClkDisable",
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
      "action": "CallClkDisable",
      "curr_state": "Enabled",
      "next_state": "Disabled"
    },
    {
      "action": "ErrExit",
      "curr_state": "Enabled",
      "next_state": "Leak"
    },
    {
      "action": "CallClkEnable",
      "curr_state": "Disabled",
      "next_state": "Enabled"
    },
    {
      "action": "CallClkEnable",
      "curr_state": "Enabled",
      "next_state": "Enabled"
    },
    {
      "action": "CallClkDisable",
      "curr_state": "Disabled",
      "next_state": "Disabled"
    },
    {
      "action": "ErrExit",
      "curr_state": "Disabled",
      "next_state": "Disabled"
    },
    {
      "action": "CallClkEnable",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallClkDisable",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallClkEnable",
      "curr_state": "Any",
      "next_state": "Enabled"
    },
    {
      "action": "CallClkDisable",
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