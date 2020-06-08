export const START_BYTES = 'ab56';
export const COMMANDS = {
  ADD: '02',
  DECREASE: '03',
  READ: '01',
};
export const SERIAL_PORT_PATH = '/dev/ttyAMA0';
export const CHECKSUM_ERROR = '0000';
export const MAX_DEPOSIT = 9999;

// TODO: Ask what error should this be?
export const CARD_NOT_FOUND_ERROR = 'ff00';
export const DEPOSIT_OVERFLOW_ERROR = 'ffff';
export const INSUFFICIENT_BALANCE_ERROR = 'fff0';
export const TABLE_ABS = [
  0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401,
  0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01, 0x8801, 0x4400,
];
