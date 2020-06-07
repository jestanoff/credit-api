export default () => {
  const date = new Date();
  const time = date.toLocaleString('en-UK', { hour12: false }).split(', ')[1];
  const milliseconds = date.getMilliseconds().toString();
  return `${time}:${milliseconds.padStart(3, '0')}`;
};
