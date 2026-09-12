{
  "action": {
    "Call": [
      {
        "PutNodeRef": [
          {
            "arg_idx": 0,
            "func_name": "of_node_put"
          }
        ]
      }
    ],
    "Exit": [],
    "Ret": [
      {
        "GetNodeRef": [
          "of_node_get"
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
      "GetNodeRef"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "of_node_refcount_leak",
    "key_actions": [
      "GetNodeRef",
      "Exit"
    ],
    "name": "resource-leak"
  },
  "context": {
    "end_action": [
      "PutNodeRef"
    ],
    "start_action": [
      "GetNodeRef"
    ]
  },
  "event_metadata": {
    "Exit": {
      "role": "sink"
    },
    "GetNodeRef": {
      "role": "source"
    },
    "PutNodeRef": {
      "role": "release"
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
    "GetNodeRef",
    "PutNodeRef",
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
      "action": "PutNodeRef",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "GetNodeRef",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "GetNodeRef",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "PutNodeRef",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "GetNodeRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "PutNodeRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "GetNodeRef",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "PutNodeRef",
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