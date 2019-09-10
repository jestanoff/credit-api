import * as card from './card';
import {
  amendBalance, createCard, getCard, getCards,
} from '../models/card.js';

jest.mock('../models/card.js', () => ({
  amendBalance: jest.fn().mockResolvedValue({ balance: 70 }),
  createCard: jest.fn().mockResolvedValue({ id: 4 }),
  getCard: jest.fn().mockResolvedValue({ id: 3 }),
  getCards: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
}));

describe.only('card routes', () => {
  const mocks = { req: {}, res: {} };

  beforeEach(() => {
    mocks.error = jest.spyOn(console, 'error').mockReturnValue(null);
    mocks.end = jest.fn();
    mocks.json = jest.fn();
    mocks.res.status = jest.fn().mockReturnValue({
      end: mocks.end,
      json: mocks.json,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mocks.error.mockRestore();
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
      expect.assertions(2);
      jest.clearAllMocks();
      getCards.mockRejectedValue(new Error('any error'));
      await card.list(mocks.req, mocks.res);

      expect(mocks.error).toHaveBeenCalledTimes(1);
      expect(mocks.error).toHaveBeenCalledWith(new Error('any error'));
    });
  });

  describe('card.create', () => {
    let err;

    beforeEach(() => {
      err = new Error();
      err.name = 'ValidationError';
      err.errors = { cardId: { message: 'Attention!' } };
      mocks.req.params = { id: 4 };
    });

    test('should query the db to create a card', async () => {
      expect.assertions(2);
      mocks.req.params.id = 99;
      await card.create(mocks.req, mocks.res);

      expect(createCard).toHaveBeenCalledTimes(1);
      expect(createCard).toHaveBeenCalledWith(99);
    });

    test('should return status 201 CREATED on success', async () => {
      expect.assertions(2);
      await card.create(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(201);
    });

    test('should return the card as json on success', async () => {
      expect.assertions(2);
      await card.create(mocks.req, mocks.res);

      expect(mocks.json).toHaveBeenCalledTimes(1);
      expect(mocks.json).toHaveBeenCalledWith({ id: 4 });
    });

    test('should return status 409 CONFLICT if there is validation error', async () => {
      expect.assertions(2);
      createCard.mockRejectedValue(err);
      await card.create(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(409);
    });

    test('should return code CARD_ALREADY_EXISTS and message as json if there is validation error', async () => {
      expect.assertions(2);
      createCard.mockRejectedValue(err);
      await card.create(mocks.req, mocks.res);

      expect(mocks.json).toHaveBeenCalledTimes(1);
      expect(mocks.json).toHaveBeenCalledWith({ code: 'CARD_ALREADY_EXISTS', message: 'Attention!' });
    });

    test('should rethrow any other error', async () => {
      expect.assertions(1);
      createCard.mockRejectedValue(new Error('any other error'));

      try {
        await card.create(mocks.req, mocks.res);
      } catch (error) {
        expect(error).toStrictEqual(new Error('any other error'));
      }
    });

    test('should return status 400 BAD REQUEST if no id is in the request', async () => {
      expect.assertions(3);
      mocks.req.params.id = undefined;
      await card.create(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(400);
      expect(mocks.end).toHaveBeenCalledTimes(1);
    });
  });

  describe('card.show', () => {
    beforeEach(() => {
      mocks.req.params = { id: 3 };
    });

    test('should query the db to get a card by id', async () => {
      expect.assertions(2);
      await card.show(mocks.req, mocks.res);

      expect(getCard).toHaveBeenCalledTimes(1);
      expect(getCard).toHaveBeenCalledWith(3);
    });

    test('should return status 200 OK on success', async () => {
      expect.assertions(2);
      await card.show(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(200);
    });

    test('should return the card as json on success', async () => {
      expect.assertions(2);
      await card.show(mocks.req, mocks.res);

      expect(mocks.json).toHaveBeenCalledTimes(1);
      expect(mocks.json).toHaveBeenCalledWith({ id: 3 });
    });

    test('should log any errors on the console', async () => {
      expect.assertions(2);
      jest.clearAllMocks();
      getCard.mockRejectedValue(new Error('any error'));
      await card.list(mocks.req, mocks.res);

      expect(mocks.error).toHaveBeenCalledTimes(1);
      expect(mocks.error).toHaveBeenCalledWith(new Error('any error'));
    });

    test('should return status 400 BAD REQUEST if no id is in the request', async () => {
      expect.assertions(3);
      mocks.req.params.id = undefined;
      await card.show(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(400);
      expect(mocks.end).toHaveBeenCalledTimes(1);
    });
  });

  describe('card.balance', () => {
    beforeEach(() => {
      mocks.req.params = { id: 3 };
      getCard.mockResolvedValue({ balance: 99 });
    });

    test('should query the db to get a card by id', async () => {
      expect.assertions(2);
      await card.balance(mocks.req, mocks.res);

      expect(getCard).toHaveBeenCalledTimes(1);
      expect(getCard).toHaveBeenCalledWith(3);
    });

    test('should return status 200 OK on success', async () => {
      expect.assertions(2);
      await card.balance(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(200);
    });

    test('should return the balance as json on success', async () => {
      expect.assertions(2);
      await card.show(mocks.req, mocks.res);

      expect(mocks.json).toHaveBeenCalledTimes(1);
      expect(mocks.json).toHaveBeenCalledWith({ balance: 99 });
    });

    test('should log any errors on the console', async () => {
      expect.assertions(2);
      jest.clearAllMocks();
      getCard.mockRejectedValue(new Error('any error'));
      await card.balance(mocks.req, mocks.res);

      expect(mocks.error).toHaveBeenCalledTimes(1);
      expect(mocks.error).toHaveBeenCalledWith(new Error('any error'));
    });

    test('should return status 400 BAD REQUEST if no id is in the request', async () => {
      expect.assertions(3);
      mocks.req.params.id = undefined;
      await card.balance(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(400);
      expect(mocks.end).toHaveBeenCalledTimes(1);
    });
  });

  describe('card.deposit', () => {
    beforeEach(() => {
      mocks.req.params = { id: 5 };
      mocks.req.body = { amount: 50 };
    });

    test('should query the db to amend card balance', async () => {
      expect.assertions(2);
      await card.deposit(mocks.req, mocks.res);

      expect(amendBalance).toHaveBeenCalledTimes(1);
      expect(amendBalance).toHaveBeenCalledWith(5, 50);
    });

    test('should return status 200 OK on success', async () => {
      expect.assertions(2);
      await card.deposit(mocks.req, mocks.res);

      expect(mocks.res.status).toHaveBeenCalledTimes(1);
      expect(mocks.res.status).toHaveBeenCalledWith(200);
    });

    test('should return the balance as json on success', async () => {
      expect.assertions(2);
      await card.deposit(mocks.req, mocks.res);

      expect(mocks.json).toHaveBeenCalledTimes(1);
      expect(mocks.json).toHaveBeenCalledWith({ balance: 70 });
    });
  });
});
