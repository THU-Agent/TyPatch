{
  "action": {
    "BrNull": [],
    "Call": [
      {
        "ReleaseDomain": [
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
        "AcquireDomain": [
          "irq_domain_create_legacy"
        ]
      },
      {
        "AllocRet": [
          "devm_kzalloc"
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
      "AcquireDomain"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AcquireDomain"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "davinci_gpio_irq_domain_leak_on_devm_kzalloc_failure",
    "key_actions": [
      "AcquireDomain",
      "ErrExit"
    ],
    "name": "error-path IRQ domain leak"
  },
  "context": {
    "end_action": [
      "ReleaseDomain"
    ],
    "start_action": [
      "AcquireDomain"
    ]
  },
  "event_metadata": {
    "AcquireDomain": {
      "role": "acquire"
    },
    "AllocRet": {
      "role": "context"
    },
    "BrNull": {
      "role": "guard"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseDomain": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "DomainAcquired",
      "merge_state": "DomainAcquired"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "DomainReleased",
      "merge_state": "DomainReleased"
    }
  ],
  "sliced_action": [
    "AcquireDomain",
    "ReleaseDomain",
    "AllocRet",
    "BrNull",
    "ErrExit"
  ],
  "state": [
    "DomainAcquired",
    "DomainReleased",
    "Leak"
  ],
  "state_roles": {
    "DomainAcquired": "danger",
    "DomainReleased": "safe",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "ReleaseDomain",
      "curr_state": "DomainAcquired",
      "next_state": "DomainReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "DomainAcquired",
      "next_state": "Leak"
    },
    {
      "action": "AcquireDomain",
      "curr_state": "DomainReleased",
      "next_state": "DomainAcquired"
    },
    {
      "action": "AcquireDomain",
      "curr_state": "DomainAcquired",
      "next_state": "DomainAcquired"
    },
    {
      "action": "AllocRet",
      "curr_state": "DomainAcquired",
      "next_state": "DomainAcquired"
    },
    {
      "action": "BrNull",
      "curr_state": "DomainAcquired",
      "next_state": "DomainAcquired"
    },
    {
      "action": "ReleaseDomain",
      "curr_state": "DomainReleased",
      "next_state": "DomainReleased"
    },
    {
      "action": "AllocRet",
      "curr_state": "DomainReleased",
      "next_state": "DomainReleased"
    },
    {
      "action": "BrNull",
      "curr_state": "DomainReleased",
      "next_state": "DomainReleased"
    },
    {
      "action": "ErrExit",
      "curr_state": "DomainReleased",
      "next_state": "DomainReleased"
    },
    {
      "action": "AcquireDomain",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseDomain",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "BrNull",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireDomain",
      "curr_state": "Any",
      "next_state": "DomainAcquired"
    },
    {
      "action": "ReleaseDomain",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "AllocRet",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "BrNull",
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