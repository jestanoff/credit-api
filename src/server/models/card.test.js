/* eslint-disable prefer-arrow-callback */
import mongoose from 'mongoose';
// eslint-disable-next-line no-unused-vars
import * as card from './card.js';

const mockLimit = jest.fn();
jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation(function (definition, options) {
    return {
      definition,
      path: jest.fn().mockReturnValue('Hello'),
      options,
    };
  }),
  model: jest.fn().mockImplementation(() => ({
    find: jest.fn().mockImplementation(() => ({ limit: mockLimit })),
  })),
}));

describe('card model', () => {
  const schemaOptions = { autoIndex: false, strict: true, timestamps: true };
  const mocks = {};

  beforeEach(() => {
    mocks.path = jest.fn();
  });

  test('should create a Transaction schema', () => {
    expect(mongoose.Schema).toBeCalledTimes(2);
    expect(mongoose.Schema.mock.calls[0]).toMatchObject([{
      amount: {
        max: 1000,
        min: 1,
        required: true,
        type: Number,
      },
      type: {
        enum: ['deposit', 'withdraw'],
        required: true,
        type: String,
      },
    },
    schemaOptions]);
  });

  test('should create a Card schema', () => {
    expect(mongoose.Schema).toBeCalledTimes(2);
    expect(mongoose.Schema.mock.calls[1]).toMatchObject([{
      balance: {
        default: 0,
        max: 1000,
        min: 0,
        type: Number,
      },
      cardId: String,
      transactions: {
        type: [expect.any(Object)],
      },
    },
    schemaOptions]);
  });

  test('should path the Card schema with a carId validator', () => {
  });

  test('should create a new car document with Card schema', () => {
    expect(mongoose.model).toBeCalled();
    expect(mongoose.model.mock.calls[0]).toMatchObject(['Card', {
      definition: {
        balance: expect.any(Object),
        cardId: expect.any(Function),
        transactions: expect.any(Object),
      },
      path: expect.any(Function),
      options: schemaOptions,
    }]);
  });

  test('should create a new transaction document with Transaction schema', () => {
    expect(mongoose.model).toBeCalled();
    expect(mongoose.model.mock.calls[1]).toMatchObject(['Transaction', {
      definition: {
        amount: expect.any(Object),
        type: expect.any(Object),
      },
      path: expect.any(Function),
      options: schemaOptions,
    }]);
  });
});
