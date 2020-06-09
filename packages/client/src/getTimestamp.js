export default () => {
  const date = new Date();
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-GB', { hour12: false });
  const milliseconds = date.getMilliseconds().toString();
  return `${day}/${month}/${year} ${time}.${milliseconds.padStart(3, '0')}`;
};
