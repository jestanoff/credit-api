import mongoose from 'mongoose';

const { Schema } = mongoose;
const TransactionSchema = new Schema(
  {
    amount: {
      max: 1000,
      min: 1,
      required: true,
      type: Number,
    },
    createdAt: {
      default: Date.now,
      type: Date,
    },
    type: {
      enum: ['deposit', 'withdraw'],
      required: true,
      type: String,
    },
  },
  {
    autoIndex: false,
    strict: true,
  },
);
const CardSchema = new Schema(
  {
    balance: {
      default: 0,
      max: 1000,
      min: 0,
      type: Number,
    },
    cardId: String,
    transactions: {
      type: [TransactionSchema],
    },
  },
  {
    autoIndex: false,
    strict: true,
    timestamps: true,
  },
);
const Card = mongoose.model('Card', CardSchema);
CardSchema.path('cardId', {
  required: true,
  type: String,
  unique: true,
  validate: {
    validator: async (value) => {
      const card = await Card.findOne({ cardId: value });

      return card
        ? Promise.reject(new Error(`Card with id ${card.cardId} already exists`))
        : Promise.resolve('Card created');
    },
  },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export const getCards = (limit = 50) => Card.find().limit(limit);

export const createCard = cardId => new Card({ cardId }).save();

export const getCard = cardId => Card.findOne({ cardId });

export const amendBalance = async (cardId, amount) => {
  if (!cardId) {
    const err = new Error('cardId is required');
    err.code = 'CARD_ID_REQUIRED';
    throw err;
  }

  if (!amount || Number(amount) === 0) {
    const err = new Error('amount is required');
    err.code = 'AMOUNT_REQUIRED';
    throw err;
  }

  const card = await Card.findOne({ cardId });

  if (!card) {
    const err = new Error('Card not found');
    err.code = 'CARD_NOT_FOUND';
    throw err;
  }

  const balance = card.balance + Number(amount);

  if (balance < 0) {
    const err = new Error('Not enough credits');
    err.code = 'NOT_ENOUGH_CREDITS';
    throw err;
  }

  const transaction = new Transaction({
    amount: Math.abs(amount),
    type: Math.sign(amount) === -1 ? 'withdraw' : 'deposit',
  });

  return Card.findOneAndUpdate(
    { cardId },
    { balance, $push: { transactions: transaction } }, { new: true },
  );
};
