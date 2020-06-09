import fs from 'fs';
import util from 'util';
import path from 'path';


const debugFile = path.resolve(path.dirname(''), 'debug.log');
const logFile = fs.createWriteStream(debugFile, { flags : 'a'});

// Write to log file as well as to the console
export default (...args) => {
  // console.log(...args);
  logFile.write(util.format(...args) + '\n');
  console.log(util.format(...args));
}
