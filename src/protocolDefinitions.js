/**
 * MicroPede Robot Control Protocol
 */
const MRCP = {
  START_FRAME: 'S',
  END_FRAME: ';',

  QUEUE_IN: 'Q',
  EXECUTE: 'E',
  WRITE: '?',

  FREE_MRIL_BUFFER: 'B',
}

/**
 * MicroPede Robot Instruction Language
 */
const MRIL = {
  X: 'X',
  Y: 'Y',
  Z: 'Z',
  A: 'A',
  B: 'B',
  C: 'C',

  ANGLE: 'R',

  VELOCITY: 'V',

  ANCHOR_POINT: 'T',
  MOVEMENT_METHOD: 'M',

  INPUT: 'I',
  OUTPUT: 'O',
  SERIAL_IO: 'U',
  WAIT: 'W',

  COMMAND_NUMBER: 'N',

  HALT: 'H',

  IS_MOVING: 'K',
  GET_ANGLES: 'Q',
  GET_POSE: 'P',
}

/**
 * MicroPede Robot Control Protocol - Response
 */
const MRCPR = {
  START_FRAME: MRCP.START_FRAME,
  END_FRAME: MRCP.END_FRAME,

  E_RECEIVEBUFFER_FULL: 'E01',
  E_MRILBUFFER_FULL: 'E02',
}

export default {
  MRCP,
  MRCPR,
  MRIL,
}
