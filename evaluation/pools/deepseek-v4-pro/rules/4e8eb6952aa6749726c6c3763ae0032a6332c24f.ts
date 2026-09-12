{
  "action": {
    "Call": [
      {
        "CallDomainRemove": [
          {
            "arg_idx": 0,
            "func_name": "irq_domain_remove"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "CallDomainCreate": [
          "irq_domain_create_legacy"
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
      "CallDomainCreate"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallDomainCreate"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "davinci_gpio_irq_domain_leak",
    "key_actions": [
      "CallDomainCreate",
      "ErrExit"
    ],
    "name": "IRQ domain leak on error path"
  },
  "context": {
    "end_action": [
      "CallDomainRemove"
    ],
    "start_action": [
      "CallDomainCreate"
    ]
  },
  "event_metadata": {
    "CallDomainCreate": {
      "role": "source"
    },
    "CallDomainRemove": {
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
    "CallDomainCreate",
    "CallDomainRemove",
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
      "action": "CallDomainRemove",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "CallDomainCreate",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "CallDomainCreate",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallDomainCreate",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDomainCreate",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallDomainRemove",
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