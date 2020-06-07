export default buffer => {
  const data = buffer.toString('hex');
  if (data.length === 24) {
    return {
      start: data.slice(0, 4),
      command: data.slice(4, 6),
      cardId: data.slice(6, 16),
      credits: data.slice(16, 20),
      checksum: data.slice(20),
    };
  }

  throw new SyntaxError(`Hex length must be 12 bytes, received ${buffer.length / 2}`);
};
