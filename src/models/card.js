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
    barcode: String,
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
CardSchema.path('barcode', {
  required: true,
  type: String,
  unique: true,
  validate: {
    isAsync: true,
    message: 'Card with this barcode already exists',
    validator: (value, done) => {
      Card.findOne({ barcode: value }, (err, card) => {
        done(!card);
      });
    },
  },
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export const getCards = (limit = 50) => Card.find().limit(limit);

export const createCard = barcode => new Card({ barcode }).save();

export const getCard = barcode => Card.findOne({ barcode });

export const amendBalance = async (barcode, amount) => {
  const card = await Card.findOne({ barcode });
  const balance = card.balance + amount;

  if (balance < 0) return undefined;

  card.balance = balance;
  card.transactions.push(
    new Transaction({
      amount: Math.abs(amount),
      type: Math.sign(amount) === -1 ? 'withdraw' : 'deposit',
    }),
  );
  return card.save();
};
