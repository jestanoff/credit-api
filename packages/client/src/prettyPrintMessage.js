import getTimestamp from './getTimestamp.js';
import hexRequestParser from './hexRequestParser.js';
import log from './log.js'

export default (message, action = '', duration = '') => {
  if (message.length === 12) {
    const {
      cardId, checksum, command, credits,
    } = hexRequestParser(message);
    log(
      `${getTimestamp()} ${action} ${command} ${cardId} ${credits.toString(16).padStart(4, '0')} ${checksum}${duration ? ' | ' + duration + ' ms' : ''} | ${credits}`,
    );
  } else {
    log(`${getTimestamp()} ${action} ${message.toString('hex')}`)
  }
};
