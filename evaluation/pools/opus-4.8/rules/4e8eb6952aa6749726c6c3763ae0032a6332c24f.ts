{
  "action": {
    "Call": [
      {
        "CallCreate": [
          {
            "arg_idx": 4,
            "func_name": "irq_domain_create_legacy"
          }
        ]
      },
      {
        "CallRemove": [
          {
            "arg_idx": 0,
            "func_name": "irq_domain_remove"
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
      "CallCreate"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallCreate"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "gpio_davinci_irq_domain_leak_on_alloc_fail",
    "key_actions": [
      "CallCreate",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallRemove"
    ],
    "start_action": [
      "CallCreate"
    ]
  },
  "event_metadata": {
    "CallCreate": {
      "role": "source"
    },
    "CallRemove": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Created",
      "merge_state": "Created"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Removed",
      "merge_state": "Removed"
    }
  ],
  "sliced_action": [
    "CallCreate",
    "CallRemove",
    "ErrExit"
  ],
  "state": [
    "Created",
    "Removed",
    "Leak"
  ],
  "state_roles": {
    "Created": "danger",
    "Init": "init",
    "Leak": "bug",
    "Removed": "safe"
  },
  "transition": [
    {
      "action": "CallRemove",
      "curr_state": "Created",
      "next_state": "Removed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Created",
      "next_state": "Leak"
    },
    {
      "action": "CallCreate",
      "curr_state": "Removed",
      "next_state": "Created"
    },
    {
      "action": "CallCreate",
      "curr_state": "Created",
      "next_state": "Created"
    },
    {
      "action": "CallRemove",
      "curr_state": "Removed",
      "next_state": "Removed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Removed",
      "next_state": "Removed"
    },
    {
      "action": "CallCreate",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRemove",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallCreate",
      "curr_state": "Any",
      "next_state": "Created"
    },
    {
      "action": "CallRemove",
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