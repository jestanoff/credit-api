/* eslint-disable no-bitwise */
import { TABLE_ABS, TABLE_CRC } from '../constants.js';

// CRC16 Modbus checksum algorithm

export const check = buffer => {
  let crc = 0xffff;

  for (let i = 0; i < buffer.length; i += 1) {
    const ch = buffer[i];
    crc = TABLE_ABS[(ch ^ crc) & 15] ^ (crc >> 4);
    crc = TABLE_ABS[((ch >> 4) ^ crc) & 15] ^ (crc >> 4);
  }

  return crc;
};

export const generate = (buffer, previous) => {
  const table = typeof Int32Array === 'undefined' ? TABLE_CRC : new Int32Array(TABLE_CRC);

  // if (!Buffer.isBuffer(buffer)) buf = Buffer.from(buffer);

  const buf = Buffer.from(buffer);

  let crc = typeof previous === 'undefined' ? 0xffff : ~~previous;

  for (let index = 0; index < buf.length; index += 1) {
    const byte = buf[index];
    crc = ((table[(crc ^ byte) & 0xff] ^ (crc >> 8)) & 0xffff);
  }

  return ((crc << 8) & 0xff00) | ((crc >> 8) & 0x00ff);
};
