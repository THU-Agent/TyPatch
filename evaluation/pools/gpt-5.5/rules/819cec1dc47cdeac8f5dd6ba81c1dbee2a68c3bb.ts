{
  "action": {
    "Call": [
      {
        "CallInit": [
          {
            "arg_idx": 1,
            "func_name": "hcall_get_cpu_state"
          }
        ]
      },
      {
        "CallCopy": [
          {
            "arg_idx": 1,
            "func_name": "copy_to_user"
          }
        ]
      }
    ],
    "Ret": [
      {
        "AllocRet": [
          "kmalloc"
        ]
      }
    ],
    "StoreInit": []
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
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "InfoLeak",
    "key": "CVE-infoleak-kmalloc-partial-init-copy-pmcmd_ioctl",
    "key_actions": [
      "AllocRet",
      "CallCopy"
    ],
    "name": "partial-init-copy info leak"
  },
  "context": {
    "end_action": [
      "CallCopy"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "CallCopy": {
      "role": "sink"
    },
    "CallInit": {
      "role": "init"
    },
    "StoreInit": {
      "role": "guard"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Uninitialized",
      "merge_state": "Uninitialized"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "ZeroInitialized",
      "merge_state": "ZeroInitialized"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "CallInit",
    "StoreInit",
    "CallCopy"
  ],
  "state": [
    "Uninitialized",
    "ZeroInitialized",
    "InfoLeak"
  ],
  "state_roles": {
    "InfoLeak": "bug",
    "Init": "init",
    "Uninitialized": "danger",
    "ZeroInitialized": "safe"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninitialized",
      "next_state": "ZeroInitialized"
    },
    {
      "action": "CallCopy",
      "curr_state": "Uninitialized",
      "next_state": "InfoLeak"
    },
    {
      "action": "AllocRet",
      "curr_state": "ZeroInitialized",
      "next_state": "Uninitialized"
    },
    {
      "action": "AllocRet",
      "curr_state": "Uninitialized",
      "next_state": "Uninitialized"
    },
    {
      "action": "CallInit",
      "curr_state": "Uninitialized",
      "next_state": "Uninitialized"
    },
    {
      "action": "CallInit",
      "curr_state": "ZeroInitialized",
      "next_state": "ZeroInitialized"
    },
    {
      "action": "StoreInit",
      "curr_state": "ZeroInitialized",
      "next_state": "ZeroInitialized"
    },
    {
      "action": "CallCopy",
      "curr_state": "ZeroInitialized",
      "next_state": "ZeroInitialized"
    },
    {
      "action": "AllocRet",
      "curr_state": "InfoLeak",
      "next_state": "InfoLeak"
    },
    {
      "action": "CallInit",
      "curr_state": "InfoLeak",
      "next_state": "InfoLeak"
    },
    {
      "action": "StoreInit",
      "curr_state": "InfoLeak",
      "next_state": "InfoLeak"
    },
    {
      "action": "CallCopy",
      "curr_state": "InfoLeak",
      "next_state": "InfoLeak"
    },
    {
      "action": "AllocRet",
      "curr_state": "Any",
      "next_state": "Uninitialized"
    },
    {
      "action": "StoreInit",
      "curr_state": "Any",
      "next_state": "ZeroInitialized"
    },
    {
      "action": "CallInit",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallCopy",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}