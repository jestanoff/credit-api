import homepage from './homepage';

describe('Homepage route', () => {
  const mocks = { res: {} };

  beforeEach(() => {
    mocks.send = jest.fn();
    mocks.res.status = jest.fn().mockReturnValue({ send: mocks.send });

    homepage(null, mocks.res);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should respond with status 200', () => {
    expect(mocks.res.status).toBeCalledTimes(1);
    expect(mocks.res.status).toBeCalledWith(200);
  });

  test('should respond html', () => {
    expect(mocks.send).toBeCalledTimes(1);
    expect(mocks.send).toBeCalledWith('<h1>Car Wash API</h1>');
  });
});
