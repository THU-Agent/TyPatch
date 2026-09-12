{
  "action": {
    "Call": [
      {
        "CallAllocGenericChips": [
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
        "CallDomainRemove": [
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
    "initial_state": "Init",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "CallAllocGenericChips"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DomainRemovedWithChips",
    "key": "gpio_rockchip_generic_irq_chip_leak_on_remove",
    "key_actions": [
      "CallAllocGenericChips",
      "CallDomainRemove"
    ],
    "name": "generic IRQ chip leak on domain removal"
  },
  "context": {
    "end_action": [
      "CallRemoveGenericChips"
    ],
    "start_action": [
      "CallAllocGenericChips"
    ]
  },
  "event_metadata": {
    "CallAllocGenericChips": {
      "role": "acquire"
    },
    "CallDomainRemove": {
      "role": "sink"
    },
    "CallRemoveGenericChips": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "GenericChipsAllocated",
      "merge_state": "GenericChipsAllocated"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "GenericChipsRemoved",
      "merge_state": "GenericChipsRemoved"
    }
  ],
  "sliced_action": [
    "CallAllocGenericChips",
    "CallRemoveGenericChips",
    "CallDomainRemove"
  ],
  "state": [
    "GenericChipsAllocated",
    "GenericChipsRemoved",
    "DomainRemovedWithChips"
  ],
  "state_roles": {
    "DomainRemovedWithChips": "bug",
    "GenericChipsAllocated": "danger",
    "GenericChipsRemoved": "safe",
    "Init": "init"
  },
  "transition": [
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "GenericChipsAllocated",
      "next_state": "GenericChipsRemoved"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "GenericChipsAllocated",
      "next_state": "DomainRemovedWithChips"
    },
    {
      "action": "CallAllocGenericChips",
      "curr_state": "GenericChipsRemoved",
      "next_state": "GenericChipsAllocated"
    },
    {
      "action": "CallAllocGenericChips",
      "curr_state": "GenericChipsAllocated",
      "next_state": "GenericChipsAllocated"
    },
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "GenericChipsRemoved",
      "next_state": "GenericChipsRemoved"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "GenericChipsRemoved",
      "next_state": "GenericChipsRemoved"
    },
    {
      "action": "CallAllocGenericChips",
      "curr_state": "DomainRemovedWithChips",
      "next_state": "DomainRemovedWithChips"
    },
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "DomainRemovedWithChips",
      "next_state": "DomainRemovedWithChips"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "DomainRemovedWithChips",
      "next_state": "DomainRemovedWithChips"
    },
    {
      "action": "CallAllocGenericChips",
      "curr_state": "Any",
      "next_state": "GenericChipsAllocated"
    },
    {
      "action": "CallRemoveGenericChips",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}