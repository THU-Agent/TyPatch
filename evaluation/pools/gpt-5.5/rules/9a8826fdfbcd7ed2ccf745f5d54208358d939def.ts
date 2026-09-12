{
  "action": {
    "Call": [
      {
        "CallKobjectInit": [
          {
            "arg_idx": 0,
            "func_name": "kobject_init_and_add"
          }
        ]
      },
      {
        "CallKobjectPut": [
          {
            "arg_idx": 0,
            "func_name": "kobject_put"
          }
        ]
      },
      {
        "CallFree": [
          {
            "arg_idx": 0,
            "func_name": "kfree"
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
    "path_sensitive_verify": true,
    "source_actions": [
      "CallKobjectInit"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "DirectFreeAfterInit",
    "key": "mlx4-add-port-kobject-direct-free",
    "key_actions": [
      "CallKobjectInit",
      "CallFree"
    ],
    "name": "kobject lifetime protocol violation"
  },
  "context": {
    "end_action": [
      "CallKobjectPut",
      "CallFree"
    ],
    "start_action": [
      "CallKobjectInit"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "sink"
    },
    "CallKobjectInit": {
      "role": "source"
    },
    "CallKobjectPut": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "KobjectManaged",
      "merge_state": "KobjectManaged"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallKobjectInit",
    "CallKobjectPut",
    "CallFree"
  ],
  "state": [
    "Untracked",
    "KobjectManaged",
    "Released",
    "DirectFreeAfterInit"
  ],
  "state_roles": {
    "DirectFreeAfterInit": "bug",
    "Init": "init",
    "KobjectManaged": "danger",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallKobjectInit",
      "curr_state": "Untracked",
      "next_state": "KobjectManaged"
    },
    {
      "action": "CallKobjectPut",
      "curr_state": "KobjectManaged",
      "next_state": "Released"
    },
    {
      "action": "CallFree",
      "curr_state": "KobjectManaged",
      "next_state": "DirectFreeAfterInit"
    },
    {
      "action": "CallKobjectInit",
      "curr_state": "Released",
      "next_state": "KobjectManaged"
    },
    {
      "action": "CallKobjectPut",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallKobjectInit",
      "curr_state": "KobjectManaged",
      "next_state": "KobjectManaged"
    },
    {
      "action": "CallKobjectPut",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallFree",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallKobjectInit",
      "curr_state": "DirectFreeAfterInit",
      "next_state": "DirectFreeAfterInit"
    },
    {
      "action": "CallKobjectPut",
      "curr_state": "DirectFreeAfterInit",
      "next_state": "DirectFreeAfterInit"
    },
    {
      "action": "CallFree",
      "curr_state": "DirectFreeAfterInit",
      "next_state": "DirectFreeAfterInit"
    }
  ]
}