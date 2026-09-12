{
  "action": {
    "Call": [
      {
        "CallRegister": [
          {
            "arg_idx": 1,
            "func_name": "devm_register_netdev"
          }
        ]
      },
      {
        "CallUnregister": [
          {
            "arg_idx": 0,
            "func_name": "unregister_netdev"
          }
        ]
      }
    ],
    "Use": []
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
    "source_actions": [
      "CallRegister"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "emac_devm_register_netdev_uaf",
    "key_actions": [
      "CallRegister",
      "Use"
    ],
    "name": "use-after-free via deferred devm unregister"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallRegister"
    ]
  },
  "event_metadata": {
    "CallRegister": {
      "role": "source"
    },
    "CallUnregister": {
      "role": "release"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Registered",
      "merge_state": "Registered"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Unregistered",
      "merge_state": "Unregistered"
    }
  ],
  "sliced_action": [
    "CallRegister",
    "CallUnregister",
    "Use"
  ],
  "state": [
    "Untracked",
    "Registered",
    "Unregistered",
    "UAF"
  ],
  "state_roles": {
    "Init": "init",
    "Registered": "danger",
    "UAF": "bug",
    "Unregistered": "safe"
  },
  "transition": [
    {
      "action": "CallRegister",
      "curr_state": "Untracked",
      "next_state": "Registered"
    },
    {
      "action": "CallUnregister",
      "curr_state": "Registered",
      "next_state": "Unregistered"
    },
    {
      "action": "Use",
      "curr_state": "Registered",
      "next_state": "UAF"
    },
    {
      "action": "CallRegister",
      "curr_state": "Unregistered",
      "next_state": "Registered"
    },
    {
      "action": "CallUnregister",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallRegister",
      "curr_state": "Registered",
      "next_state": "Registered"
    },
    {
      "action": "CallUnregister",
      "curr_state": "Unregistered",
      "next_state": "Unregistered"
    },
    {
      "action": "Use",
      "curr_state": "Unregistered",
      "next_state": "Unregistered"
    },
    {
      "action": "CallRegister",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallUnregister",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    }
  ]
}