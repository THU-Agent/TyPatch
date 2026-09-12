{
  "action": {
    "Call": [
      {
        "CallJobPut": [
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
        "AllocJob": [
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
      "AllocJob"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AllocJob"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "tegra_se_host1x_submit_refcount_leak",
    "key_actions": [
      "AllocJob",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallJobPut"
    ],
    "start_action": [
      "AllocJob"
    ]
  },
  "event_metadata": {
    "AllocJob": {
      "role": "source"
    },
    "CallJobPut": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
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
    "AllocJob",
    "CallJobPut",
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
      "action": "CallJobPut",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AllocJob",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AllocJob",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallJobPut",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AllocJob",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallJobPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocJob",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallJobPut",
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