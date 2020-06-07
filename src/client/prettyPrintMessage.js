import getTimestamp from './getTimestamp.js';
import hexRequestParser from './hexRequestParser.js';

export default (message, action = 'RECEIVED') => {
  const { cardId, checksum, command, credits, start } = hexRequestParser(message);
  console.log(`${getTimestamp()} ${action} 0x ${start} ${command} ${cardId} ${credits} ${checksum}`);
} 