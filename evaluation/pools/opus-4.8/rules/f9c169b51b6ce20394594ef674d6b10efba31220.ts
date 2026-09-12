{
  "action": {
    "Call": [
      {
        "CallGetPath": [
          {
            "arg_idx": 3,
            "func_name": "cifs_get_writable_path"
          }
        ]
      },
      {
        "CallCompound": [
          {
            "arg_idx": 8,
            "func_name": "smb2_compound_op"
          }
        ]
      }
    ],
    "Use": []
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "CallCompound"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "smb2_set_path_size_double_put_cfile",
    "key_actions": [
      "CallCompound",
      "Use"
    ],
    "name": "use-after-free / double put of cfile"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallCompound"
    ]
  },
  "event_metadata": {
    "CallCompound": {
      "role": "source"
    },
    "CallGetPath": {
      "role": "init"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallGetPath",
    "CallCompound",
    "Use"
  ],
  "state": [
    "Untracked",
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
      "action": "CallCompound",
      "curr_state": "Untracked",
      "next_state": "Released"
    },
    {
      "action": "CallGetPath",
      "curr_state": "Released",
      "next_state": "Untracked"
    },
    {
      "action": "CallCompound",
      "curr_state": "Released",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "Released",
      "next_state": "UAF"
    },
    {
      "action": "CallGetPath",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallGetPath",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "CallCompound",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    }
  ]
}