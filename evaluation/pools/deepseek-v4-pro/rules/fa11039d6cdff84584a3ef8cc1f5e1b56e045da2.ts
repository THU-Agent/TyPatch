{
  "action": {
    "Call": [
      {
        "AcquireNode": [
          {
            "arg_idx": 0,
            "func_name": "of_find_node_by_name"
          }
        ]
      },
      {
        "ReleaseNode": [
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
      "AcquireNode"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AcquireNode"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "scmi_of_node_leak",
    "key_actions": [
      "AcquireNode",
      "ErrExit"
    ],
    "name": "of_node refcount leak in scmi_regulator_probe"
  },
  "context": {
    "end_action": [
      "ReleaseNode"
    ],
    "start_action": [
      "AcquireNode"
    ]
  },
  "event_metadata": {
    "AcquireNode": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseNode": {
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
    "AcquireNode",
    "ReleaseNode",
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
      "action": "ReleaseNode",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AcquireNode",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquireNode",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseNode",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireNode",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseNode",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireNode",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseNode",
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