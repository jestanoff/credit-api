import mongoose, { mocks } from 'mongoose';
import * as card from './card.js';

jest.mock('mongoose');

describe('Card model', () => {
  test('should create a Card schema', () => {
    expect(mongoose.Schema.mock.calls[1]).toMatchSnapshot();
  });

  test('should create a new car document with Card schema', () => {
    expect(mongoose.model).toBeCalled();
    expect(mongoose.model.mock.calls[0]).toMatchSnapshot();
  });

  test('should path the Card schema with a carId validator', () => {
    expect(mocks.path).toBeCalledTimes(1);
    expect(mocks.path).toBeCalledWith('cardId', {
      required: true,
      type: String,
      unique: true,
      validate: {
        validator: expect.any(Function),
      },
    });
  });

  describe('validation on card creation to ensure cardId uniqueness', () => {
    beforeEach(() => mocks.findOne.mockClear());

    test('should reject the promise if it finds a card', () => {
      expect.assertions(3);
      const error = new Error('Card with id singleCard already exists');
      const { validator } = mocks.path.mock.calls[0][1].validate;

      validator('cardId').catch(err => {
        expect(err).toEqual(error);
        expect(mocks.findOne).toBeCalledTimes(1);
        expect(mocks.findOne).toBeCalledWith({ cardId: 'cardId' });
      });
    });

    test("should resolve the promise if it doesn't find a card", async () => {
      expect.assertions(3);
      mocks.findOne.mockReturnValue(undefined);
      const { validator } = mocks.path.mock.calls[0][1].validate;
      const promise = await validator('Hello');

      expect(promise).toBe('Card created');
      expect(mocks.findOne).toBeCalledTimes(1);
      expect(mocks.findOne).toBeCalledWith({ cardId: 'Hello' });
    });
  });
});

describe('Transaction model', () => {
  test('should create a Transaction schema', () => {
    expect(mongoose.Schema).toBeCalledTimes(2);
    expect(mongoose.Schema.mock.calls[0]).toMatchSnapshot();
  });

  test('should create a new transaction document with Transaction schema', () => {
    expect(mongoose.model).toBeCalled();
    expect(mongoose.model.mock.calls[1]).toMatchSnapshot();
  });
});

describe('db queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.findOne.mockReturnValue({
      balance: 20,
      cardId: 'singleCard',
      transactions: [],
    });
  });

  describe('getCards', () => {
    test('should return up to 50 cards ', () => {
      expect(card.getCards()).toMatchObject([{ id: 1 }, { id: 2 }]);
      expect(mocks.find).toBeCalledTimes(1);
      expect(mocks.find).toBeCalledWith();
      expect(mocks.limit).toBeCalledTimes(1);
      expect(mocks.limit).toBeCalledWith(50);
    });

    test('should return up to 5 cards when limit is set to 5', () => {
      card.getCards(5);

      expect(mocks.limit).toBeCalledWith(5);
    });
  });

  describe('createCard', () => {
    test('should crate a new card with a given cardId and then save it', () => {
      card.createCard('newCard');

      expect(mocks.instance).toBeCalledTimes(1);
      expect(mocks.instance).toBeCalledWith({ cardId: 'newCard' });
    });
  });

  describe('getCard', () => {
    test('should get a single card with a given cardId', () => {
      expect(card.getCard('getMeThatCard')).toMatchObject({
        balance: 20,
        cardId: 'singleCard',
        transactions: [],
      });
      expect(mocks.findOne).toBeCalledTimes(1);
      expect(mocks.findOne).toBeCalledWith({ cardId: 'getMeThatCard' });
    });
  });

  describe('amendBalance', () => {
    test('should return undefined if cardId is correct type or not there', async () => {
      let result;
      expect.assertions(3);

      result = await card.amendBalance(undefined, 5);
      expect(result).toBe(undefined);

      result = await card.amendBalance(20, 5);
      expect(result).toBe(undefined);

      result = await card.amendBalance('123', 5);
      expect(result).toBe(undefined);
    });

    test('should only amend the balance of a single card with a given cardId', async () => {
      expect.assertions(2);
      await card.amendBalance('getMeThisCard', 10);

      expect(mocks.findOne).toBeCalledTimes(1);
      expect(mocks.findOne).toBeCalledWith({ cardId: 'getMeThisCard' });
    });

    test('should return undefined if the new balance is less than 0', async () => {
      expect.assertions(1);
      const result = await card.amendBalance('anyCard', -25);

      expect(result).toBe(undefined);
    });

    test('should return undefined if the new balance is less than 0 decreased by 1', async () => {
      expect.assertions(1);
      mocks.findOne.mockReturnValue({ balance: 0 });
      const result = await card.amendBalance('anyCard', -1);

      expect(result).toBe(undefined);
    });

    test('should return the new card with increased balance and a deposit transaction', async () => {
      expect.assertions(1);
      mocks.instance.mockImplementation(({ amount, type }) => ({ amount, type }));
      const result = await card.amendBalance('getMeThisCard', 80);

      expect(result).toStrictEqual({
        balance: 100,
        cardId: 'getMeThisCard',
        transactions: [{ amount: 80, type: 'deposit' }],
      });
    });

    test('should return the new card with increased balance by 1 and a "deposit" transaction', async () => {
      expect.assertions(1);
      mocks.instance.mockImplementation(({ amount, type }) => ({ amount, type }));
      const result = await card.amendBalance('getMeThisCard', 1);

      expect(result).toStrictEqual({
        balance: 21,
        cardId: 'getMeThisCard',
        transactions: [{ amount: 1, type: 'deposit' }],
      });
    });

    test('should return the new card with decreased balance and a "withdraw" transaction', async () => {
      expect.assertions(1);
      const result = await card.amendBalance('decreasedCard', -18);

      expect(result).toStrictEqual({
        balance: 2,
        cardId: 'decreasedCard',
        transactions: [{ amount: 18, type: 'withdraw' }],
      });
    });

    test('should return the new card with decreased balance by 1 and a "withdraw" transaction', async () => {
      expect.assertions(1);
      const result = await card.amendBalance('decreasedCard', -1);

      expect(result).toStrictEqual({
        balance: 19,
        cardId: 'decreasedCard',
        transactions: [{ amount: 1, type: 'withdraw' }],
      });
    });
  });
});
