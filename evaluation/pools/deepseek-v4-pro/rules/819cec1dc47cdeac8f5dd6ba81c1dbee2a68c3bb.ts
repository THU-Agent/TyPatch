{
  "action": {
    "Call": [
      {
        "CallCopyUser": [
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
    "bug_state": "Bug",
    "key": "acrn-hsm-pmcmd-ioctl-kmalloc-info-leak",
    "key_actions": [
      "AllocRet",
      "CallCopyUser"
    ],
    "name": "acrn-pmcmd-ioctl-kmalloc-info-leak"
  },
  "context": {
    "end_action": [
      "CallCopyUser"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "CallCopyUser": {
      "role": "sink"
    },
    "StoreInit": {
      "role": "guard"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Uninit",
      "merge_state": "Uninit"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Safe",
      "merge_state": "Safe"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "StoreInit",
    "CallCopyUser"
  ],
  "state": [
    "Uninit",
    "Safe",
    "Bug"
  ],
  "state_roles": {
    "Bug": "bug",
    "Init": "init",
    "Safe": "safe",
    "Uninit": "danger"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninit",
      "next_state": "Safe"
    },
    {
      "action": "CallCopyUser",
      "curr_state": "Uninit",
      "next_state": "Bug"
    },
    {
      "action": "AllocRet",
      "curr_state": "Safe",
      "next_state": "Uninit"
    },
    {
      "action": "AllocRet",
      "curr_state": "Uninit",
      "next_state": "Uninit"
    },
    {
      "action": "StoreInit",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "CallCopyUser",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "AllocRet",
      "curr_state": "Bug",
      "next_state": "Bug"
    },
    {
      "action": "StoreInit",
      "curr_state": "Bug",
      "next_state": "Bug"
    },
    {
      "action": "CallCopyUser",
      "curr_state": "Bug",
      "next_state": "Bug"
    },
    {
      "action": "AllocRet",
      "curr_state": "Any",
      "next_state": "Uninit"
    },
    {
      "action": "StoreInit",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallCopyUser",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}