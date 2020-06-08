import SerialPort from 'serialport';
import InterByteTimeout from '@serialport/parser-inter-byte-timeout';
import childProcess from 'child_process';
import axios from 'axios';

import hexRequestParser from './hexRequestParser.js';
import authenticate from './requests/authenticate.js';
import getBalance from './requests/getBalance.js';
import deposit from './requests/deposit.js';
import withdraw from './requests/withdraw.js';
import calcChecksum from './calcChecksum.js';
import getTimestamp from './getTimestamp.js';
import prettyPrintMessage from './prettyPrintMessage.js';
import bufferToText from './bufferToText.js';
import handleProcessExit from './handleProcessExit.js';
import {
  CARD_NOT_FOUND_ERROR,
  CHECKSUM_ERROR,
  COMMANDS,
  DEPOSIT_OVERFLOW_ERROR,
  INSUFFICIENT_BALANCE_ERROR,
  MAX_DEPOSIT,
  SERIAL_PORT_PATH,
  START_BYTES,
} from './constants.js';

// 5 seconds request timeout for API
axios.defaults.timeout = 5000;

// TODO: Remove once we got real certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const DEBUG = process.env.DEBUG || false;

const cbLogging = error => {
  if (error) console.log(getTimestamp(), error);
};

const portDetailsLogging = port => {
  console.log('serialPort.baudRate', port.baudRate);
  console.log('serialPort.isOpen', port.isOpen);
  console.log('serialPort.path', port.path);
};

export default async () => {
  let authToken;
  let balance;
  let duration;
  let generatedChecksum;
  let message;

  // Exit if there is no SerialPort to connect to
  const serialPortList = await SerialPort.list();
  if (!serialPortList.some(port => port.path === SERIAL_PORT_PATH)) {
    throw new Error(`Serial port ${SERIAL_PORT_PATH} not available`);
  }

  const serialPort = new SerialPort(SERIAL_PORT_PATH, { baudRate: 115200 });
  const parser = serialPort.pipe(new InterByteTimeout({ interval: 5 }));

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
      childProcess.exec(cmd, (error, stdout, stderr) => {
        if (error) console.log(`Node could not kill the process using cmd "${cmd}"`);
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

  // Switches the port into 'flowing mode'
  parser.on('data', async data => {
    duration = Date.now();
    const { cardId, command, credits, start } = hexRequestParser(data);

    if (DEBUG) prettyPrintMessage(data, 'RECEIVED');

    // Discard anything that is not valid response
    if (start !== START_BYTES) {
      const text = bufferToText(data);
      if (text.length >= 2) console.log(getTimestamp(), text);
      return undefined; 
    }

    if (!authToken) {
      // Try to re-authenticate in case the token has expired
      authToken = await authenticate();

      if (!authToken) {
        // If that is not possible bail out
        console.log(`${getTimestamp()} Could not get authentication token`)
        return undefined;
      }
    }

    // Validate the bytes sequence
    if (calcChecksum(data) === 0) {
      switch (command) {
        case COMMANDS.READ:
          try {
            balance = await getBalance({ authToken, cardId });
            message = `${START_BYTES}${COMMANDS.READ}${cardId}${balance}`;
            generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
            message = Buffer.from(`${message}${generatedChecksum}`, 'hex');
            serialPort.write(message, 'hex', cbLogging);
            prettyPrintMessage(message, 'DECREASE', Date.now() - duration);
          } catch (err) {
            console.log(getTimestamp(), err);
          }
          break;

        case COMMANDS.ADD:
          const depositAmount = parseInt(credits, 16);
          // Validates the amount to deposit
          if (depositAmount > MAX_DEPOSIT) {
            message = `${START_BYTES}${COMMANDS.ADD}${cardId}${DEPOSIT_OVERFLOW_ERROR}`;
            generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
          } else {
            balance = await deposit({ amount: depositAmount, authToken, cardId });
            message = `${START_BYTES}${COMMANDS.ADD}${cardId}${balance}`;
            generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
          }
          message = Buffer.from(`${message}${generatedChecksum}`, 'hex');
          serialPort.write(message, 'hex', cbLogging);
          prettyPrintMessage(message, depositAmount > MAX_DEPOSIT ? 'DEPOSIT_OVERFLOW_ERROR' : 'ADD' , Date.now() - duration);
          break;

        case COMMANDS.DECREASE:
          try {
            balance = await withdraw({ amount: parseInt(credits, 16), authToken, cardId });
            message = `${START_BYTES}${COMMANDS.DECREASE}${cardId}${balance}`;
            generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
            message = Buffer.from(`${message}${generatedChecksum}`, 'hex');
            serialPort.write(message, 'hex', cbLogging);
            prettyPrintMessage(message, 'DECREASE', Date.now() - duration);
          } catch (err) {
            if (err.response && err.response.data && ['INSUFFICIENT_BALANCE', 'CARD_NOT_FOUND'].includes(err.response.data.code)) {
              message = 
                `${START_BYTES}${COMMANDS.DECREASE}${cardId}${err.response.data.code === 'CARD_NOT_FOUND' ? CARD_NOT_FOUND_ERROR : INSUFFICIENT_BALANCE_ERROR}`;
              generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
              message = Buffer.from(`${message}${generatedChecksum}`, 'hex');
              serialPort.write(message, 'hex', cbLogging);
              prettyPrintMessage(message, err.response.data.code, Date.now() - duration);
              break;
            }
            console.log(`${getTimestamp()} ERROR ${err.response.status} ${err.response.statusText}`);
          }
          break;
        default:
      }
    } else {
      message = `${START_BYTES}${command}${cardId}${CHECKSUM_ERROR}`;
      generatedChecksum = calcChecksum(Buffer.from(message, 'hex'));
      message = Buffer.from(`${message}${generatedChecksum}`, 'hex');
      serialPort.write(message, 'hex', cbLogging);
      serialPort.flush(cbLogging);
      prettyPrintMessage(message, 'CHECKSUM_ERROR', Date.now() - duration);
    }
  });

  handleProcessExit(serialPort);
};
