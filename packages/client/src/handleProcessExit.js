import getTimestamp from './getTimestamp.js';

export default (serialPort) => {
  // So the program will not close instantly
  process.stdin.resume();
  const exitHandler = () => {
    if (serialPort.isOpen) {
      serialPort.close(error => {
        if (error) console.log(getTimestamp(), error);  
      });
      console.log(`SerialPort ${serialPort.path} with baud rate ${serialPort.baudRate} is closed`);
    }
    process.exit();
  };
  // On regular app exit
  process.on('exit', exitHandler);
  // Catches ctrl+c event
  process.on('SIGINT', exitHandler);
  // Catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);
  // Catches uncaught exceptions
  process.on('uncaughtException', exitHandler);
}
