import {
  amendBalance, createCard, getCard, getCards,
} from '../models/card.js';

const BAD_REQUEST = { error: 'Bad request' };

export const list = (req, res) => {
  try {
    const cards = getCards();
    return res.status(200).json(cards);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.toString() }).end();
  }
};

export const create = (req, res) => {
  if (req && req.params && req.params.id) {
    return createCard(req.params.id)
      .then(card => res.status(201).json(card))
      .catch(err => {
        if (err.code && err.code === 'CARD_ALREADY_EXISTS') {
          return res
            .status(409)
            .json({ code: err.code, message: err.message });
        }
        console.log(err);
        return res.status(500).json({ error: err.toString() }).end();
      });
  }
  return res.status(400).json(BAD_REQUEST).end();
};

export const show = (req, res) => {
  if (req && req.params && req.params.id) {
    return getCard(req.params.id)
      .then(card => {
        if (!card) return res.status(404);
        return res.status(200).json(card);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.toString() }).end();
      });
  }
  return res.status(400).json(BAD_REQUEST).end();
};

export const balance = (req, res) => {
  if (req && req.params && req.params.id) {
    return getCard(req.params.id)
      .then(card => {
        if (card === undefined) return res.status(404);
        return res.status(200).json({ balance: card.balance });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: err.toString() }).end();
      });
  }
  return res.status(400).json(BAD_REQUEST).end();
};

export const deposit = async (req, res) => {
  if (req && req.params && req.params.id && req.body && req.body.amount && req.body.amount > 0) {
    try {
      const card = await amendBalance(req.params.id, req.body.amount);

      return res.status(200).json({ balance: card.balance });
    } catch (err) {
      if (err.code && err.code === 'ValidationException') {
        return res.status(404);
      }
      console.error(err);
      return res.status(500).json({ error: err.toString() }).end();
    }
  }
  return res.status(400).json(BAD_REQUEST).end();
};

export const withdraw = async (req, res) => {
  if (req && req.params && req.params.id && req.body && req.body.amount && req.body.amount > 0) {
    const { params: { id }, body: { amount } } = req;
    try {
      const updatedCard = await amendBalance(id, -amount);

      return res.status(200).json({ balance: updatedCard.balance });
    } catch (err) {
      if (err.code && err.code === 'ValidationException') {
        return res.status(404);
      }

      if (err.code && err.code === 'ConditionalCheckFailedException') {
        return res
          .status(409)
          .json({ code: 'INSUFFICIENT_BALANCE', message: 'Not enough credits on the card' });
      }

      console.error(err);
      return res.status(500).json({ error: err.toString() }).end();
    }
  }
  return res.status(400).json(BAD_REQUEST).end();
};
