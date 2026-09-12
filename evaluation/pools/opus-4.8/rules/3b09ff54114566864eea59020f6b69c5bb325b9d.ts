{
  "action": {
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
        "CallLookup": [
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
      "CallLookup"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallLookup"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "qrtr_send_resume_tx_node_refcount_leak",
    "key_actions": [
      "CallLookup",
      "ErrExit"
    ],
    "name": "error-path node refcount leak"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "CallLookup"
    ]
  },
  "event_metadata": {
    "CallLookup": {
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
    "CallLookup",
    "CallRelease",
    "ErrExit"
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
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "CallLookup",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "CallLookup",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallRelease",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallLookup",
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
      "action": "CallLookup",
      "curr_state": "Any",
      "next_state": "Acquired"
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