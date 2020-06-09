import SerialPort from 'serialport';
import InterByteTimeout from '@serialport/parser-inter-byte-timeout';
import childProcess from 'child_process';
import axios from 'axios';

import authenticate from './requests/authenticate.js';
import bufferToText from './bufferToText.js';
import calcChecksum from './calcChecksum.js';
import deposit from './requests/deposit.js';
import getBalance from './requests/getBalance.js';
import getTimestamp from './getTimestamp.js';
import handleProcessExit from './handleProcessExit.js';
import hexRequestParser from './hexRequestParser.js';
import log from './log.js'
import portDetailsLogging from './portDetailsLogging.js'
import prettyPrintMessage from './prettyPrintMessage.js';
import withdraw from './requests/withdraw.js';
import writeToSerialPort from './writeToSerialPort.js'
import {
  CARD_NOT_FOUND_ERROR,
  CHECKSUM_ERROR,
  COMMANDS,
  DEPOSIT_OVERFLOW_ERROR,
  INSUFFICIENT_BALANCE_ERROR,
  MAX_DEPOSIT,
  REQUEST_TIMEOUT,
  SERIAL_PORT_PATH,
  START_BYTES,
} from './constants.js';

// 5 seconds request timeout for API
axios.defaults.timeout = REQUEST_TIMEOUT;

// TODO: Remove once we got real certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const DEBUG = process.env.DEBUG || false;

export default async () => {
  let authToken;
  let newCredits;
  let time;

  // Exit if there is no SerialPort to connect to
  const serialPortList = await SerialPort.list();
  if (!serialPortList.some(port => port.path === SERIAL_PORT_PATH)) {
    throw new Error(`Serial port ${SERIAL_PORT_PATH} not available`);
  }

  const serialPort = new SerialPort(SERIAL_PORT_PATH, { baudRate: 115200 });
  const parser = serialPort.pipe(new InterByteTimeout({ interval: 5 }));

  serialPort.on('open', () => {
    portDetailsLogging(serialPort);
    // Flush the serialPort in case there is stale data there
    serialPort.flush();
    serialPort.resume();
  });

  serialPort.on('close', () => log(`${getTimestamp()} SerialPort closed`));

  serialPort.on('error', (err) => {
    portDetailsLogging(serialPort);
    log(`${getTimestamp()} SerialPort error`, err);

    if (!serialPort.isOpen) {
      // If the serialPort is closed kill the process using it
      const cmd = `kill -9 $(fuser ${SERIAL_PORT_PATH} | awk '{print $0}')`;
      childProcess.exec(cmd, (error, stdout, stderr) => {
        if (error) log(`Node could not kill the process using cmd "${cmd}"`);
        if (stdout) log(stdout);
        if (stderr) log(stderr);
        serialPort.open();
      });
    }
  });

  serialPort.on('drain', () => log(`${getTimestamp()} SerialPort drained`));

  // Authenticate once the application starts
  authToken = await authenticate();

  // Switches the port into 'flowing mode'
  parser.on('data', async data => {
    time = Date.now();
    const { cardId, command, credits, start } = hexRequestParser(data);

    if (DEBUG) prettyPrintMessage(data, 'RECEIVED');

    // Discard anything that is not valid response
    if (start !== START_BYTES) {
      const text = bufferToText(data);
      // On embedded device start-up and shutdown there are info messages
      if (text.length >= 2) log(getTimestamp(), text);
      return undefined; 
    }

    if (!authToken) {
      // Re-authenticate when the token expires
      authToken = await authenticate();

      if (!authToken) {
        log(`${getTimestamp()} Could not get API authentication token`)
        return undefined;
      }
    }

    // Validate bytes sequence
    if (calcChecksum(data) === 0) {
      switch (command) {
        case COMMANDS.READ:
          try {
            newCredits = await getBalance({ authToken, cardId });
            writeToSerialPort(serialPort, command, cardId, newCredits, time);
          } catch (err) {
            if (err.response) {
              log(`${getTimestamp()} ERROR ${err.response.status} ${err.response.statusText}`);
            } else {
              log(getTimestamp(), err);
            }
          }
          break;

        case COMMANDS.ADD:
          // Validates the amount to deposit
          newCredits = credits > MAX_DEPOSIT ?
            DEPOSIT_OVERFLOW_ERROR :
            await deposit({ amount: credits, authToken, cardId });
          writeToSerialPort(serialPort, command, cardId, newCredits, time);
          break;

        case COMMANDS.DECREASE:
          try {
            newCredits = await withdraw({ amount: credits, authToken, cardId });
            writeToSerialPort(serialPort, command, cardId, newCredits, time);
          } catch (err) {
            if (err.response && err.response.data && ['INSUFFICIENT_BALANCE', 'CARD_NOT_FOUND'].includes(err.response.data.code)) {
              newCredits = err.response.data.code === 'CARD_NOT_FOUND' ? CARD_NOT_FOUND_ERROR : INSUFFICIENT_BALANCE_ERROR
              writeToSerialPort(serialPort, command, cardId, newCredits, time);
            } else {
              log(`${getTimestamp()} ERROR ${err.response.status} ${err.response.statusText}`);
            }
          }
          break;
        default:
      }
    } else {
      writeToSerialPort(serialPort, command, cardId, CHECKSUM_ERROR, time);
      serialPort.flush();
    }
  });

  handleProcessExit(serialPort);
};
