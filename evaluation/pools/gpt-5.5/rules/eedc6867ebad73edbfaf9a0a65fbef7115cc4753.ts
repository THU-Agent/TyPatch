{
  "action": {
    "Call": [
      {
        "CallClaimSibling": [
          {
            "arg_idx": 1,
            "func_name": "usb_driver_claim_interface"
          }
        ]
      },
      {
        "CallReleaseSibling": [
          {
            "arg_idx": 1,
            "func_name": "usb_driver_release_interface"
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
      "CallClaimSibling"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallClaimSibling"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "btusb_registration_failure_sibling_interface_leak",
    "key_actions": [
      "CallClaimSibling",
      "ErrExit"
    ],
    "name": "error-path sibling interface release leak"
  },
  "context": {
    "end_action": [
      "CallReleaseSibling"
    ],
    "start_action": [
      "CallClaimSibling"
    ]
  },
  "event_metadata": {
    "CallClaimSibling": {
      "role": "source"
    },
    "CallReleaseSibling": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Claimed",
      "merge_state": "Claimed"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Released",
      "merge_state": "Released"
    }
  ],
  "sliced_action": [
    "CallClaimSibling",
    "CallReleaseSibling",
    "ErrExit"
  ],
  "state": [
    "Claimed",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Claimed": "danger",
    "Init": "init",
    "Leak": "bug",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "CallReleaseSibling",
      "curr_state": "Claimed",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Claimed",
      "next_state": "Leak"
    },
    {
      "action": "CallClaimSibling",
      "curr_state": "Released",
      "next_state": "Claimed"
    },
    {
      "action": "CallClaimSibling",
      "curr_state": "Claimed",
      "next_state": "Claimed"
    },
    {
      "action": "CallReleaseSibling",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallClaimSibling",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallReleaseSibling",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallClaimSibling",
      "curr_state": "Any",
      "next_state": "Claimed"
    },
    {
      "action": "CallReleaseSibling",
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