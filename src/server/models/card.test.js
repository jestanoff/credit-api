import mongoose, { mocks } from 'mongoose';
// eslint-disable-next-line no-unused-vars
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
      transactions: ['1', '2'],
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
      // TODO
      // card.createCard('newCard');
    });
  });

  describe('getCard', () => {
    test('should get a single card with a given cardId', () => {
      expect(card.getCard('getMeThatCard')).toMatchObject({
        balance: 20,
        cardId: 'singleCard',
        transactions: ['1', '2'],
      });
      expect(mocks.findOne).toBeCalledTimes(1);
      expect(mocks.findOne).toBeCalledWith({ cardId: 'getMeThatCard' });
    });
  });

  describe('amendBalance', () => {
    test('should only amend the balance of a single card with a given cardId', async () => {
      // TODO
      // await card.amendBalance('getMeThisCard', 10);

      // expect(mocks.findOne).toBeCalledTimes(1);
      // expect(mocks.findOne).toBeCalledWith({ cardId: 'getMeThisCard' });
    });
  });
});
