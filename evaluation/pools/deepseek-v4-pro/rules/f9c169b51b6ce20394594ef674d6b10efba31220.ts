{
  "action": {
    "Call": [
      {
        "CallReleaseCfile": [
          {
            "arg_idx": 8,
            "func_name": "smb2_compound_op"
          }
        ]
      },
      {
        "CallGetCfile": [
          {
            "arg_idx": 3,
            "func_name": "cifs_get_writable_path"
          }
        ]
      }
    ],
    "Use": []
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
    "source_actions": [
      "CallReleaseCfile"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "smb2_set_path_size_use_after_free_cfile",
    "key_actions": [
      "CallReleaseCfile",
      "Use"
    ],
    "name": "use-after-free of cfile in smb2_set_path_size"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallReleaseCfile"
    ]
  },
  "event_metadata": {
    "CallGetCfile": {
      "role": "guard"
    },
    "CallReleaseCfile": {
      "role": "source"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallReleaseCfile",
    "CallGetCfile",
    "Use"
  ],
  "state": [
    "Released",
    "UAF"
  ],
  "state_roles": {
    "Init": "init",
    "Released": "danger",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "CallGetCfile",
      "curr_state": "Released",
      "next_state": "Any"
    },
    {
      "action": "Use",
      "curr_state": "Released",
      "next_state": "UAF"
    },
    {
      "action": "CallReleaseCfile",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallReleaseCfile",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallGetCfile",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallReleaseCfile",
      "curr_state": "Any",
      "next_state": "Released"
    },
    {
      "action": "CallGetCfile",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "Use",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}