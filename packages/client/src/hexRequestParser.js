export default buffer => {
  const data = buffer.toString('hex');
  return {
    start: data.slice(0, 4),
    command: data.slice(4, 6),
    cardId: data.slice(6, 16),
    credits: data.slice(16, 20),
    checksum: data.slice(20),
  };
};
