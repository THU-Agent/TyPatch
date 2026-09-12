{
  "action": {
    "Call": [
      {
        "PutRef": [
          {
            "arg_idx": 0,
            "field_path": "ref",
            "func_name": "kref_put"
          }
        ]
      }
    ],
    "Exit": [],
    "Ret": [
      {
        "GetDeviceRet": [
          "nvmet_rdma_find_get_device"
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "disable_slice": true,
    "initial_state": "Init",
    "intra_procedural_cfg": true,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_same_function": true,
    "source_actions": [
      "GetDeviceRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "resource-leak-ndev-ref",
    "key_actions": [
      "GetDeviceRet",
      "Exit"
    ],
    "name": "nvmet-rdma-ndev-ref-leak"
  },
  "context": {
    "end_action": [
      "Exit"
    ],
    "start_action": [
      "GetDeviceRet"
    ]
  },
  "event_metadata": {
    "Exit": {
      "role": "sink"
    },
    "GetDeviceRet": {
      "role": "source"
    },
    "PutRef": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Acquired",
      "merge_state": "Acquired"
    }
  ],
  "sliced_action": [
    "GetDeviceRet",
    "PutRef",
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
      "action": "PutRef",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "GetDeviceRet",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "GetDeviceRet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "PutRef",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "GetDeviceRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "PutRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "GetDeviceRet",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "PutRef",
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