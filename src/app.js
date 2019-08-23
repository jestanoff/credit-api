/* eslint-disable no-console */
import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
// import Joi from 'joi'; // use Joi to validate req object on POST/PUT requests
import helmet from 'helmet';
import authorization from './middlewares/authorization.js';
import authentication from './middlewares/authentication.js';
import config from './configuration/config.js';
import * as card from './routes/card.js';
import homepage from './routes/homepage.js';

const app = express();
const port = process.env.port || 3000;
app.set('Secret', config.secret); // Sets authentication secret

// Database
mongoose.connect('mongodb://localhost/carwash', { useNewUrlParser: true })
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.log('could not connect to MongoDB', err));

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
  currentBalance: Number,
  date: { type: Date, default: Date.now },
  value: Number,
}));
const transaction = new Transaction({
  currentBalance: 0,
  value: 1,
});

const createTransaction = async () => {
  const result = await transaction.save();
  console.log(result);
};
createTransaction();

const getTransactions = async () => {
  /* COMPARISON */
  // eq (equal)
  // ne (not equal)
  // gt (greater than)
  // gte (greater than or equal to)
  // lt (less than)
  // lte (less than or equal to)
  // in (one of array of values)
  // nin (not in)
  /* LOGICAL */
  // or
  // and
  const result = await Transaction
    .find({ value: { $gte: 0, $lte: 1 } })
    .or([{ value: 1 }, { currentBalance: 0 }])
    .limit(20)
    .sort({ value: 1 })
    .select({ date: 1, value: 1 });
  console.log(result);
};
getTransactions();


// Middlewares
app.use(helmet()); // Helps secure the app by setting various http headers

app.use(morgan('dev')); // Use morgan to log requests to the console

app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

app.use(express.json()); // Process res body as JSON

// Routes
app.get('/', homepage);
app.post('/authenticate', authentication);

const ProtectedRoutes = express.Router();
app.use('/api', ProtectedRoutes);

ProtectedRoutes.use(authorization);
ProtectedRoutes.get('/cards', card.list);
ProtectedRoutes.post('/cards', card.create);
ProtectedRoutes.get('/cards/:id', card.show);
ProtectedRoutes.get('/cards/:id/balance', card.balance);
ProtectedRoutes.post('/cards/:id/deposit', card.deposit);
ProtectedRoutes.post('/cards/:id/withdraw', card.withdraw);

app.listen(port, () => console.log(`App listening on port ${port}`));
