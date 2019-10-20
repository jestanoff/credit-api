export default req => {
  if (req.length === 24) {
    return {
      start: req.slice(0, 4),
      command: req.slice(4, 6),
      cardId: req.slice(6, 16),
      credits: req.slice(16, 20),
      checksum: req.slice(20, 24),
    };
  }

  throw new SyntaxError(`Hex length must be 12 bytes, received ${req.length / 2}`);
};
