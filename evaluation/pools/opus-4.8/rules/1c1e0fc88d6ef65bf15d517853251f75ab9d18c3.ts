{
  "action": {
    "Call": [
      {
        "AllocGenericChips": [
          {
            "arg_idx": 0,
            "func_name": "irq_alloc_domain_generic_chips"
          }
        ]
      },
      {
        "CallRemoveGenericChips": [
          {
            "arg_idx": 0,
            "func_name": "irq_domain_remove_generic_chips"
          }
        ]
      },
      {
        "CallRemoveDomain": [
          {
            "arg_idx": 0,
            "func_name": "irq_domain_remove"
          }
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "AllocGenericChips"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DomainRemovedLeak",
    "key": "rockchip_gpio_generic_chip_leak_on_remove",
    "key_actions": [
      "AllocGenericChips",
      "CallRemoveDomain"
    ],
    "name": "error-path resource-leak of domain generic chips"
  },
  "context": {
    "end_action": [
      "CallRemoveGenericChips"
    ],
    "start_action": [
      "AllocGenericChips"
    ]
  },
  "event_metadata": {
    "AllocGenericChips": {
      "role": "acquire"
    },
    "CallRemoveDomain": {
      "role": "sink"
    },
    "CallRemoveGenericChips": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "ChipsAllocated",
      "merge_state": "ChipsAllocated"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "ChipsRemoved",
      "merge_state": "ChipsRemoved"
    }
  ],
  "sliced_action": [
    "AllocGenericChips",
    "CallRemoveGenericChips",
    "CallRemoveDomain"
  ],
  "state": [
    "Untracked",
    "ChipsAllocated",
    "ChipsRemoved",
    "DomainRemovedLeak"
  ],
  "state_roles": {
    "ChipsAllocated": "danger",
    "ChipsRemoved": "safe",
    "DomainRemovedLeak": "bug",
    "Init": "init"
  },
  "transition": [
    {
      "action": "AllocGenericChips",
      "curr_state": "Untracked",
      "next_state": "ChipsAllocated"
    },
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "ChipsAllocated",
      "next_state": "ChipsRemoved"
    },
    {
      "action": "CallRemoveDomain",
      "curr_state": "ChipsAllocated",
      "next_state": "DomainRemovedLeak"
    },
    {
      "action": "AllocGenericChips",
      "curr_state": "ChipsRemoved",
      "next_state": "ChipsAllocated"
    },
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallRemoveDomain",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "AllocGenericChips",
      "curr_state": "ChipsAllocated",
      "next_state": "ChipsAllocated"
    },
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "ChipsRemoved",
      "next_state": "ChipsRemoved"
    },
    {
      "action": "CallRemoveDomain",
      "curr_state": "ChipsRemoved",
      "next_state": "ChipsRemoved"
    },
    {
      "action": "AllocGenericChips",
      "curr_state": "DomainRemovedLeak",
      "next_state": "DomainRemovedLeak"
    },
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "DomainRemovedLeak",
      "next_state": "DomainRemovedLeak"
    },
    {
      "action": "CallRemoveDomain",
      "curr_state": "DomainRemovedLeak",
      "next_state": "DomainRemovedLeak"
    }
  ]
}