export const inputActions = [
  'move_left',
  'move_right',
  'interact',
  'confirm',
  'pause',
  'leader_skill',
  'crew_command',
] as const

export type InputAction = (typeof inputActions)[number]
