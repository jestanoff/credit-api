import SerialPort from 'serialport';
import MockBinding from '@serialport/binding-mock';
import ByteLength from '@serialport/parser-byte-length';

SerialPort.Binding = MockBinding;
MockBinding.createPort('/dev/tty.SerialInputPort', { echo: false, readyData: '', record: true });
MockBinding.createPort('/dev/tty.SerialOutputPort', { echo: false, readyData: '', record: true });

const inputPort = new SerialPort('/dev/tty.SerialInputPort', { baudRate: 115200 });
const outputPort = new SerialPort('/dev/tty.SerialOutputPort', { baudRate: 115200 });
const parserInput = inputPort.pipe(new ByteLength({ length: 12 }));
const parserOutput = outputPort.pipe(new ByteLength({ length: 12 }));

inputPort.on('open', () => console.log('DEBUG input port opened'));
inputPort.on('close', () => console.log('DEBUG input port closed'));
inputPort.on('error', (err) => console.log('DEBUG input port err', err));
inputPort.on('drain', () => console.log('DEBUG input port drain'));

outputPort.on('open', () => console.log('DEBUG output port opened'));
outputPort.on('close', () => console.log('DEBUG output port closed'));
outputPort.on('error', (err) => console.log('DEBUG output port err', err));
outputPort.on('drain', () => console.log('DEBUG output port drain'));

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

runTestCommands(parserInput);
