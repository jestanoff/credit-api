import jwt from 'jsonwebtoken';
import authorization from './authorization';

jest.mock('jsonwebtoken');

describe('Authorization', () => {
  const mocks = {};

  beforeEach(() => {
    mocks.send = jest.fn();
    mocks.req = {
      app: { get: jest.fn(() => 'TopSecret') },
      baseUrl: 'url',
      get: jest.fn(() => 'ShinyToken'),
    };
    mocks.res = { status: jest.fn(() => ({ send: mocks.send })) };
    mocks.next = jest.fn();
  });

  afterEach(jest.clearAllMocks);

  test('should get the token from Authorization header', () => {
    authorization(mocks.req, mocks.res, mocks.next);

    expect(mocks.req.get).toBeCalledTimes(1);
    expect(mocks.req.get).toBeCalledWith('Authorization');
  });

  test('should respond with 401 and "No authentication token provided" if not token is presented in the headers', () => {
    mocks.req = { get: jest.fn(() => null) };
    authorization(mocks.req, mocks.res, mocks.next);

    expect(mocks.res.status).toBeCalledTimes(1);
    expect(mocks.res.status).toBeCalledWith(401);
    expect(mocks.send).toBeCalledTimes(1);
    expect(mocks.send).toBeCalledWith('No authentication token provided');
  });

  test('should verify the token', () => {
    authorization(mocks.req, mocks.res, mocks.next);

    expect(jwt.verify).toBeCalledTimes(1);
    expect(jwt.verify).toBeCalledWith('ShinyToken', 'TopSecret', expect.any(Function));
    expect(mocks.req.app.get).toBeCalledTimes(1);
    expect(mocks.req.app.get).toBeCalledWith('Secret');
  });

  test('should respond with 401 and message when the token is invalid', () => {
    authorization(mocks.req, mocks.res, mocks.next);
    const callback = jwt.verify.mock.calls[0][2];
    callback(Error('any'), 'decoded');

    expect(mocks.res.status).toBeCalledTimes(1);
    expect(mocks.res.status).toBeCalledWith(401);
    expect(mocks.send).toBeCalledTimes(1);
    expect(mocks.send).toBeCalledWith('Invalid authentication token on url');
  });

  test('should add the decoded token to the request object and call next middleware', () => {
    authorization(mocks.req, mocks.res, mocks.next);
    const callback = jwt.verify.mock.calls[0][2];
    callback(undefined, 'decoded');

    expect(mocks.req.decoded).toBe('decoded');
    expect(mocks.next).toBeCalledTimes(1);
  });
});
