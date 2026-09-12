{
  "action": {
    "Call": [
      {
        "CallLagPut": [
          {
            "arg_idx": 1,
            "func_name": "mlxsw_sp_lag_put"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "CallLagGet": [
          "mlxsw_sp_lag_get"
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
      "CallLagGet"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "CallLagGet"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "mlxsw_sp_port_lag_join_refcount_leak",
    "key_actions": [
      "CallLagGet",
      "ErrExit"
    ],
    "name": "error-path resource-leak"
  },
  "context": {
    "end_action": [
      "CallLagPut"
    ],
    "start_action": [
      "CallLagGet"
    ]
  },
  "event_metadata": {
    "CallLagGet": {
      "role": "source"
    },
    "CallLagPut": {
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
    "CallLagGet",
    "CallLagPut",
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
      "action": "CallLagPut",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "CallLagGet",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "CallLagGet",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "CallLagPut",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "CallLagGet",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallLagPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "CallLagGet",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "CallLagPut",
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