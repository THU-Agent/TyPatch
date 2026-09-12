{
  "action": {
    "Call": [
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "irq_domain_free_fwnode"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "AllocFwnode": [
          "irq_domain_alloc_named_fwnode",
          "__irq_domain_alloc_fwnode"
        ]
      }
    ]
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
      "AllocFwnode"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AllocFwnode"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "imsic_early_acpi_init_fwnode_leak",
    "key_actions": [
      "AllocFwnode",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "AllocFwnode"
    ]
  },
  "event_metadata": {
    "AllocFwnode": {
      "role": "source"
    },
    "CallFree": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Allocated",
      "merge_state": "Allocated"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "AllocFwnode",
    "CallFree",
    "ErrExit"
  ],
  "state": [
    "Allocated",
    "Freed",
    "Leak"
  ],
  "state_roles": {
    "Allocated": "danger",
    "Freed": "safe",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallFree",
      "curr_state": "Allocated",
      "next_state": "Freed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Allocated",
      "next_state": "Leak"
    },
    {
      "action": "AllocFwnode",
      "curr_state": "Freed",
      "next_state": "Allocated"
    },
    {
      "action": "AllocFwnode",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "CallFree",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "AllocFwnode",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallFree",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocFwnode",
      "curr_state": "Any",
      "next_state": "Allocated"
    },
    {
      "action": "CallFree",
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