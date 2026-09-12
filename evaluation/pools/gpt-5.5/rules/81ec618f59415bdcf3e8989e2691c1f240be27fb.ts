{
  "action": {
    "Call": [
      {
        "CallPut": [
          {
            "arg_idx": 0,
            "func_name": "pci_dev_put"
          }
        ]
      }
    ],
    "Exit": [],
    "Ret": [
      {
        "OptionalResourceRet": [
          "pci_get_domain_bus_and_slot"
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
      "OptionalResourceRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "pci-dev-refcount-leak-upi-discovery",
    "key_actions": [
      "OptionalResourceRet",
      "Exit"
    ],
    "name": "PCI device refcount leak"
  },
  "context": {
    "end_action": [
      "CallPut"
    ],
    "start_action": [
      "OptionalResourceRet"
    ]
  },
  "event_metadata": {
    "CallPut": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    },
    "OptionalResourceRet": {
      "role": "acquire"
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
    "OptionalResourceRet",
    "CallPut",
    "Exit"
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
      "action": "CallPut",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallPut",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallPut",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "Exit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}