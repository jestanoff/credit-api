import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';
import helmet from 'helmet';
import server from './index.js';

jest.mock('express', () => {
  const exp = jest.fn();
  exp.json = jest.fn().mockReturnValue('JSON parsed');
  exp.Router = jest.fn();
  exp.urlencoded = jest.fn().mockReturnValue('urlencoded');
  return exp;
});
jest.mock('morgan', () => jest.fn(() => 'log requests'));
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: { on: jest.fn(), once: jest.fn() },
}));
jest.mock('https', () => ({ createServer: jest.fn() }));
jest.mock('fs', () => ({ readFileSync: jest.fn() }));
jest.mock('helmet', () => jest.fn(() => 'http headers has been set'));
jest.mock('./middlewares/authentication.js', () => 'authentication route');
jest.mock('./middlewares/authorization.js', () => 'authorization middleware');
jest.mock('./routes/card.js', () => ({
  balance: 'card.balance',
  create: 'card.create',
  deposit: 'card.deposit',
  list: 'card.list',
  show: 'card.show',
  withdraw: 'card.withdraw',
}));
jest.mock('./routes/homepage.js', () => 'homepage route');
jest.mock('./configuration/config.js', () => ({
  dbPassword: 'db password',
  secret: 'auth secret',
}));

describe('Server entry point', () => {
  const mocks = {
    app: {
      get: jest.fn(),
      post: jest.fn(),
      set: jest.fn(),
      use: jest.fn(),
    },
    listen: jest.fn(),
    protectedRoutes: {
      get: jest.fn(),
      post: jest.fn(),
      use: jest.fn(),
    },
  };

  beforeEach(() => {
    fs.readFileSync.mockReturnValueOnce('key').mockReturnValueOnce('cert');
    process.env = { DB: 'mongodb uri', PORT: '8000' };
    https.createServer.mockImplementation(() => ({ listen: mocks.listen }));
    express.mockReturnValue(mocks.app);
    express.Router.mockReturnValue(mocks.protectedRoutes);
    console.log = jest.fn();

    server();
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.log.mockRestore();
  });

  describe('Express app', () => {
    test('should setup initialize application', () => {
      expect(express).toHaveBeenCalledTimes(1);
      expect(express).toHaveBeenCalledWith();
    });

    test('should set authentication secret', () => {
      expect(mocks.app.set).toHaveBeenCalledTimes(1);
      expect(mocks.app.set).toHaveBeenCalledWith('Secret', 'auth secret');
    });

    test('should use helmet middleware to secure the app via http headers', () => {
      expect(mocks.app.use).toHaveBeenCalledTimes(5);
      expect(helmet).toHaveBeenCalledTimes(1);
      expect(mocks.app.use).nthCalledWith(1, 'http headers has been set');
    });

    test('should use morgan middleware in dev mode to log request on the console', () => {
      expect(morgan).toHaveBeenCalledTimes(1);
      expect(morgan).toHaveBeenCalledWith('dev');
      expect(mocks.app.use).nthCalledWith(2, 'log requests');
    });

    test('should use urlencoded middleware to parse application/x-www-form-urlencoded requests', () => {
      expect(express.urlencoded).toHaveBeenCalledTimes(1);
      expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });
      expect(mocks.app.use).nthCalledWith(3, 'urlencoded');
    });

    test('should use json middleware to parse body responses as JSON', () => {
      expect(express.json).toHaveBeenCalledTimes(1);
      expect(express.json).toHaveBeenCalledWith();
      expect(mocks.app.use).nthCalledWith(4, 'JSON parsed');
    });

    test('should create a https server', () => {
      expect(https.createServer).toHaveBeenCalledTimes(1);
      expect(https.createServer).toHaveBeenCalledWith({
        key: 'key',
        cert: 'cert',
      }, mocks.app);
    });

    test('should setup listener with the httpsServer', () => {
      expect(mocks.listen).toHaveBeenCalledTimes(1);
      expect(mocks.listen).toHaveBeenCalledWith(8000, expect.any(Function));
    });

    test('should listen to port 443 if no process.env.port is passed', () => {
      process.env.PORT = undefined;
      jest.clearAllMocks();
      server();

      expect(mocks.listen).toHaveBeenCalledWith(443, expect.any(Function));
    });

    test('should log the app URI once the https server is up', () => {
      jest.clearAllMocks();
      server();
      const callback = mocks.listen.mock.calls[0][1];
      callback();

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('App listening on https://localhost:8000/');
    });
  });

  describe('Routes setup', () => {
    test("should use the homepage route for GET requests to '/'", () => {
      expect(mocks.app.get).toHaveBeenCalledTimes(1);
      expect(mocks.app.get).toHaveBeenCalledWith('/', 'homepage route');
    });

    test("should use the authentication route for POST requests to '/authenticate'", () => {
      expect(mocks.app.post).toHaveBeenCalledTimes(1);
      expect(mocks.app.post).toHaveBeenCalledWith('/authenticate', 'authentication route');
    });

    test('should create new router for protected routes', () => {
      expect(express.Router).toHaveBeenCalledTimes(1);
    });

    test("should prefix any of the protected routes with '/api'", () => {
      expect(mocks.app.use).nthCalledWith(5, '/api', mocks.protectedRoutes);
    });

    test("should hook 'authorization' middleware to all requests under '/api'", () => {
      expect(mocks.protectedRoutes.use).toHaveBeenCalledTimes(1);
      expect(mocks.protectedRoutes.use).toHaveBeenCalledWith('authorization middleware');
    });

    test("should use card.list route for GET requests to '/cards'", () => {
      expect(mocks.protectedRoutes.get).toHaveBeenCalledTimes(3);
      expect(mocks.protectedRoutes.get).nthCalledWith(1, '/cards', 'card.list');
    });

    test("should use card.create route for POST requests to '/cards/:id'", () => {
      expect(mocks.protectedRoutes.post).toHaveBeenCalledTimes(3);
      expect(mocks.protectedRoutes.post).nthCalledWith(1, '/cards/:id', 'card.create');
    });

    test("should use card.show route for GET requests to '/cards/:id'", () => {
      expect(mocks.protectedRoutes.get).nthCalledWith(2, '/cards/:id', 'card.show');
    });

    test("should use card.balance route for GET requests to '/cards/:id'", () => {
      expect(mocks.protectedRoutes.get).nthCalledWith(3, '/cards/:id/balance', 'card.balance');
    });

    test("should use card.deposit route for POST requests to '/cards/:id/deposit'", () => {
      expect(mocks.protectedRoutes.post).nthCalledWith(2, '/cards/:id/deposit', 'card.deposit');
    });

    test("should use card.withdraw route for POST requests to '/cards/:id/withdraw'", () => {
      expect(mocks.protectedRoutes.post).nthCalledWith(3, '/cards/:id/withdraw', 'card.withdraw');
    });
  });

  describe('Database', () => {
    test('should connect to the database', () => {
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb uri', {
        password: 'db password',
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
      });
    });

    test('should connect to the database with the default DB URI ', () => {
      process.env.DB = undefined;
      jest.clearAllMocks();
      server();

      expect(mongoose.connect).toHaveBeenCalledTimes(1);
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/carwash', expect.any(Object));
    });

    test('should log an error on db fail', () => {
      expect(mongoose.connection.on).toHaveBeenCalledTimes(1);
      expect(mongoose.connection.on).toHaveBeenCalledWith('error', console.error);
    });

    test('should log a successful message', () => {
      const callback = mongoose.connection.once.mock.calls[0][1];
      callback();

      expect(mongoose.connection.once).toHaveBeenCalledTimes(1);
      expect(mongoose.connection.once).toHaveBeenCalledWith('open', expect.any(Function));
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('Connected to MongoDB');
    });
  });
});
