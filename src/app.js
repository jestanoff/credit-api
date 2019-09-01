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

// Database setup
mongoose.connect('mongodb://localhost:27017/carwash', {
  password: config.dbPassword,
  useCreateIndex: true,
  useNewUrlParser: true,
  username: config.dbUsername,
});
mongoose.connection.on('error', console.error);
mongoose.connection.once('open', () => console.log('connected to MongoDB'));

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
ProtectedRoutes.post('/cards/:barcode', card.create);
ProtectedRoutes.get('/cards/:barcode', card.show);
ProtectedRoutes.get('/cards/:barcode/balance', card.balance);
ProtectedRoutes.post('/cards/:barcode/deposit', card.deposit);
ProtectedRoutes.post('/cards/:barcode/withdraw', card.withdraw);

app.listen(port, () => console.log(`App listening on port ${port}`));
