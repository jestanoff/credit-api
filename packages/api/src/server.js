import express from 'express';
import morgan from 'morgan';
// import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';
import helmet from 'helmet';
// import Joi from 'joi'; // use Joi to validate req object on POST/PUT requests
import authentication from './middlewares/authentication.js';
import authorization from './middlewares/authorization.js';
import config from './configuration/config.js';
import * as card from './routes/card.js';
import homepage from './routes/homepage.js';


const server = () => {
  const app = express();
  // const dbUri = process.env.DB || 'mongodb://localhost:27017/carwash';
  const port = Number(process.env.PORT) || 443;

  app.set('Secret', config.secret); // Sets authentication secret

  // Database setup
  // mongoose.connect(dbUri, {
  //   password: config.dbPassword,
  //   useCreateIndex: true,
  //   useFindAndModify: false,
  //   useNewUrlParser: true,
  // });
  // mongoose.connection.on('error', console.error);
  // mongoose.connection.once('open', () => console.log('Connected to MongoDB'));

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
  ProtectedRoutes.post('/cards/:id', card.create);
  ProtectedRoutes.get('/cards/:id', card.show);
  ProtectedRoutes.get('/cards/:id/balance', card.balance);
  ProtectedRoutes.post('/cards/:id/deposit', card.deposit);
  ProtectedRoutes.post('/cards/:id/withdraw', card.withdraw);

  https.createServer({
    // Generate valid certs from https://letsencrypt.org/
    cert: fs.readFileSync('server.cert'),
    key: fs.readFileSync('server.key'),
  }, app).listen(port, () => console.log(`App listening on https://localhost:${port}/`));
};

export default server;
