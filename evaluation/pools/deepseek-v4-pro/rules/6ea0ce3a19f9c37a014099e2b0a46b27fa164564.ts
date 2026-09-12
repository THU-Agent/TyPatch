{
  "action": {
    "Call": [
      {
        "CallPut": [
          {
            "arg_idx": 0,
            "func_name": "host1x_job_put"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "AllocRet": [
          "host1x_job_alloc"
        ]
      }
    ]
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
      "AllocRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "tegra-se-host1x-submit-refcount-leak",
    "key_actions": [
      "AllocRet",
      "ErrExit"
    ],
    "name": "host1x job refcount leak"
  },
  "context": {
    "end_action": [],
    "start_action": []
  },
  "event_metadata": {
    "AllocRet": {
      "role": "source"
    },
    "CallPut": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Allocated",
      "merge_state": "Allocated"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "AllocRet",
    "CallPut",
    "ErrExit"
  ],
  "state": [
    "Allocated",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Allocated": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallPut",
      "curr_state": "Allocated",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Allocated",
      "next_state": "Leak"
    },
    {
      "action": "AllocRet",
      "curr_state": "Released",
      "next_state": "Allocated"
    },
    {
      "action": "AllocRet",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "CallPut",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AllocRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocRet",
      "curr_state": "Any",
      "next_state": "Allocated"
    },
    {
      "action": "CallPut",
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