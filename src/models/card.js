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
      required: true,
      type: String,
      enum: ['deposit', 'withdraw'],
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
const Transaction = mongoose.model('Transaction', TransactionSchema);

export const getCards = (limit = 50) => Card.find().limit(limit);

export const createCard = () => new Card({}).save();

export const getCard = id => Card.findById(id);

export const amendBalance = async (id, amount) => {
  const card = await Card.findById(id);
  const balance = card.balance + amount;

  if (balance < 0) return undefined;

  card.balance = balance;
  card.transactions.push(new Transaction({
    amount: Math.abs(amount),
    type: Math.sign(amount) === -1 ? 'withdraw' : 'deposit',
  }));
  card.save();
  return card;
};
