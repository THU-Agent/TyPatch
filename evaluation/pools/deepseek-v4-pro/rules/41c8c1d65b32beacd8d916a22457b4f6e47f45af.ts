{
  "action": {
    "Call": [
      {
        "LagPut": [
          {
            "arg_idx": 0,
            "func_name": "mlxsw_sp_lag_put"
          }
        ]
      }
    ],
    "ErrExit": [],
    "Ret": [
      {
        "Ret": [
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
      "Ret"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "suppress_err_exit_on_returned_call_actions": [
      "Ret"
    ],
    "use_load_only": false
  },
  "bug": {
    "bug_state": "Leak",
    "key": "mlxsw-lag-ref-leak",
    "key_actions": [
      "Ret",
      "ErrExit"
    ],
    "name": "mlxsw_sp_port_lag_join refcount leak"
  },
  "context": {
    "end_action": [
      "LagPut"
    ],
    "start_action": [
      "Ret"
    ]
  },
  "event_metadata": {
    "Exit": {
      "role": "sink"
    },
    "LagPut": {
      "role": "release"
    },
    "Ret": {
      "role": "source"
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
    "Ret",
    "LagPut",
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
      "action": "LagPut",
      "curr_state": "Acquired",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Acquired",
      "next_state": "Leak"
    },
    {
      "action": "Ret",
      "curr_state": "Released",
      "next_state": "Acquired"
    },
    {
      "action": "Ret",
      "curr_state": "Acquired",
      "next_state": "Acquired"
    },
    {
      "action": "LagPut",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "ErrExit",
      "curr_state": "Released",
      "next_state": "Released"
    },
    {
      "action": "Ret",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "LagPut",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "ErrExit",
      "curr_state": "Leak",
      "next_state": "Leak"
    },
    {
      "action": "Ret",
      "curr_state": "Any",
      "next_state": "Acquired"
    },
    {
      "action": "LagPut",
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