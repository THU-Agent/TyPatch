{
  "action": {
    "Call": [
      {
        "OwnerRelease": [
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
        "OptionalResourceRet": [
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
      "OptionalResourceRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "OptionalResourceRet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "net_qrtr_node_refcount_leak_ctrl_packet_alloc_failure",
    "key_actions": [
      "OptionalResourceRet",
      "ErrExit"
    ],
    "name": "error-path node reference leak"
  },
  "context": {
    "end_action": [
      "OwnerRelease"
    ],
    "start_action": [
      "OptionalResourceRet"
    ]
  },
  "event_metadata": {
    "Exit": {
      "role": "sink"
    },
    "OptionalResourceRet": {
      "role": "source"
    },
    "OwnerRelease": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Referenced",
      "merge_state": "Referenced"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "OptionalResourceRet",
    "OwnerRelease",
    "ErrExit"
  ],
  "state": [
    "Referenced",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Referenced": "danger",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "OwnerRelease",
      "curr_state": "Referenced",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Referenced",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Released",
      "next_state": "Referenced"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Referenced",
      "next_state": "Referenced"
    },
    {
      "action": "OwnerRelease",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "OwnerRelease",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Any",
      "next_state": "Referenced"
    },
    {
      "action": "OwnerRelease",
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