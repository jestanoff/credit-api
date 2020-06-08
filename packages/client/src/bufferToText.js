export default data => data
  .toString('hex')
  .match(/[0-9a-f]{2}/gi)
  .map(hex => String.fromCharCode(parseInt(hex, 16)))
  .filter(char => char !== '\r')
  .join('');
