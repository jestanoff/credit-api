export const mocks = {
  find: jest.fn(),
  findOne: jest.fn().mockReturnValue({ balance: 0, cardId: 'singleCard' }),
  findOneAndUpdate: jest.fn(({ cardId }, props) => ({ cardId, ...props })),
  instance: jest.fn(),
  limit: jest.fn().mockReturnValue([{ id: 1 }, { id: 2 }]),
  path: jest.fn(),
  save: jest.fn(),
};

const mock = {
  model: jest.fn().mockImplementation(() => {
    const instance = mocks.instance.mockImplementation(() => ({ save: mocks.save }));
    instance.find = mocks.find.mockImplementation(() => ({ limit: mocks.limit }));
    instance.findOne = mocks.findOne;
    instance.findOneAndUpdate = mocks.findOneAndUpdate;
    return instance;
  }),
  Schema: jest.fn().mockImplementation((definition, options) => ({
    definition,
    path: mocks.path,
    options,
  })),
};

export default mock;
