import prettyPrintMessage from './prettyPrintMessage.js';
import calcChecksum from './calcChecksum.js';
import {
  CARD_NOT_FOUND_ERROR,
  CHECKSUM_ERROR,
  COMMANDS,
  DEPOSIT_OVERFLOW_ERROR,
  INSUFFICIENT_BALANCE_ERROR,
  START_BYTES,
} from './constants.js';

export default (serialPort, command, cardId, credit, time) => {
  const message = `${START_BYTES}${command}${cardId}${credit}`;
  const checksum = calcChecksum(Buffer.from(message, 'hex'));
  const messageWithChecksum = Buffer.from(`${message}${checksum}`, 'hex');
  let [action] = Object.entries(COMMANDS).find(([_, value]) => value === command);
  if (credit === DEPOSIT_OVERFLOW_ERROR) action = 'DEPOSIT_OVERFLOW';
  if (credit === CARD_NOT_FOUND_ERROR) action = 'CARD_NOT_FOUND';
  if (credit === INSUFFICIENT_BALANCE_ERROR) action = 'INSUFFICIENT_BALANCE';
  if (credit === CHECKSUM_ERROR) action = 'CHECKSUM_ERROR';

  serialPort.write(messageWithChecksum, 'hex', () => {
    prettyPrintMessage(messageWithChecksum, action, Date.now() - time);
  });
}
