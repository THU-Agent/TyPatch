{
  "action": {
    "Call": [
      {
        "CallAllocGenChips": [
          {
            "arg_idx": 0,
            "func_name": "irq_alloc_domain_generic_chips"
          }
        ]
      },
      {
        "CallRemoveGenChips": [
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
    "call_outparam_as_init": false,
    "initial_state": "Init",
    "intra_procedural_cfg": false,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "gpio_rockchip_generic_chip_leak",
    "key_actions": [
      "CallAllocGenChips",
      "CallDomainRemove"
    ],
    "name": "resource leak of generic IRQ chips on remove"
  },
  "context": {
    "end_action": [
      "CallRemoveGenChips"
    ],
    "start_action": [
      "CallAllocGenChips"
    ]
  },
  "event_metadata": {
    "CallAllocGenChips": {
      "role": "acquire"
    },
    "CallDomainRemove": {
      "role": "sink"
    },
    "CallRemoveGenChips": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Active",
      "merge_state": "Active"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "CleanedUp",
      "merge_state": "CleanedUp"
    }
  ],
  "sliced_action": [
    "CallAllocGenChips",
    "CallRemoveGenChips",
    "CallDomainRemove"
  ],
  "state": [
    "Active",
    "CleanedUp",
    "Leak"
  ],
  "state_roles": {
    "Active": "danger",
    "CleanedUp": "safe",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallRemoveGenChips",
      "curr_state": "Active",
      "next_state": "CleanedUp"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "Active",
      "next_state": "Leak"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "CleanedUp",
      "next_state": "Any"
    },
    {
      "action": "CallAllocGenChips",
      "curr_state": "Active",
      "next_state": "Active"
    },
    {
      "action": "CallAllocGenChips",
      "curr_state": "CleanedUp",
      "next_state": "CleanedUp"
    },
    {
      "action": "CallRemoveGenChips",
      "curr_state": "CleanedUp",
      "next_state": "CleanedUp"
    },
    {
      "action": "CallAllocGenChips",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRemoveGenChips",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallDomainRemove",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallAllocGenChips",
      "curr_state": "Any",
      "next_state": "Active"
    },
    {
      "action": "CallRemoveGenChips",
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