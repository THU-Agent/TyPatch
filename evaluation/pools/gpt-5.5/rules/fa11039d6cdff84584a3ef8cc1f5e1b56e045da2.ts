{
  "action": {
    "Call": [
      {
        "CallRelease": [
          {
            "arg_idx": 0,
            "func_name": "of_node_put"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "OptionalResourceRet": [
          "of_find_node_by_name"
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
    "key": "scmi_regulator_of_node_refcount_leak",
    "key_actions": [
      "OptionalResourceRet",
      "ErrExit"
    ],
    "name": "of_node reference leak on error path"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "OptionalResourceRet"
    ]
  },
  "event_metadata": {
    "CallRelease": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    },
    "OptionalResourceRet": {
      "role": "acquire"
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
    "OptionalResourceRet",
    "CallRelease",
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
      "action": "CallRelease",
      "curr_state": "Held",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Held",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Released",
      "next_state": "Held"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Held",
      "next_state": "Held"
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
      "action": "OptionalResourceRet",
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
      "action": "OptionalResourceRet",
      "curr_state": "Any",
      "next_state": "Held"
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