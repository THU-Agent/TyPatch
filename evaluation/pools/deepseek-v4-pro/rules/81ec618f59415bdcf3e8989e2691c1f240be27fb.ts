{
  "action": {
    "Call": [
      {
        "CallRelease": [
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
        "AcquireRet": [
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
      "AcquireRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "perf/x86/intel/uncore: pci_dev refcount leak in UPI discovery",
    "key_actions": [
      "AcquireRet",
      "Exit"
    ],
    "name": "pci_dev refcount leak in UPI discovery"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "AcquireRet"
    ]
  },
  "event_metadata": {
    "AcquireRet": {
      "role": "source"
    },
    "CallRelease": {
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
    "AcquireRet",
    "CallRelease",
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
      "action": "CallRelease",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AcquireRet",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquireRet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallRelease",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRelease",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireRet",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallRelease",
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