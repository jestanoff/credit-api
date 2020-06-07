/* eslint-disable no-bitwise */
import { TABLE_ABS } from '../constants.js';

// CRC16 Modbus checksum algorithm

export default buffer => {
  let crc = 0xffff;

  for (let i = 0; i < buffer.length; i += 1) {
    const ch = buffer[i];
    crc = TABLE_ABS[(ch ^ crc) & 15] ^ (crc >> 4);
    crc = TABLE_ABS[((ch >> 4) ^ crc) & 15] ^ (crc >> 4);
  }

  if (crc === 0) return 0
  
  crc = crc.toString(16).padStart(4, '0')
  return crc.slice(2) + crc.slice(0, 2)
};
