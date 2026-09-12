{
  "action": {
    "Call": [
      {
        "CallFaultin": [
          {
            "arg_idx": 4,
            "func_name": "__kvm_faultin_pfn"
          }
        ]
      },
      {
        "CallRelease": [
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
      "CallFaultin"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallFaultin"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "kvm_s390_faultin_gfn_faultin_page_leak",
    "key_actions": [
      "CallFaultin",
      "ErrExit"
    ],
    "name": "error-path resource-leak of faulted page"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "CallFaultin"
    ]
  },
  "event_metadata": {
    "CallFaultin": {
      "role": "source"
    },
    "CallRelease": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Faulted",
      "merge_state": "Faulted"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallFaultin",
    "CallRelease",
    "ErrExit"
  ],
  "state": [
    "Faulted",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Faulted": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallRelease",
      "curr_state": "Faulted",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Faulted",
      "next_state": "Leak"
    },
    {
      "action": "CallFaultin",
      "curr_state": "Released",
      "next_state": "Faulted"
    },
    {
      "action": "CallFaultin",
      "curr_state": "Faulted",
      "next_state": "Faulted"
    },
    {
      "action": "CallRelease",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallFaultin",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRelease",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallFaultin",
      "curr_state": "Any",
      "next_state": "Faulted"
    },
    {
      "action": "CallRelease",
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