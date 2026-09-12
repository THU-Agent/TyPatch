{
  "action": {
    "Call": [
      {
        "AcquireSpinLock": [
          {
            "arg_idx": 0,
            "func_name": "spin_lock"
          }
        ]
      },
      {
        "ReleaseSpinLock": [
          {
            "arg_idx": 0,
            "func_name": "spin_unlock"
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
      "AcquireSpinLock"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AcquireSpinLock"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "staging-vme-bridge-ca91cx42-missing-spin-unlock",
    "key_actions": [
      "AcquireSpinLock",
      "ErrExit"
    ],
    "name": "missing-spin-unlock-on-error"
  },
  "context": {
    "end_action": [
      "ReleaseSpinLock"
    ],
    "start_action": [
      "AcquireSpinLock"
    ]
  },
  "event_metadata": {
    "AcquireSpinLock": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseSpinLock": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Acquired",
      "merge_state": "Acquired"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "AcquireSpinLock",
    "ReleaseSpinLock",
    "ErrExit"
  ],
  "state": [
    "Acquired",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Acquired": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseSpinLock",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "AcquireSpinLock",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquireSpinLock",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ReleaseSpinLock",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireSpinLock",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseSpinLock",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireSpinLock",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "ErrExit",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "ReleaseSpinLock",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}