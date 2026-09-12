{
  "action": {
    "Call": [
      {
        "CallPublish": [
          {
            "arg_idx": 0,
            "func_name": "fd_publish"
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
      "CallPublish"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "media_request_alloc_uaf_publish_before_use",
    "key_actions": [
      "CallPublish",
      "Use"
    ],
    "name": "use-after-free via publish before use"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallPublish"
    ]
  },
  "event_metadata": {
    "CallPublish": {
      "role": "publish"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Published",
      "merge_state": "Published"
    }
  ],
  "sliced_action": [
    "CallPublish",
    "Use"
  ],
  "state": [
    "Untracked",
    "Published",
    "UAF"
  ],
  "state_roles": {
    "Init": "init",
    "Published": "danger",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "CallPublish",
      "curr_state": "Untracked",
      "next_state": "Published"
    },
    {
      "action": "Use",
      "curr_state": "Published",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallPublish",
      "curr_state": "Published",
      "next_state": "Published"
    },
    {
      "action": "CallPublish",
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