{
  "action": {
    "Call": [
      {
        "CallAcquireRef": [
          {
            "arg_idx": 0,
            "func_name": "refcount_inc"
          }
        ]
      }
    ],
    "ErrExit": []
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
    "report_key_actions_same_function": true,
    "source_actions": [
      "CallAcquireRef"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallAcquireRef"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "devlink-parent-ref-leak-devl_rate_node_create",
    "key_actions": [
      "CallAcquireRef",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "ErrExit"
    ],
    "start_action": [
      "CallAcquireRef"
    ]
  },
  "event_metadata": {
    "CallAcquireRef": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "RefHeld",
      "merge_state": "RefHeld"
    }
  ],
  "sliced_action": [
    "CallAcquireRef",
    "ErrExit"
  ],
  "state": [
    "RefHeld",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "RefHeld": "danger"
  },
  "transition": [
    {
      "action": "ErrExit",
      "curr_state": "RefHeld",
      "next_state": "Leak"
    },
    {
      "action": "CallAcquireRef",
      "curr_state": "RefHeld",
      "next_state": "RefHeld"
    },
    {
      "action": "CallAcquireRef",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallAcquireRef",
      "curr_state": "Any",
      "next_state": "RefHeld"
    },
    {
      "action": "ErrExit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}