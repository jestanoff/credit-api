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
  exp.Router = jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    use: jest.fn(),
  }));
  exp.urlencoded = jest.fn().mockReturnValue('urlencoded');

  return exp;
});
jest.mock('morgan', () => jest.fn(() => 'log requests'));
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    on: jest.fn(),
    once: jest.fn(),
  },
}));
jest.mock('https', () => ({ createServer: jest.fn() }));
jest.mock('fs', () => ({ readFileSync: jest.fn() }));
jest.mock('helmet', () => jest.fn(() => 'http headers has been set'));
jest.mock('./middlewares/authorization.js', () => 'authorization route');
jest.mock('./middlewares/authentication.js', () => 'authentication route');
jest.mock('./routes/card.js', () => ({
  balance: jest.fn(),
  create: jest.fn(),
  deposit: jest.fn(),
  list: jest.fn(),
  show: jest.fn(),
  withdraw: jest.fn(),
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
  };

  beforeEach(() => {
    fs.readFileSync.mockReturnValue('cert');
    fs.readFileSync.mockReturnValueOnce('key');
    process.env = { db: 'mongodb uri', port: '443' };
    https.createServer.mockImplementation(() => ({ listen: mocks.listen }));
    express.mockReturnValue(mocks.app);

    server();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Express app', () => {
    test('should setup initialize application', () => {
      express.mockClear();
      server();

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
      expect(mocks.listen).toHaveBeenCalledWith(443, expect.any(Function));
    });
  });

  describe('Routes setup', () => {
    test("should prefix any of the protected routes with '/api'", () => {
      expect(mocks.app.use).nthCalledWith(5, '/api', {
        get: expect.any(Function),
        post: expect.any(Function),
        use: expect.any(Function),
      });
    });

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

    test('should log an error on db fail', () => {
      expect(mongoose.connection.on).toHaveBeenCalledTimes(1);
      expect(mongoose.connection.on).toHaveBeenCalledWith('error', console.error);
    });

    test('should log a successful message', () => {
      expect(mongoose.connection.once).toHaveBeenCalledTimes(1);
      expect(mongoose.connection.once).toHaveBeenCalledWith('open', expect.any(Function));
    });
  });
});
