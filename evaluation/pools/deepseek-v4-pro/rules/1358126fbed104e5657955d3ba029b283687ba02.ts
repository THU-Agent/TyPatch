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
        "AllocRet": [
          "irq_domain_alloc_named_fwnode"
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
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AllocRet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "irqchip-riscv-imsic-early-fwnode-leak",
    "key_actions": [
      "AllocRet",
      "ErrExit"
    ],
    "name": "fwnode leak on imsic_setup_state failure"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
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
    "AllocRet",
    "CallFree",
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
      "action": "CallFree",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AllocRet",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AllocRet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallFree",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AllocRet",
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
      "action": "AllocRet",
      "curr_state": "Any",
      "next_state": "Acquired"
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