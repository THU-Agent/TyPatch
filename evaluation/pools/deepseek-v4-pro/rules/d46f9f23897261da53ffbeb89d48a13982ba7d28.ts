{
  "action": {
    "Call": [
      {
        "FreeTplgFiles": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "AllocTplgFiles": [
          "kcalloc"
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
      "AllocTplgFiles"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AllocTplgFiles"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "snd_sof_load_topology-topology-dummy-leak",
    "key_actions": [
      "AllocTplgFiles",
      "ErrExit"
    ],
    "name": "resource-leak"
  },
  "context": {
    "end_action": [
      "FreeTplgFiles"
    ],
    "start_action": [
      "AllocTplgFiles"
    ]
  },
  "event_metadata": {
    "AllocTplgFiles": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "FreeTplgFiles": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Allocated",
      "merge_state": "Allocated"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "AllocTplgFiles",
    "FreeTplgFiles",
    "ErrExit"
  ],
  "state": [
    "Allocated",
    "Freed",
    "Leak"
  ],
  "state_roles": {
    "Allocated": "danger",
    "Freed": "safe",
    "Init": "init",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "FreeTplgFiles",
      "curr_state": "Allocated",
      "next_state": "Freed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Allocated",
      "next_state": "Leak"
    },
    {
      "action": "AllocTplgFiles",
      "curr_state": "Freed",
      "next_state": "Allocated"
    },
    {
      "action": "AllocTplgFiles",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "FreeTplgFiles",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "ErrExit",
      "curr_state": "Freed",
      "next_state": "Freed"
    },
    {
      "action": "AllocTplgFiles",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "FreeTplgFiles",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocTplgFiles",
      "curr_state": "Any",
      "next_state": "Allocated"
    },
    {
      "action": "FreeTplgFiles",
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