{
  "action": {
    "Ret": [
      {
        "AllocRet": [
          "kmalloc"
        ]
      }
    ],
    "StoreInit": [],
    "Use": []
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
    "key": "usb-usblp-statusbuf-uninitialized-heap-leak",
    "key_actions": [
      "AllocRet",
      "Use"
    ],
    "name": "uninitialized heap buffer use"
  },
  "context": {
    "end_action": [
      "StoreInit",
      "Use"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "StoreInit": {
      "role": "init"
    },
    "Use": {
      "role": "sink"
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
      "curr_state2": "Initialized",
      "merge_state": "Initialized"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "StoreInit",
    "Use"
  ],
  "state": [
    "Uninitialized",
    "Initialized",
    "InfoLeak"
  ],
  "state_roles": {
    "InfoLeak": "bug",
    "Init": "init",
    "Initialized": "safe",
    "Uninitialized": "danger"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Uninitialized",
      "next_state": "Initialized"
    },
    {
      "action": "Use",
      "curr_state": "Uninitialized",
      "next_state": "InfoLeak"
    },
    {
      "action": "AllocRet",
      "curr_state": "Initialized",
      "next_state": "Uninitialized"
    },
    {
      "action": "AllocRet",
      "curr_state": "Uninitialized",
      "next_state": "Uninitialized"
    },
    {
      "action": "StoreInit",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "Use",
      "curr_state": "Initialized",
      "next_state": "Initialized"
    },
    {
      "action": "AllocRet",
      "curr_state": "InfoLeak",
      "next_state": "InfoLeak"
    },
    {
      "action": "StoreInit",
      "curr_state": "InfoLeak",
      "next_state": "InfoLeak"
    },
    {
      "action": "Use",
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
      "next_state": "Any"
    },
    {
      "action": "Use",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}