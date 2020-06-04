import SerialPort from 'serialport';
// eslint-disable-next-line import/no-extraneous-dependencies
import MockBinding from '@serialport/binding-mock';
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

  SerialPort.Binding = MockBinding;
  MockBinding.createPort('/dev/tty.SerialInputPort', { echo: true, readyData: '', record: true });
  MockBinding.createPort('/dev/tty.SerialOutputPort', {
    echo: false,
    readyData: '',
    record: true,
  });

  // const inputPort = new SerialPort('/dev/ttyAMA0', { baudRate: 115200 });
  const inputPort = new SerialPort('/dev/tty.SerialInputPort', { baudRate: 115200 });
  const outputPort = new SerialPort('/dev/tty.SerialOutputPort', {
    baudRate: 115200,
  });
  const parserInput = inputPort.pipe(new ByteLength({ length: 12 }));
  const parserOutput = outputPort.pipe(new ByteLength({ length: 12 }));

  inputPort.on('open', () => console.log(`DEBUG  (${getTimestamp()}): input port opened`));
  inputPort.on('close', () => console.log(`DEBUG  (${getTimestamp()}): input port closed`));
  inputPort.on('error', (err) => console.log(`DEBUG  (${getTimestamp()}): input port err`, err));
  inputPort.on('drain', () => console.log(`DEBUG  (${getTimestamp()}): input port drain`));
  // TODO: Try to trigger

  outputPort.on('open', () => console.log(`DEBUG  (${getTimestamp()}): output port opened`));
  outputPort.on('close', () => console.log(`DEBUG  (${getTimestamp()}): output port closed`));
  outputPort.on('error', (err) => console.log(`DEBUG  (${getTimestamp()}): output port err`, err));
  outputPort.on('drain', () => console.log(`DEBUG  (${getTimestamp()}): output port drain`));

  authToken = await authenticate();
  console.log(
    `DEBUG  (${getTimestamp()}): Authenticated with token ${authToken}`,
  );

  // Switches the port into 'flowing mode'
  parserInput.on('data', async (data) => {
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
          outputPort.write(`${message}${generatedChecksum}`);
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
          outputPort.write(NO_COMMAND_MATCH_ERROR);
      }
    } else {
      console.log(
        `DEBUG  (${getTimestamp()}): Message 0x${data
          .toString('hex')
          .toUpperCase()} has wrong checksum`,
      );
      // Returns a pre-defined error when the checksum is incorrect
      parserOutput.write(CHECKSUM_ERROR);
    }
  });

  parserOutput.on('data', async (data) => {
    console.log(
      `OUTPUT (${getTimestamp()}): 0x${data.toString('hex').toUpperCase()}`,
    );
  });

  const runTestCommands = (parser) => {
    // parser.write([171, 86, 1, 1, 123, 175, 31, 104, 0, 0, 89, 148]); // Read dec
    parser.write(Buffer.from('AB5601017BAF1F68010ED9C0', 'hex')); // Read
    setTimeout(
      () => parser.write(Buffer.from('AB5602017BAF1F680064186A', 'hex')),
      500,
    ); // Add
    setTimeout(
      () => parser.write(Buffer.from('AB5603017BAF1F680001198D', 'hex')),
      1000,
    ); // Decrease
    setTimeout(
      () => parser.write(Buffer.from('AB560100000000110000D130', 'hex')),
      1500,
    ); // Message with wrong checksum
    setTimeout(() => parser.close(), 2000);
  };

  runTestCommands(inputPort);
};
