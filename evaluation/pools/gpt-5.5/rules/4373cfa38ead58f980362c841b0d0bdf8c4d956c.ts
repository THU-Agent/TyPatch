{
  "action": {
    "BrNonNull": [],
    "Call": [
      {
        "CallRelease": [
          {
            "arg_idx": 0,
            "func_name": "power_supply_put"
          }
        ]
      }
    ],
    "Exit": [],
    "Ret": [
      {
        "OptionalResourceRet": [
          "power_supply_get_by_name"
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
      "OptionalResourceRet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "charger-manager-is-full-charged-power-supply-refcount-leak",
    "key_actions": [
      "OptionalResourceRet",
      "BrNonNull",
      "Exit"
    ],
    "name": "refcount resource leak"
  },
  "context": {
    "end_action": [
      "CallRelease"
    ],
    "start_action": [
      "OptionalResourceRet"
    ]
  },
  "event_metadata": {
    "BrNonNull": {
      "role": "guard"
    },
    "CallRelease": {
      "role": "release"
    },
    "Exit": {
      "role": "sink"
    },
    "OptionalResourceRet": {
      "role": "acquire"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "MaybeResource",
      "merge_state": "MaybeResource"
    },
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
    "OptionalResourceRet",
    "BrNonNull",
    "CallRelease",
    "Exit"
  ],
  "state": [
    "MaybeResource",
    "Acquired",
    "Released",
    "Leak"
  ],
  "state_roles": {
    "Acquired": "danger",
    "Init": "init",
    "Leak": "bug",
    "MaybeResource": "unknown",
    "Released": "safe"
  },
  "transition": [
    {
      "action": "BrNonNull",
      "curr_state": "MaybeResource",
      "next_state": "Acquired"
    },
    {
      "action": "CallRelease",
      "curr_state": "MaybeResource",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "MaybeResource",
      "next_state": "Any"
    },
    {
      "action": "CallRelease",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Released",
      "next_state": "MaybeResource"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "MaybeResource",
      "next_state": "MaybeResource"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallRelease",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Exit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallRelease",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Exit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "OptionalResourceRet",
      "curr_state": "Any",
      "next_state": "MaybeResource"
    },
    {
      "action": "BrNonNull",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "CallRelease",
      "curr_state": "Any",
      "next_state": "Any"
    },
    {
      "action": "Exit",
      "curr_state": "Any",
      "next_state": "Any"
    }
  ]
}