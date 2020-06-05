import SerialPort from 'serialport';
import ByteLength from '@serialport/parser-byte-length';
import hexRequestParser from './hexRequestParser.js';
import authenticate from './requests/authenticate.js';
import getBalance from './requests/getBalance.js';
import deposit from './requests/deposit.js';
import withdraw from './requests/withdraw.js';
import * as checksum from './requests/checksum.js';
import {
  BYTES,
  CHECKSUM_ERROR,
  COMMANDS,
  NO_COMMAND_MATCH_ERROR,
} from './constants.js';

// TODO: Remove once we got real certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const getTimestamp = () => {
  const date = new Date();
  const time = date.toLocaleString('en-UK', { hour12: false }).split(', ')[1];
  return `${time}:${date.getMilliseconds()}`;
};

export default async () => {
  let authToken;
  let balance;
  let balanceAfterDeposit;
  let balanceAfterWithdraw;
  let generatedChecksum;
  let message;

  const serialPort = new SerialPort('/dev/ttyAMA0', { baudRate: 115200 });
  const parser = new ByteLength({ length: 12 });
  const serialPortParser = serialPort.pipe(parser);

  serialPort.on('open', () => console.log(`DEBUG  (${getTimestamp()}): serial port opened`));
  serialPort.on('close', () => console.log(`DEBUG  (${getTimestamp()}): serial port closed`));
  serialPort.on('error', (err) => console.log(`DEBUG  (${getTimestamp()}): serial port err`, err));
  serialPort.on('drain', () => console.log(`DEBUG  (${getTimestamp()}): serial port drain`));
  // TODO: Try to trigger

  authToken = await authenticate();
  console.log(
    `DEBUG  (${getTimestamp()}): Authenticated with token ${authToken}`,
  );

  // Switches the port into 'flowing mode'
  serialPortParser.on('data', async (data) => {
    const { cardId, command, credits } = hexRequestParser(data.toString('hex'));
    console.log(
      `INPUT  (${getTimestamp()}): 0x${data.toString('hex').toUpperCase()}`,
    );

    if (!authToken) {
      authToken = await authenticate();
      console.log(
        `DEBUG  (${getTimestamp()}): RE-Authenticated with token ${authToken}`,
      );
    }

    if (checksum.check(data) === 0) {
      switch (command) {
        case COMMANDS.READ:
          balance = await getBalance({ authToken, cardId });
          console.log(
            `DEBUG  (${getTimestamp()}): CardId ${cardId} with balance ${balance} = ${balance.toString(
              16,
            )} HEX`,
          );
          message = Buffer.from(
            `${BYTES.START}${COMMANDS.READ}${cardId}${balance.toString(16)}`,
          );
          generatedChecksum = checksum.generate(message).toString(16);
          console.log(
            `DEBUG  (${getTimestamp()}): read ${message}${generatedChecksum}`,
          );
          serialPortParser.write(`${message}${generatedChecksum}`);
          break;
        case COMMANDS.ADD:
          balanceAfterDeposit = await deposit({
            amount: credits,
            authToken,
            cardId,
          });
          console.log(
            `DEBUG  (${getTimestamp()}): CardId ${cardId} balance after deposit ${balanceAfterDeposit}`,
          );
          break;
        case COMMANDS.DECREASE:
          balanceAfterWithdraw = await withdraw({
            amount: credits,
            authToken,
            cardId,
          });
          console.log(
            `DEBUG  (${getTimestamp()}): CardId ${cardId} balance after withdraw ${balanceAfterWithdraw}`,
          );
          break;
        case COMMANDS.CRC_ERROR:
          console.log(`DEBUG  (${getTimestamp()}): CRC_ERROR`);
          break;
        default:
          console.log(`DEBUG  (${getTimestamp()}): NO_COMMAND_MATCH_ERROR`);
          serialPortParser.write(NO_COMMAND_MATCH_ERROR);
      }
    } else {
      console.log(
        `DEBUG  (${getTimestamp()}): Message 0x${data
          .toString('hex')
          .toUpperCase()} has wrong checksum`,
      );
      // Returns a pre-defined error when the checksum is incorrect
      serialPortParser.write(CHECKSUM_ERROR);
    }
  });
};
