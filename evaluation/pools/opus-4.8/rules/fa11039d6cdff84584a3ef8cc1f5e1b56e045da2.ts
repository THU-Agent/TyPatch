{
  "action": {
    "Call": [
      {
        "CallGetNode": [
          {
            "arg_idx": 0,
            "func_name": "of_find_node_by_name"
          }
        ]
      },
      {
        "CallPutNode": [
          {
            "arg_idx": 0,
            "func_name": "of_node_put"
          }
        ]
      }
    ],
    "ErrExit": []
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
      "CallGetNode"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallGetNode"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "scmi_regulator_probe_of_node_refcount_leak",
    "key_actions": [
      "CallGetNode",
      "ErrExit"
    ],
    "name": "error-path of_node refcount leak"
  },
  "context": {
    "end_action": [
      "CallPutNode"
    ],
    "start_action": [
      "CallGetNode"
    ]
  },
  "event_metadata": {
    "CallGetNode": {
      "role": "source"
    },
    "CallPutNode": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Held",
      "merge_state": "Held"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallGetNode",
    "CallPutNode",
    "ErrExit"
  ],
  "state": [
    "Held",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Held": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallPutNode",
      "curr_state": "Held",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Held",
      "next_state": "Leak"
    },
    {
      "action": "CallGetNode",
      "curr_state": "Released",
      "next_state": "Held"
    },
    {
      "action": "CallGetNode",
      "curr_state": "Held",
      "next_state": "Held"
    },
    {
      "action": "CallPutNode",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallGetNode",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPutNode",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGetNode",
      "curr_state": "Any",
      "next_state": "Held"
    },
    {
      "action": "CallPutNode",
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