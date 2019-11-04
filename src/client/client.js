import SerialPort from 'serialport';
// eslint-disable-next-line import/no-extraneous-dependencies
import MockBinding from '@serialport/binding-mock';
import ByteLength from '@serialport/parser-byte-length';
import hexRequestParser from './hexRequestParser.js';
import authenticate from './requests/authenticate.js';
import getBalance from './requests/getBalance.js';
import deposit from './requests/deposit.js';
import withdraw from './requests/withdraw.js';
import checksum from './requests/checksum.js';

// TODO: Remove once we got real certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

export default async () => {
  let authToken;
  let balance;
  let balanceAfterDeposit;
  let balanceAfterWithdraw;

  SerialPort.Binding = MockBinding;
  MockBinding.createPort('/dev/tty.SerialPort', { echo: true, readyData: '', record: true });

  const port = new SerialPort('/dev/tty.SerialPort', { baudRate: 115200 }, err => {
    if (err) console.log(err);
    console.log(`Listening on serial port ${port.path}`);
  });
  const parser = port.pipe(new ByteLength({ length: 12 }));

  port.write([171, 86, 1, 1, 123, 175, 31, 104, 0, 0, 89, 148]); // Read dec
  // port.write(Buffer.from('AB5601017BAF1F68010ED9C0', 'hex')); // Read
  port.write(Buffer.from('AB5602017BAF1F680064186A', 'hex')); // Add
  port.write(Buffer.from('AB5603017BAF1F680001198D', 'hex')); // Decrease
  port.write(Buffer.from('AB560100000000110000D130', 'hex')); // Message with wrong checksum

  parser.on('close', () => console.log('closed'));
  parser.on('error', err => console.log('err', err));
  parser.on('open', () => console.log('opened'));
  parser.on('drain', () => console.log('drain'));

  authToken = await authenticate();
  console.log(`Authenticated with token ${authToken}`);

  // Switches the port into "flowing mode"
  parser.on('data', async data => {
    const commands = {
      ADD: '02',
      CRC_ERROR: '04',
      DECREASE: '03',
      READ: '01',
    };

    const {
      cardId,
      command,
      credits,
    } = hexRequestParser(data.toString('hex'));

    if (!authToken) {
      authToken = await authenticate();
      console.log(`Authenticated with token ${authToken}`);
    }

    if (checksum(data) !== 0) {
      console.log(`Message 0x${data.toString('hex').toUpperCase()} has wrong checksum`);
      // Returns a pre-difined error when the checksum is incorrect
      port.write(Buffer.from('AB560400000000000000D130', 'hex'));
    }

    if (command === commands.READ) {
      balance = await getBalance({ authToken, cardId });
      console.log(`CardId ${cardId} with balance ${balance}`);
    }

    if (command === commands.ADD) {
      balanceAfterDeposit = await deposit({ amount: credits, authToken, cardId });
      console.log(`CardId ${cardId} balance after deposit ${balanceAfterDeposit}`);
    }

    if (command === commands.DECREASE) {
      balanceAfterWithdraw = await withdraw({ amount: credits, authToken, cardId });
      console.log(`CardId ${cardId} balance after withdraw ${balanceAfterWithdraw}`);
    }

    if (command === commands.CRC_ERROR) {
      console.log('CRC_ERROR');
    }
  });
};
