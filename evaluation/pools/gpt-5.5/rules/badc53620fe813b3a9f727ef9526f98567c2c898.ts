{
  "action": {
    "Call": [
      {
        "ReleaseNdev": [
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
        "AcquireNdev": [
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
      "AcquireNdev"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AcquireNdev"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "nvme-target-rdma-ndev-refcount-leak-on-connect-busy",
    "key_actions": [
      "AcquireNdev",
      "ErrExit"
    ],
    "name": "reference leak"
  },
  "context": {
    "end_action": [
      "ReleaseNdev"
    ],
    "start_action": [
      "AcquireNdev"
    ]
  },
  "event_metadata": {
    "AcquireNdev": {
      "role": "acquire"
    },
    "Exit": {
      "role": "sink"
    },
    "ReleaseNdev": {
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
    "AcquireNdev",
    "ReleaseNdev",
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
      "action": "ReleaseNdev",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "AcquireNdev",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "AcquireNdev",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseNdev",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "AcquireNdev",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ReleaseNdev",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AcquireNdev",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "ReleaseNdev",
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