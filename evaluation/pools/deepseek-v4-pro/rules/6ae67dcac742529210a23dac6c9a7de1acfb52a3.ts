{
  "action": {
    "Call": [
      {
        "AcquirePage": [
          {
            "arg_idx": 4,
            "func_name": "__kvm_faultin_pfn"
          }
        ]
      },
      {
        "ReleasePage": [
          {
            "arg_idx": 1,
            "func_name": "kvm_release_faultin_page"
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
      "AcquirePage"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AcquirePage"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "kvm_s390_faultin_gfn_page_leak",
    "key_actions": [
      "AcquirePage",
      "ErrExit"
    ],
    "name": "resource-leak in kvm_s390_faultin_gfn"
  },
  "context": {
    "end_action": [
      "ReleasePage"
    ],
    "start_action": [
      "AcquirePage"
    ]
  },
  "event_metadata": {
    "AcquirePage": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleasePage": {
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
    "AcquirePage",
    "ReleasePage",
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
      "action": "ReleasePage",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AcquirePage",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquirePage",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "ReleasePage",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquirePage",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleasePage",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquirePage",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "ReleasePage",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "ErrExit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}