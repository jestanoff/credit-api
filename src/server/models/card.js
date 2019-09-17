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
    type: {
      enum: ['deposit', 'withdraw'],
      required: true,
      type: String,
    },
  },
  {
    autoIndex: false,
    strict: true,
    timestamps: true,
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
  const card = await Card.findOne({ cardId });
  const balance = card.balance + amount;

  if (balance < 0) return undefined;

  const transactions = [...card.transactions,
    new Transaction({
      amount: Math.abs(amount),
      type: Math.sign(amount) === -1 ? 'withdraw' : 'deposit',
    }),
  ];
  return Card.findOneAndUpdate({ cardId }, { balance, transactions }, { new: true });
};
