
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Joi = require('joi'); // use Joi to validate req object on POST/PUT requests
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const authentication = require('./middlewares/authentication');
const config = require('./configuration/config');

const app = express();

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
// createTransaction();

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
        .or([ { value: 1 }, { currentBalance: 0 } ])
        .limit(20)
        .sort({ value: 1 })
        .select({ date: 1, value: 1 })
    console.log(result)
};
getTransactions();

const port = process.env.port || 3000

// Set secret
app.set('Secret', config.secret);

// Express middlewares

// Helps secure the app by setting various http headers
app.use(helmet());

// Use morgan to log requests to the console
app.use(morgan('dev'));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Process res body as JSON
app.use(express.json());

// Routes
const ProtectedRoutes = express.Router(); 
app.use('/api', ProtectedRoutes);

ProtectedRoutes.use((req, res, next) => {
  // Check the header for the token
  const token = req.get('access-token');
  if (token) {
    // Verifies secret and checks if the token is expired
    jwt.verify(token, app.get('Secret'), (err, decoded) => {
      if (err) {
        return res.status(401).send(`Invalid authentication token on ${req.baseUrl}`);
      } else {
        // If everything is good, save to the request so it can be used in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).send(`No authentication token provided on ${req.method} ${req.originalUrl}`);
  }
});

app.get('/', (req, res) => res.send('<h1>Car Wash API</h1>'));

app.post('/authenticate', (req, res) => {
  if (req.body.username === 'admin' && req.body.password === '12345') {
    const payload = { check: true };
    const token = jwt.sign(payload, app.get('Secret'), { expiresIn: 1440 }); // expires in 24h
    
    res.json({ message: 'Authentication done', token });
  } else {
    res.status(401).send('Password or Username not found');
  }
});

ProtectedRoutes.get('/cards', (req, res) => {
  res.send('All Cards');
});

ProtectedRoutes.post('/cards', (req, res) => {
  res.send(`Card has been created with id 1`);
});

ProtectedRoutes.get('/cards/:id', (req, res) => {
  res.send(`Get card with id #${req.params.id}`);
});

ProtectedRoutes.get('/cards/:id/balance', (req, res) => {
  res.send(`The balance of card #${req.params.id} is ${req.params.id * 1.33} credits`);
});

ProtectedRoutes.post('/cards/:id/deposit', (req, res) => {
  res.send(`Deposited to card #${req.params.id}, ${req.params.id * 0.63} credits`);
});

ProtectedRoutes.post('/cards/:id/withdraw', (req, res) => {
  res.send(`Withdrew from card #${req.params.id}, ${req.params.id * 0.77} credits`);
});

app.listen(port, () => console.log(`App listening on port ${port}`));
