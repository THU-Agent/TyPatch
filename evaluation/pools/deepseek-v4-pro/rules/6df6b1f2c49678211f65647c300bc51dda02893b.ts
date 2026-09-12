{
  "action": {
    "Call": [
      {
        "CallInputFreeDevice": [
          {
            "arg_idx": 0,
            "func_name": "input_free_device"
          }
        ]
      }
    ],
    "StoreNull": [],
    "Use": []
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "initial_state": "Untracked",
    "intra_procedural_cfg": false,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "CallInputFreeDevice"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "UAF",
    "key": "HID_hidpp_UAF_missing_null_clear",
    "key_actions": [
      "CallInputFreeDevice",
      "Use"
    ],
    "name": "use-after-free of hidpp->input due to missing NULL clear after release"
  },
  "context": {
    "end_action": [
      "Use"
    ],
    "start_action": [
      "CallInputFreeDevice"
    ]
  },
  "event_metadata": {
    "CallInputFreeDevice": {
      "role": "release"
    },
    "StoreNull": {
      "role": "guard"
    },
    "Use": {
      "role": "sink"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "Null",
      "merge_state": "Untracked"
    },
    {
      "curr_state1": "Untracked",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    },
    {
      "curr_state1": "Null",
      "curr_state2": "Freed",
      "merge_state": "Freed"
    }
  ],
  "sliced_action": [
    "CallInputFreeDevice",
    "StoreNull",
    "Use"
  ],
  "state": [
    "Untracked",
    "Null",
    "Freed",
    "UAF"
  ],
  "state_roles": {
    "Freed": "danger",
    "Init": "init",
    "Null": "safe",
    "UAF": "bug"
  },
  "transition": [
    {
      "action": "CallInputFreeDevice",
      "curr_state": "Untracked",
      "next_state": "Freed"
    },
    {
      "action": "StoreNull",
      "curr_state": "Untracked",
      "next_state": "Null"
    },
    {
      "action": "CallInputFreeDevice",
      "curr_state": "Freed",
      "next_state": "UAF"
    },
    {
      "action": "StoreNull",
      "curr_state": "Freed",
      "next_state": "Null"
    },
    {
      "action": "Use",
      "curr_state": "Freed",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallInputFreeDevice",
      "curr_state": "Null",
      "next_state": "Null"
    },
    {
      "action": "StoreNull",
      "curr_state": "Null",
      "next_state": "Null"
    },
    {
      "action": "Use",
      "curr_state": "Null",
      "next_state": "Null"
    },
    {
      "action": "CallInputFreeDevice",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "StoreNull",
      "curr_state": "UAF",
      "next_state": "UAF"
    },
    {
      "action": "Use",
      "curr_state": "UAF",
      "next_state": "UAF"
    }
  ]
}