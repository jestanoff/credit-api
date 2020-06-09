export default buffer => {
  const data = buffer.toString('hex');
  return {
    start: data.slice(0, 4),
    command: data.slice(4, 6),
    cardId: data.slice(6, 16),
    credits: parseInt(data.slice(16, 20), 16),
    checksum: data.slice(20),
  };
};
