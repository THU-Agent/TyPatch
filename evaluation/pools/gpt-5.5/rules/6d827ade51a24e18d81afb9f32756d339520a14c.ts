{
  "action": {
    "Call": [
      {
        "CallPartialCleanup": [
          {
            "arg_idx": 0,
            "func_name": "meson_allocate_chanlist"
          }
        ]
      },
      {
        "CallCleanup": [
          {
            "arg_idx": 0,
            "func_name": "meson_free_chanlist"
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
    "min_report_unique_actions": 2,
    "path_sensitive_candidate_generation": true,
    "path_sensitive_verify": true,
    "report_key_actions_distinct_locations": true,
    "source_actions": [
      "CallPartialCleanup"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DoubleCleanup",
    "key": "crypto_amlogic_probe_double_chanlist_cleanup",
    "key_actions": [
      "CallPartialCleanup",
      "CallCleanup"
    ],
    "name": "double cleanup after partial allocation failure"
  },
  "context": {
    "end_action": [
      "CallCleanup"
    ],
    "start_action": [
      "CallPartialCleanup"
    ]
  },
  "event_metadata": {
    "CallCleanup": {
      "role": "sink"
    },
    "CallPartialCleanup": {
      "role": "source"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Cleaned",
      "merge_state": "Cleaned"
    }
  ],
  "sliced_action": [
    "CallPartialCleanup",
    "CallCleanup"
  ],
  "state": [
    "Untracked",
    "Cleaned",
    "DoubleCleanup"
  ],
  "state_roles": {
    "Cleaned": "danger",
    "DoubleCleanup": "bug",
    "Init": "init"
  },
  "transition": [
    {
      "action": "CallPartialCleanup",
      "curr_state": "Untracked",
      "next_state": "Cleaned"
    },
    {
      "action": "CallCleanup",
      "curr_state": "Cleaned",
      "next_state": "DoubleCleanup"
    },
    {
      "action": "CallCleanup",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallPartialCleanup",
      "curr_state": "Cleaned",
      "next_state": "Cleaned"
    },
    {
      "action": "CallPartialCleanup",
      "curr_state": "DoubleCleanup",
      "next_state": "DoubleCleanup"
    },
    {
      "action": "CallCleanup",
      "curr_state": "DoubleCleanup",
      "next_state": "DoubleCleanup"
    }
  ]
}