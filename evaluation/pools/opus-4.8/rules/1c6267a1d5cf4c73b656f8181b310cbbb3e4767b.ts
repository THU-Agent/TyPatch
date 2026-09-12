{
  "action": {
    "ErrExit": [],
    "Ret": [
      {
        "AllocLarge": [
          "cifs_buf_get",
          "cifs_small_buf_get"
        ]
      }
    ],
    "StoreInit": []
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
      "AllocLarge"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "AllocLarge"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "receive_encrypted_standard_next_buffer_leak",
    "key_actions": [
      "AllocLarge",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "ErrExit"
    ],
    "start_action": [
      "AllocLarge"
    ]
  },
  "event_metadata": {
    "AllocLarge": {
      "role": "source"
    },
    "Exit": {
      "role": "sink"
    },
    "StoreInit": {
      "role": "release"
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
      "curr_state2": "Stored",
      "merge_state": "Stored"
    }
  ],
  "sliced_action": [
    "AllocLarge",
    "StoreInit",
    "ErrExit"
  ],
  "state": [
    "Allocated",
    "Stored",
    "Leak"
  ],
  "state_roles": {
    "Allocated": "danger",
    "Init": "init",
    "Leak": "bug",
    "Stored": "safe"
  },
  "transition": [
    {
      "action": "StoreInit",
      "curr_state": "Allocated",
      "next_state": "Stored"
    },
    {
      "action": "ErrExit",
      "curr_state": "Allocated",
      "next_state": "Leak"
    },
    {
      "action": "AllocLarge",
      "curr_state": "Stored",
      "next_state": "Allocated"
    },
    {
      "action": "AllocLarge",
      "curr_state": "Allocated",
      "next_state": "Allocated"
    },
    {
      "action": "StoreInit",
      "curr_state": "Stored",
      "next_state": "Stored"
    },
    {
      "action": "ErrExit",
      "curr_state": "Stored",
      "next_state": "Stored"
    },
    {
      "action": "AllocLarge",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "StoreInit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "AllocLarge",
      "curr_state": "Any",
      "next_state": "Allocated"
    },
    {
      "action": "StoreInit",
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