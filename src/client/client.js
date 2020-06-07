import SerialPort from 'serialport';
import ByteLength from '@serialport/parser-byte-length';
import childProcess from 'child_process';

import hexRequestParser from './hexRequestParser.js';
import authenticate from './requests/authenticate.js';
import getBalance from './requests/getBalance.js';
import deposit from './requests/deposit.js';
import withdraw from './requests/withdraw.js';
import calcChecksum from './requests/calcChecksum.js';
import getTimestamp from './getTimestamp.js';
import prettyPrintMessage from './prettyPrintMessage.js';
import {
  CHECKSUM_ERROR,
  COMMANDS,
  NO_COMMAND_MATCH_ERROR,
  SERIAL_PORT_PATH,
  START,
} from './constants.js';

// TODO: Remove once we got real certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const DEBUG = process.env.DEBUG || false;

const cbLogging = error => {
  if (error) console.log(getTimestamp(), ...args)
}

const portDetailsLogging = port => {
  console.log('serialPort.baudRate', port.baudRate);
  console.log('serialPort.isOpen', port.isOpen);
  console.log('serialPort.path', port.path);
}

export default async () => {
  let authToken;
  let balance;
  let balanceAfterDeposit;
  let balanceAfterWithdraw;
  let generatedChecksum;
  let message;

  // Exit if there is no SerialPort to connect to
  const serialPortList = await SerialPort.list()
  if (!serialPortList.some(port => port.path === SERIAL_PORT_PATH)) {
    throw new Error(`Serial port ${SERIAL_PORT_PATH} not available`);
  }

  const serialPort = new SerialPort(SERIAL_PORT_PATH, { baudRate: 115200 });
  const parser = serialPort.pipe(new ByteLength({ length: 12 }));
  
  serialPort.on('open', () => {
    if (DEBUG) {
      console.log(`${getTimestamp()} SerialPort opened`);
      portDetailsLogging(serialPort);
    }

    // Flush the serialPort in case there is stale data there
    serialPort.flush(cbLogging);
    serialPort.resume();
  });

  serialPort.on('close', () => {
    if (DEBUG) console.log(`${getTimestamp()} SerialPort closed`);
  });

  serialPort.on('error', (err) => {
    if (DEBUG) {
      console.log(`${getTimestamp()} SerialPort error`, err);
      portDetailsLogging(serialPort);
    }

    if (!serialPort.isOpen) {
      // If the serialPort is closed kill the process using it
      const cmd = `kill -9 $(fuser ${SERIAL_PORT_PATH} | awk '{print $0}')`;
      childProcess.exec(cmd, (err, stdout, stderr) => {
        if (err) console.log(`Node could not kill the process using cmd "${cmd}"`);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        serialPort.open();
      });
    }
  });

  serialPort.on('drain', () => {
    if (DEBUG) console.log(`${getTimestamp()} SerialPort drained`);
  });
  // TODO: Try to trigger

  authToken = await authenticate();

  if (DEBUG) console.log(`${getTimestamp()} Authenticated with auth token`);

  // Switches the port into 'flowing mode'
  parser.on('data', async data => {
    
    const { cardId, command, credits } = hexRequestParser(data);
    
    if (DEBUG) prettyPrintMessage(data);

    if (!authToken) {
      authToken = await authenticate();

      if (DEBUG) {
        console.log(`${getTimestamp()} RE-Authenticated with token ${authToken}`);
      }
    }

    if (calcChecksum(data) === 0) {
      switch (command) {
        case COMMANDS.READ:
          balance = await getBalance({ authToken, cardId });
          message = `${START}${COMMANDS.READ}${cardId}${balance}`;
          generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
          serialPort.write(Buffer.from(`${message}${generatedChecksum}`, 'hex'), 'hex', cbLogging);

          if (DEBUG) {
            console.log(
              `${getTimestamp()} READ     ${cardId} has balance ${parseInt(balance, 16)}`,
            );
            prettyPrintMessage(Buffer.from(`${message}${generatedChecksum}`, 'hex'), 'SENT    ');
          }
          break;

        case COMMANDS.ADD:
          balanceAfterDeposit = await deposit({ amount: credits, authToken, cardId });
          message = `${START}${COMMANDS.ADD}${cardId}${balanceAfterDeposit}`;
          generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
          serialPort.write(Buffer.from(`${message}${generatedChecksum}`, 'hex'), 'hex', cbLogging);

          if (DEBUG) {
            console.log(
              `${getTimestamp()} ADD     ${cardId} balance after deposit ${parseInt(balanceAfterDeposit, 16)}`,
            ); 
            prettyPrintMessage(Buffer.from(`${message}${generatedChecksum}`, 'hex'), 'SENT    ');
          }
          break;

        case COMMANDS.DECREASE:
          try {
            balanceAfterWithdraw = await withdraw({ amount: credits, authToken, cardId });
            message = `${START}${COMMANDS.DECREASE}${cardId}${balanceAfterWithdraw}`;
            generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
            serialPort.write(Buffer.from(`${message}${generatedChecksum}`, 'hex'), 'hex', cbLogging);

            if (DEBUG) {
              console.log(
                `${getTimestamp()} DECREASE ${cardId} balance after withdraw ${parseInt(balanceAfterWithdraw, 16)}`,
              );
              prettyPrintMessage(Buffer.from(`${message}${generatedChecksum}`, 'hex'), 'SENT    ');
            }
          } catch (err) {
            console.log(getTimestamp(), err)
          }
          break;

        case COMMANDS.CRC_ERROR:
          if (DEBUG) console.log(`${getTimestamp()}: CRC_ERROR`);
          break;

        default:
          console.log(`${getTimestamp()} NO_COMMAND_MATCH_ERROR`);
          serialPort.write(NO_COMMAND_MATCH_ERROR);
      }

    } else {
      if (DEBUG) {
        console.log(
          `${getTimestamp()} Message 0x${data
            .toString('hex')} has wrong checksum`,
        );
      }
      // Returns a pre-defined error when the checksum is incorrect
      serialPort.write(CHECKSUM_ERROR);
      serialPort.flush(cbLogging)
    }
  });

  // So the program will not close instantly
  process.stdin.resume();
  const exitHandler = () => {
    if (serialPort.isOpen) {
      serialPort.close(cbLogging);
      console.log(`SerialPort ${serialPort.path} with baud rate ${serialPort.baudRate} is closed`);
    }
    process.exit();
  }
  // On regular app exit
  process.on('exit', exitHandler);
  // Catches ctrl+c event
  process.on('SIGINT', exitHandler);
  // Catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);
  // Catches uncaught exceptions
  process.on('uncaughtException', exitHandler);
};
