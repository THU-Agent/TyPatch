{
  "action": {
    "Call": [
      {
        "OutParamInit": [
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
      "OutParamInit"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "OutParamInit"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "kvm_s390_faultin_gfn_page_ref_leak",
    "key_actions": [
      "OutParamInit",
      "ErrExit"
    ],
    "name": "error-path reference leak"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "OutParamInit"
    ]
  },
  "event_metadata": {
    "CallRelease": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    },
    "OutParamInit": {
      "role": "acquire"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "PageHeld",
      "merge_state": "PageHeld"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "OutParamInit",
    "CallRelease",
    "ErrExit"
  ],
  "state": [
    "PageHeld",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "PageHeld": "danger",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallRelease",
      "curr_state": "PageHeld",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "PageHeld",
      "next_state": "Leak"
    },
    {
      "action": "OutParamInit",
      "curr_state": "Released",
      "next_state": "PageHeld"
    },
    {
      "action": "OutParamInit",
      "curr_state": "PageHeld",
      "next_state": "PageHeld"
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
      "action": "OutParamInit",
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
      "action": "OutParamInit",
      "curr_state": "Any",
      "next_state": "PageHeld"
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