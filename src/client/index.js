import SerialPort from 'serialport';
// eslint-disable-next-line import/no-extraneous-dependencies
import MockBinding from '@serialport/binding-mock';

export default () => {
  SerialPort.Binding = MockBinding;
  MockBinding.createPort('/dev/tty.SerialPort', { echo: true, record: true });

  const port = new SerialPort('/dev/tty.SerialPort', { baudRate: 115200 }, err => {
    if (err) console.log(err);
    console.log(`Listening on serial port ${port.path}`);
  });

  port.write([171, 86, 1, 1, 123, 175, 31, 104, 1, 14, 217, 192], err => {
    if (err) console.log('Error on write: ', err.message);
  });

  // Switches the port into "flowing mode"
  port.on('data', data => {
    console.log('Data:', data);
  });
};
