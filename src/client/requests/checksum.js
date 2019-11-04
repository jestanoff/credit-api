/* eslint-disable no-bitwise */
const talbeAbs = [
  0x0000, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401,
  0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01, 0x8801, 0x4400,
];

export default buffer => {
  let crc = 0xffff;

  for (let i = 0; i < buffer.length; i += 1) {
    const ch = buffer[i];
    crc = talbeAbs[(ch ^ crc) & 15] ^ (crc >> 4);
    crc = talbeAbs[((ch >> 4) ^ crc) & 15] ^ (crc >> 4);
  }

  return crc;
};
