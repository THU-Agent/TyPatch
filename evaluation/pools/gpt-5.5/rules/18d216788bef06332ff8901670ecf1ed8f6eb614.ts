{
  "action": {
    "Call": [
      {
        "OwnerRelease": [
          {
            "arg_idx": 0,
            "field_path": "rq_procinfo",
            "func_name": "svc_release_rqst"
          }
        ]
      }
    ],
    "StoreInit": [],
    "StoreNull": []
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
      "OwnerRelease"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleRelease",
    "key": "sunrpc_rq_procinfo_stale_release_double_free",
    "key_actions": [
      "OwnerRelease",
      "OwnerRelease"
    ],
    "name": "stale rq_procinfo release callback double invocation"
  },
  "context": {
    "end_action": [
      "OwnerRelease"
    ],
    "start_action": [
      "OwnerRelease"
    ]
  },
  "event_metadata": {
    "OwnerRelease": {
      "role": "release"
    },
    "StoreInit": {
      "role": "init"
    },
    "StoreNull": {
      "role": "guard"
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
    "OwnerRelease",
    "StoreNull",
    "StoreInit"
  ],
  "state": [
    "Untracked",
    "Released",
    "DoubleRelease"
  ],
  "state_roles": {
    "DoubleRelease": "bug",
    "Init": "init",
    "Released": "danger"
  },
  "transition": [
    {
      "action": "OwnerRelease",
      "curr_state": "Untracked",
      "next_state": "Released"
    },
    {
      "action": "OwnerRelease",
      "curr_state": "Released",
      "next_state": "DoubleRelease"
    },
    {
      "action": "StoreNull",
      "curr_state": "Released",
      "next_state": "Untracked"
    },
    {
      "action": "StoreInit",
      "curr_state": "Released",
      "next_state": "Untracked"
    },
    {
      "action": "StoreNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "StoreInit",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "OwnerRelease",
      "curr_state": "DoubleRelease",
      "next_state": "DoubleRelease"
    },
    {
      "action": "StoreNull",
      "curr_state": "DoubleRelease",
      "next_state": "DoubleRelease"
    },
    {
      "action": "StoreInit",
      "curr_state": "DoubleRelease",
      "next_state": "DoubleRelease"
    }
  ]
}