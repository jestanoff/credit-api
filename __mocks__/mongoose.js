export const mocks = {
  find: jest.fn(),
  findOne: jest.fn().mockReturnValue({ cardId: 'singleCard' }),
  limit: jest.fn().mockReturnValue([{ id: 1 }, { id: 2 }]),
  path: jest.fn(),
  save: jest.fn(),
};

const mock = {
  model: jest.fn().mockImplementation(() => ({
    find: mocks.find.mockImplementation(() => ({ limit: mocks.limit })),
    findOne: mocks.findOne,
    save: mocks.save,
  })),
  Schema: jest.fn().mockImplementation((definition, options) => ({
    definition,
    path: mocks.path,
    options,
  })),
};

export default mock;
