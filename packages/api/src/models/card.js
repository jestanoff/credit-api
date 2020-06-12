import dynamoose from 'dynamoose';

dynamoose.aws.sdk.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
// dynamoose.aws.ddb.local();

const CardSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      validate: val => val >= 0 && val <= 9999,
    },
    transactions: {
      type: Array,
      default: [],
      schema: [{
        type: Object,
        schema: {
          amount: {
            type: Number,
            validate: val => val >= 0 && val <= 9999,
            required: true,
          },
          createdAt: {
            type: Date,
            // TODO: there is a bug with nested schemas containing both required and default attr
            // work around is to require createdAt and then always set it to the current timestamp
            // default: Date.now,
            set: Date.now,
            required: true,
          },
          type: {
            type: String,
            enum: ['deposit', 'withdraw'],
            required: true,
          },
        },
      }],
    },
  },
  {
    timestamps: true,
  },
);
const Card = dynamoose.model('Cards', CardSchema);

export const getCards = () => Card.scan().exec();

export const getCard = id => Card.get({ id });

export const createCard = async id => {
  const existingCard = await getCard(id);
  if (existingCard && existingCard.id) {
    const err = new Error(`Card with id ${id} already exists`);
    err.code = 'CARD_ALREADY_EXISTS';
    return Promise.reject(err);
  }
  return new Card({ id }).save();
};

export const amendBalance = async (id, amount) => {
  if (!id) {
    const err = new Error('cardId is required');
    err.code = 'CARD_ID_REQUIRED';
    throw err;
  }

  if (amount === undefined) {
    const err = new Error('amount is required');
    err.code = 'AMOUNT_REQUIRED';
    throw err;
  }

  const transaction = {
    amount: Math.abs(amount),
    createdAt: Date.now(),
    type: Math.sign(amount) === -1 ? 'withdraw' : 'deposit',
  };

  // Using dynamoose.Condition to minimize querying the document
  // as checking for insufficient balance is needed on withdraw
  const conditionAmount = Math.sign(amount) === -1 ? Math.abs(amount) : 0;
  const condition = new dynamoose.Condition().filter('balance').ge(Math.abs(conditionAmount));
  return Card.update(
    { id },
    { $ADD: { balance: amount, transactions: transaction } },
    { condition },
  );
};
