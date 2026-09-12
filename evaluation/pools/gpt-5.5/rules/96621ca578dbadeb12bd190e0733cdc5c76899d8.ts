{
  "action": {
    "BrNonNull": [],
    "Call": [
      {
        "CallMaybeNullArg": [
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
      "CallMaybeNullArg"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NPD",
    "key": "drm_amdkfd_svm_range_map_to_gpu_bo_adev_null_deref",
    "key_actions": [
      "CallMaybeNullArg",
      "Ref"
    ],
    "name": "nullable bo_adev argument dereference"
  },
  "context": {
    "end_action": [
      "BrNonNull"
    ],
    "start_action": [
      "CallMaybeNullArg"
    ]
  },
  "event_metadata": {
    "BrNonNull": {
      "role": "guard"
    },
    "CallMaybeNullArg": {
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
    "CallMaybeNullArg",
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
      "action": "CallMaybeNullArg",
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
      "action": "CallMaybeNullArg",
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
      "action": "CallMaybeNullArg",
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
      "action": "CallMaybeNullArg",
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