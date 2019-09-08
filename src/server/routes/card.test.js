import * as card from './card';
import { createCard, getCards } from '../models/card.js';

jest.mock('../models/card.js', () => ({
  amendBalance: jest.fn().mockResolvedValue({ id: 5 }),
  createCard: jest.fn().mockResolvedValue({ id: 4 }),
  getCard: jest.fn().mockResolvedValue({ id: 3 }),
  getCards: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
}));

describe.only('card routes', () => {
  const mocks = {
    req: {},
    res: {},
  };
  const consoleGlobal = console;

  beforeEach(() => {
    console.error = jest.fn();
    mocks.json = jest.fn();
    mocks.res.status = jest.fn().mockReturnValue({ json: mocks.json });
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error = consoleGlobal;
  });

  describe('card.list', () => {
    beforeEach(() => {
      mocks.json = jest.fn();
      mocks.res.status = jest.fn().mockReturnValue({ json: mocks.json });

      card.list(mocks.req, mocks.res);
    });

    test('should query the db to get all cards', () => {
      expect.assertions(2);
      expect(getCards).toHaveBeenCalledTimes(1);
      expect(getCards).toHaveBeenCalledWith();
    });

    test('should respond with status 200', () => {
      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(200);
    });

    test('should return all cards to the client', () => {
      expect(mocks.json).toHaveBeenCalledTimes(1);
      expect(mocks.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    test('should log any error to the console', async () => {
      expect.assertions(1);
      jest.clearAllMocks();
      getCards.mockRejectedValue(new Error('any error'));
      await card.list(mocks.req, mocks.res);

      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('card.create', () => {
    test('should query the db to create a card', async () => {
      expect.assertions(2);
      mocks.req.params = { id: 99 };
      await card.create(mocks.req, mocks.res);

      expect(createCard).toHaveBeenCalledTimes(1);
      expect(createCard).toHaveBeenCalledWith(99);
    });

    test('should return the status 201 on success', async () => {
      expect.assertions(2);
      mocks.req.params = { id: 4 };
      await card.create(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(201);
    });

    test('should return the card as json on success', async () => {
      expect.assertions(2);
      mocks.req.params = { id: 4 };
      await card.create(mocks.req, mocks.res);

      expect(mocks.json).toHaveBeenCalledTimes(1);
      expect(mocks.json).toHaveBeenCalledWith({ id: 4 });
    });
  });
});
