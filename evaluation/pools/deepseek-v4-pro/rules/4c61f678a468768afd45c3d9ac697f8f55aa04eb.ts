{
  "action": {
    "ErrExit": [],
    "Lock": [],
    "Unlock": []
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
      "Lock"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "PVRUSB2-IOREAD-MISSING-UNLOCK",
    "key_actions": [
      "Lock",
      "ErrExit"
    ],
    "name": "missing-mutex-unlock"
  },
  "context": {
    "end_action": [
      "Unlock"
    ],
    "start_action": [
      "Lock"
    ]
  },
  "event_metadata": {
    "Exit": {
      "role": "sink"
    },
    "Lock": {
      "role": "source"
    },
    "Unlock": {
      "role": "release"
    }
  },
  "merge": [
    {
      "curr_state1": "Any",
      "curr_state2": "Locked",
      "merge_state": "Locked"
    },
    {
      "curr_state1": "Any",
      "curr_state2": "Unlocked",
      "merge_state": "Unlocked"
    }
  ],
  "sliced_action": [
    "Lock",
    "Unlock",
    "ErrExit"
  ],
  "state": [
    "Locked",
    "Unlocked",
    "Leak"
  ],
  "state_roles": {
    "Init": "init",
    "Leak": "bug",
    "Locked": "danger",
    "Unlocked": "safe"
  },
  "transition": [
    {
      "action": "Unlock",
      "curr_state": "Locked",
      "next_state": "Unlocked"
    },
    {
      "action": "ErrExit",
      "curr_state": "Locked",
      "next_state": "Leak"
    },
    {
      "action": "Lock",
      "curr_state": "Unlocked",
      "next_state": "Locked"
    },
    {
      "action": "Lock",
      "curr_state": "Locked",
      "next_state": "Locked"
    },
    {
      "action": "Unlock",
      "curr_state": "Unlocked",
      "next_state": "Unlocked"
    },
    {
      "action": "ErrExit",
      "curr_state": "Unlocked",
      "next_state": "Unlocked"
    },
    {
      "action": "Lock",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Unlock",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Lock",
      "curr_state": "Any",
      "next_state": "Locked"
    },
    {
      "action": "Unlock",
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