{
  "action": {
    "Call": [
      {
        "OutParamInit": [
          {
            "arg_idx": 3,
            "func_name": "cifs_get_writable_path"
          }
        ]
      },
      {
        "OwnerReleaseCfile": [
          {
            "arg_idx": 8,
            "func_name": "smb2_compound_op"
          }
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "OwnerReleaseCfile"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoublePut",
    "key": "smb2_set_path_size_cfile_double_put",
    "key_actions": [
      "OwnerReleaseCfile",
      "OwnerReleaseCfile"
    ],
    "name": "double ownership release"
  },
  "context": {
    "end_action": [
      "OwnerReleaseCfile"
    ],
    "start_action": [
      "OwnerReleaseCfile"
    ]
  },
  "event_metadata": {
    "OutParamInit": {
      "role": "init"
    },
    "OwnerReleaseCfile": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Referenced",
      "merge_state": "Referenced"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Released",
      "merge_state": "Released"
    },
    {
      "curr_state1": "Referenced",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "OutParamInit",
    "OwnerReleaseCfile"
  ],
  "state": [
    "Untracked",
    "Referenced",
    "Released",
    "DoublePut"
  ],
  "state_roles": {
    "DoublePut": "bug",
    "Init": "init",
    "Referenced": "safe",
    "Released": "danger"
  },
  "transition": [
    {
      "action": "OutParamInit",
      "curr_state": "Untracked",
      "next_state": "Referenced"
    },
    {
      "action": "OwnerReleaseCfile",
      "curr_state": "Untracked",
      "next_state": "Released"
    },
    {
      "action": "OwnerReleaseCfile",
      "curr_state": "Referenced",
      "next_state": "Released"
    },
    {
      "action": "OutParamInit",
      "curr_state": "Released",
      "next_state": "Referenced"
    },
    {
      "action": "OwnerReleaseCfile",
      "curr_state": "Released",
      "next_state": "DoublePut"
    },
    {
      "action": "OutParamInit",
      "curr_state": "Referenced",
      "next_state": "Referenced"
    },
    {
      "action": "OutParamInit",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    },
    {
      "action": "OwnerReleaseCfile",
      "curr_state": "DoublePut",
      "next_state": "DoublePut"
    }
  ]
}