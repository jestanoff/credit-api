import log from './log.js'
import getTimestamp from './getTimestamp.js';

export default ({ baudRate, isOpen, path }) => {
  log(`${getTimestamp()} SERIAL_PORT ${path} ${baudRate} ${isOpen ? 'OPENED' : 'CLOSED'} `);
};
