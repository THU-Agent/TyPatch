{
  "action": {
    "Call": [
      {
        "CallKobjInit": [
          {
            "arg_idx": 0,
            "func_name": "kobject_init_and_add"
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
      },
      {
        "CallKobjPut": [
          {
            "arg_idx": 0,
            "func_name": "kobject_put"
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
      "CallKobjInit"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "mlx4_add_port_kobject_refcount_leak",
    "key_actions": [
      "CallKobjInit",
      "CallFree"
    ],
    "name": "use-after-kobject-init direct free"
  },
  "context": {
    "end_action": [
      "CallFree"
    ],
    "start_action": [
      "CallKobjInit"
    ]
  },
  "event_metadata": {
    "CallFree": {
      "role": "sink"
    },
    "CallKobjInit": {
      "role": "source"
    },
    "CallKobjPut": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "KobjManaged",
      "merge_state": "KobjManaged"
    }
  ],
  "sliced_action": [
    "CallKobjInit",
    "CallFree",
    "CallKobjPut"
  ],
  "state": [
    "Untracked",
    "KobjManaged",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "KobjManaged": "danger",
    "Leak": "bug"
  },
  "transition": [
    {
      "action": "CallKobjInit",
      "curr_state": "Untracked",
      "next_state": "KobjManaged"
    },
    {
      "action": "CallFree",
      "curr_state": "KobjManaged",
      "next_state": "Leak"
    },
    {
      "action": "CallKobjPut",
      "curr_state": "KobjManaged",
      "next_state": "Untracked"
    },
    {
      "action": "CallFree",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallKobjPut",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallKobjInit",
      "curr_state": "KobjManaged",
      "next_state": "KobjManaged"
    },
    {
      "action": "CallKobjInit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallFree",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallKobjPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    }
  ]
}