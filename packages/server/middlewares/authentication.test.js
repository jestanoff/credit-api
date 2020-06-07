import jwt from 'jsonwebtoken';
import authentication from './authentication';

jest.mock('jsonwebtoken');

describe('Authentication', () => {
  const mocks = {
    json: jest.fn(),
    send: jest.fn(),
  };

  beforeEach(() => {
    mocks.req = {
      body: { username: 'admin', password: '12345' },
      app: { get: jest.fn().mockReturnValue('TopSecret') },
    };
    mocks.res = {
      status: jest.fn(() => ({ json: mocks.json, send: mocks.send })),
    };
  });

  afterEach(jest.clearAllMocks);

  test('should respond with status 401 and "Password or Username not found", if username is not matching', () => {
    mocks.req.body.username = 'username';
    authentication(mocks.req, mocks.res);

    expect(mocks.res.status).toBeCalledTimes(1);
    expect(mocks.res.status).toBeCalledWith(401);
    expect(mocks.send).toBeCalledTimes(1);
    expect(mocks.send).toBeCalledWith('Password or Username not found');
  });

  test('should respond with status 401 and "Password or Username not found", if password is not matching', () => {
    mocks.req.body.password = 'password';
    authentication(mocks.req, mocks.res);

    expect(mocks.res.status).toBeCalledTimes(1);
    expect(mocks.res.status).toBeCalledWith(401);
    expect(mocks.send).toBeCalledTimes(1);
    expect(mocks.send).toBeCalledWith('Password or Username not found');
  });

  test('should sign the auth token', () => {
    authentication(mocks.req, mocks.res);

    expect(jwt.sign).toBeCalledTimes(1);
    expect(jwt.sign).toBeCalledWith({ userId: '1234' }, 'TopSecret', { expiresIn: '24h' }, expect.any(Function));
  });

  test('should throw an error if there is a problem with signing the token', () => {
    authentication(mocks.req, mocks.res);
    const callback = jwt.sign.mock.calls[0][3];

    expect(() => callback(new Error('Big problem'))).toThrow(new Error('Big problem'));
  });

  test('should respond with status of 201 and a json with a message and the token itself', () => {
    authentication(mocks.req, mocks.res);
    const callback = jwt.sign.mock.calls[0][3];
    callback(null, 'signedToken');

    expect(mocks.res.status).toBeCalledTimes(1);
    expect(mocks.res.status).toBeCalledWith(201);
    expect(mocks.json).toBeCalledTimes(1);
    expect(mocks.json).toBeCalledWith({ message: 'Authentication successful', token: 'signedToken' });
  });
});
