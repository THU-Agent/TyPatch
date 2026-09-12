{
  "action": {
    "BrNonNull": [],
    "Call": [
      {
        "CallBoAdev": [
          {
            "arg_idx": 6,
            "func_name": "svm_range_map_to_gpu"
          }
        ]
      }
    ],
    "Ref": []
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
      "CallBoAdev"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NPD",
    "key": "kfd_svm_nullable_bo_adev_deref",
    "key_actions": [
      "CallBoAdev",
      "Ref"
    ],
    "name": "nullable bo_adev dereference in svm_range_map_to_gpu"
  },
  "context": {
    "end_action": [
      "BrNonNull"
    ],
    "start_action": [
      "CallBoAdev"
    ]
  },
  "event_metadata": {
    "BrNonNull": {
      "role": "guard"
    },
    "CallBoAdev": {
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
      "curr_state2": "NonNull",
      "merge_state": "NonNull"
    }
  ],
  "sliced_action": [
    "CallBoAdev",
    "BrNonNull",
    "Ref"
  ],
  "state": [
    "Untracked",
    "MaybeNull",
    "NonNull",
    "NPD"
  ],
  "state_roles": {
    "Init": "init",
    "MaybeNull": "danger",
    "NPD": "bug",
    "NonNull": "safe"
  },
  "transition": [
    {
      "action": "CallBoAdev",
      "curr_state": "Untracked",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "MaybeNull",
      "next_state": "NonNull"
    },
    {
      "action": "Ref",
      "curr_state": "MaybeNull",
      "next_state": "NPD"
    },
    {
      "action": "CallBoAdev",
      "curr_state": "NonNull",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Ref",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallBoAdev",
      "curr_state": "MaybeNull",
      "next_state": "MaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "NonNull",
      "next_state": "NonNull"
    },
    {
      "action": "Ref",
      "curr_state": "NonNull",
      "next_state": "NonNull"
    },
    {
      "action": "CallBoAdev",
      "curr_state": "NPD",
      "next_state": "NPD"
    },
    {
      "action": "BrNonNull",
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