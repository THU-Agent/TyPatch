{
  "action": {
    "BrNull": [],
    "Ref": [],
    "Ret": [
      {
        "MaybeNullRet": [
          "ife_encode"
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "guard_aware_merge": true,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "MaybeNullRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_condition_builder_branches": true,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NPD",
    "key": "NULL-deref-ife_encode",
    "key_actions": [
      "MaybeNullRet",
      "Ref"
    ],
    "name": "NULL dereference after ife_encode()"
  },
  "context": {
    "end_action": [
      "Ref"
    ],
    "start_action": [
      "MaybeNullRet"
    ]
  },
  "event_metadata": {
    "BrNull": {
      "role": "guard"
    },
    "MaybeNullRet": {
      "role": "source"
    },
    "Ref": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "MaybeNull",
      "merge_state": "MaybeNull"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Safe",
      "merge_state": "Safe"
    },
    {
      "curr_state1": "MaybeNull",
      "curr_state2": "Safe",
      "merge_state": "MaybeNull"
    }
  ],
  "sliced_action": [
    "MaybeNullRet",
    "BrNull",
    "Ref"
  ],
  "state": [
    "Untracked",
    "MaybeNull",
    "Safe",
    "NPD"
  ],
  "state_roles": {
    "Init": "init",
    "MaybeNull": "danger",
    "NPD": "bug",
    "Safe": "safe"
  },
  "transition": [
    {
      "action": "MaybeNullRet",
      "curr_state": "Untracked",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNull",
      "curr_state": "MaybeNull",
      "next_state": "Safe"
    },
    {
      "action": "Ref",
      "curr_state": "MaybeNull",
      "next_state": "NPD"
    },
    {
      "action": "MaybeNullRet",
      "curr_state": "Safe",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Ref",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "MaybeNullRet",
      "curr_state": "MaybeNull",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNull",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "Ref",
      "curr_state": "Safe",
      "next_state": "Safe"
    },
    {
      "action": "MaybeNullRet",
      "curr_state": "NPD",
      "next_state": "NPD"
    },
    {
      "action": "BrNull",
      "curr_state": "NPD",
      "next_state": "NPD"
    },
    {
      "action": "Ref",
      "curr_state": "NPD",
      "next_state": "NPD"
    }
  ]
}