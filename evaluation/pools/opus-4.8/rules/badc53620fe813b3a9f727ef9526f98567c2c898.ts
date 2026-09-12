{
  "action": {
    "Call": [
      {
        "CallPutDevice": [
          {
            "arg_idx": 0,
            "field_path": "ref",
            "func_name": "kref_put"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "CallGetDevice": [
          "nvmet_rdma_find_get_device"
        ]
      }
    ]
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "disable_slice": true,
    "initial_state": "Init",
    "intra_procedural_cfg": true,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "report_key_actions_same_function": true,
    "source_actions": [
      "CallGetDevice"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallGetDevice"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "nvmet_rdma_queue_connect_ndev_refcount_leak",
    "key_actions": [
      "CallGetDevice",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallPutDevice"
    ],
    "start_action": [
      "CallGetDevice"
    ]
  },
  "event_metadata": {
    "CallGetDevice": {
      "role": "source"
    },
    "CallPutDevice": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Held",
      "merge_state": "Held"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallGetDevice",
    "CallPutDevice",
    "ErrExit"
  ],
  "state": [
    "Held",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Held": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallPutDevice",
      "curr_state": "Held",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Held",
      "next_state": "Leak"
    },
    {
      "action": "CallGetDevice",
      "curr_state": "Released",
      "next_state": "Held"
    },
    {
      "action": "CallGetDevice",
      "curr_state": "Held",
      "next_state": "Held"
    },
    {
      "action": "CallPutDevice",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallGetDevice",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallPutDevice",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallGetDevice",
      "curr_state": "Any",
      "next_state": "Held"
    },
    {
      "action": "CallPutDevice",
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