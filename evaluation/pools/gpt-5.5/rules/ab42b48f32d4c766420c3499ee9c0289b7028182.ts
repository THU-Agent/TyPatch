{
  "action": {
    "BrNonNull": [],
    "Ref": [],
    "Ret": [
      {
        "AllocRet": [
          "dma_alloc_coherent"
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "guard_aware_merge": true,
    "initial_state": "Init",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "NPD",
    "key": "staging_comedi_gsc_hpdi_dma_alloc_coherent_npd",
    "key_actions": [
      "AllocRet",
      "Ref"
    ],
    "name": "unchecked dma_alloc_coherent return dereference"
  },
  "context": {
    "end_action": [
      "BrNonNull"
    ],
    "start_action": [
      "AllocRet"
    ]
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "BrNonNull": {
      "role": "guard"
    },
    "Ref": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "AllocatedMaybeNull",
      "merge_state": "AllocatedMaybeNull"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "NonNull",
      "merge_state": "NonNull"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "BrNonNull",
    "Ref"
  ],
  "state": [
    "AllocatedMaybeNull",
    "NonNull",
    "NPD"
  ],
  "state_roles": {
    "AllocatedMaybeNull": "danger",
    "Init": "init",
    "NPD": "bug",
    "NonNull": "safe"
  },
  "transition": [
    {
      "action": "BrNonNull",
      "curr_state": "AllocatedMaybeNull",
      "next_state": "NonNull"
    },
    {
      "action": "Ref",
      "curr_state": "AllocatedMaybeNull",
      "next_state": "NPD"
    },
    {
      "action": "AllocRet",
      "curr_state": "NonNull",
      "next_state": "AllocatedMaybeNull"
    },
    {
      "action": "AllocRet",
      "curr_state": "AllocatedMaybeNull",
      "next_state": "AllocatedMaybeNull"
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
      "action": "AllocRet",
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
    },
    {
      "action": "AllocRet",
      "curr_state": "Any",
      "next_state": "AllocatedMaybeNull"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "Ref",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}