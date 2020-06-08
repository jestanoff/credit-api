import getTimestamp from './getTimestamp.js';
import hexRequestParser from './hexRequestParser.js';

export default (message, action = '', duration = '') => {
  if (message.length === 12) {
    const {
      cardId, checksum, command, credits, start,
    } = hexRequestParser(message);
    console.log(
      `${getTimestamp()} ${action} ${command} ${cardId} ${credits} ${checksum}${duration ? ' | ' + duration + ' ms' : ''} | ${parseInt(credits, 16)}`,
    );
  } else {
    console.log(`${getTimestamp()} ${action} ${message.toString('hex')}`)
  }
};
