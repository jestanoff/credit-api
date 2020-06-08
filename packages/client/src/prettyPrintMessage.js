import getTimestamp from './getTimestamp.js';
import hexRequestParser from './hexRequestParser.js';

export default (message, action = 'RECEIVED') => {
  if (message.length === 12) {
    const {
      cardId, checksum, command, credits, start,
    } = hexRequestParser(message);
    console.log(
      `${getTimestamp()} ${action} 0x ${start} ${command} ${cardId} ${credits} ${checksum}`,
    );
  } else {
    console.log(`${getTimestamp()} ${action} ${message.toString('hex')}`)
  }
};
