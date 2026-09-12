{
  "action": {
    "Call": [
      {
        "CallAddVideomode": [
          {
            "arg_idx": 1,
            "func_name": "fb_add_videomode"
          }
        ]
      },
      {
        "CallRegisterFramebuffer": [
          {
            "arg_idx": 0,
            "field_path": "modelist",
            "func_name": "register_framebuffer"
          }
        ]
      }
    ],
    "Exit": []
  },
  "analysis": {
    "backend": "tdfs",
    "call_outparam_as_init": false,
    "disable_slice": true,
    "initial_state": "Untracked",
    "intra_procedural_cfg": true,
    "keep_call_bypass_loop": true,
    "load_as_use": false,
    "merge_default": "preserve_non_init",
    "min_report_unique_actions": 2,
    "path_sensitive_verify": true,
    "source_actions": [
      "CallAddVideomode"
    ],
    "start_policy": "on_source_action",
    "store_zero_as_init": false,
    "use_load_only": false
  },
  "bug": {
    "bug_state": "RegisteredWithMaybeEmptyModelist",
    "key": "fbdev_imxfb_fb_add_videomode_unchecked_empty_modelist",
    "key_actions": [
      "CallAddVideomode",
      "CallRegisterFramebuffer"
    ],
    "name": "unchecked fb_add_videomode failure before framebuffer registration"
  },
  "context": {
    "end_action": [
      "Exit",
      "CallRegisterFramebuffer"
    ],
    "start_action": [
      "CallAddVideomode"
    ]
  },
  "event_metadata": {
    "CallAddVideomode": {
      "role": "init"
    },
    "CallRegisterFramebuffer": {
      "role": "sink"
    },
    "Exit": {
      "role": "guard"
    }
  },
  "merge": [
    {
      "curr_state1": "Untracked",
      "curr_state2": "ModeAddAttempted",
      "merge_state": "ModeAddAttempted"
    }
  ],
  "sliced_action": [
    "CallAddVideomode",
    "CallRegisterFramebuffer",
    "Exit"
  ],
  "state": [
    "Untracked",
    "ModeAddAttempted",
    "RegisteredWithMaybeEmptyModelist"
  ],
  "state_roles": {
    "Init": "init",
    "ModeAddAttempted": "danger",
    "RegisteredWithMaybeEmptyModelist": "bug"
  },
  "transition": [
    {
      "action": "CallAddVideomode",
      "curr_state": "Untracked",
      "next_state": "ModeAddAttempted"
    },
    {
      "action": "CallRegisterFramebuffer",
      "curr_state": "ModeAddAttempted",
      "next_state": "RegisteredWithMaybeEmptyModelist"
    },
    {
      "action": "Exit",
      "curr_state": "ModeAddAttempted",
      "next_state": "Untracked"
    },
    {
      "action": "CallRegisterFramebuffer",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "Exit",
      "curr_state": "Untracked",
      "next_state": "Untracked"
    },
    {
      "action": "CallAddVideomode",
      "curr_state": "ModeAddAttempted",
      "next_state": "ModeAddAttempted"
    },
    {
      "action": "CallAddVideomode",
      "curr_state": "RegisteredWithMaybeEmptyModelist",
      "next_state": "RegisteredWithMaybeEmptyModelist"
    },
    {
      "action": "CallRegisterFramebuffer",
      "curr_state": "RegisteredWithMaybeEmptyModelist",
      "next_state": "RegisteredWithMaybeEmptyModelist"
    },
    {
      "action": "Exit",
      "curr_state": "RegisteredWithMaybeEmptyModelist",
      "next_state": "RegisteredWithMaybeEmptyModelist"
    }
  ]
}