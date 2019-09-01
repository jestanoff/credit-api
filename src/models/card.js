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

export const getCards = (limit = 50) => Card.find().limit(limit);

export const createCard = () => new Card({}).save();

export const getCard = id => Card.find({ _id: id });

export const getTransactions = async () => {
  /* COMPARISON */
  // eq (equal)
  // ne (not equal)
  // gt (greater than)
  // gte (greater than or equal to)
  // lt (less than)
  // lte (less than or equal to)
  // in (one of array of values)
  // nin (not in)
  /* LOGICAL */
  // or
  // and
  await Card.find({ balance: { $gte: 0, $lte: 1 } })
    .or([{ balance: 1 }, { balance: 10 }])
    .limit(20)
    .sort({ balance: 1 })
    .select({ date: 1, balance: 1 });
};
getTransactions();
