export const START_BYTES = 'ab56';
export const COMMANDS = {
  ADD: '02',
  CRC_ERROR: '04',
  DECREASE: '03',
  READ: '01',
};
export const SERIAL_PORT_PATH = '/dev/ttyAMA0';
export const CHECKSUM_ERROR = Buffer.from('ab560400000000000000D130', 'hex');
export const NO_COMMAND_MATCH_ERROR = Buffer.from('AB560400000000000001D130', 'hex');
export const MAX_DEPOSIT = 16384;

// TODO: Ask what error should this be?
export const NO_CARD_ERROR = Buffer.from('ab560400000000000000D130', 'hex');
export const DEPOSIT_OVERFLOW_ERROR = 'ff00';
export const TABLE_ABS = [
  0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401,
  0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01, 0x8801, 0x4400,
];
