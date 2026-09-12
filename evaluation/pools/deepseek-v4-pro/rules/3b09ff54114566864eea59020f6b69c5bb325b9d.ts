{
  "action": {
    "BrNonNull": [],
    "Call": [
      {
        "CallRelease": [
          {
            "arg_idx": 0,
            "func_name": "qrtr_node_release"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "GetNodeRet": [
          "qrtr_node_lookup"
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
      "GetNodeRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "GetNodeRet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "net:qrtr_send_resume_tx_node_ref_leak",
    "key_actions": [
      "GetNodeRet",
      "BrNonNull",
      "ErrExit"
    ],
    "name": "missing qrtr_node_release on error path"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "GetNodeRet"
    ]
  },
  "event_metadata": {
    "BrNonNull": {
      "role": "guard"
    },
    "CallRelease": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    },
    "GetNodeRet": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "MaybeNull",
      "merge_state": "MaybeNull"
    },
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
    "GetNodeRet",
    "BrNonNull",
    "CallRelease",
    "ErrExit"
  ],
  "state": [
    "MaybeNull",
    "Acquired",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Acquired": "danger",
    "Init": "init",
    "Leak": "bug",
    "MaybeNull": "safe",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "BrNonNull",
      "curr_state": "MaybeNull",
      "next_state": "Acquired"
    },
    {
      "action": "ErrExit",
      "curr_state": "MaybeNull",
      "next_state": "Any"
    },
    {
      "action": "CallRelease",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Any"
    },
    {
      "action": "GetNodeRet",
      "curr_state": "Released",
      "next_state": "MaybeNull"
    },
    {
      "action": "CallRelease",
      "curr_state": "MaybeNull",
      "next_state": "MaybeNull"
    },
    {
      "action": "GetNodeRet",
      "curr_state": "MaybeNull",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "GetNodeRet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallRelease",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRelease",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "GetNodeRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "GetNodeRet",
      "curr_state": "Any",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallRelease",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "ErrExit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}