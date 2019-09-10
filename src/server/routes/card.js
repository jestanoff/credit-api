import {
  amendBalance, createCard, getCard, getCards,
} from '../models/card.js';

export const list = (req, res) => getCards()
  .then(cards => {
    res.status(200).json(cards);
  })
  .catch(console.error);

export const create = (req, res) => {
  if (req.params.id) {
    return createCard(req.params.id)
      .then(card => {
        res.status(201).json(card);
      })
      .catch(err => {
        if (err.name === 'ValidationError') {
          return res
            .status(409)
            .json({ code: 'CARD_ALREADY_EXISTS', message: err.errors.cardId.message });
        }
        throw err;
      });
  }
  return res.status(400).end();
};

export const show = (req, res) => {
  if (req.params.id) {
    return getCard(req.params.id)
      .then(card => res.status(200).json(card))
      .catch(console.error);
  }
  return res.status(400).end();
};

export const balance = (req, res) => {
  if (req.params.id) {
    return getCard(req.params.id)
      .then(card => res.status(200).json({ balance: card.balance }))
      .catch(console.error);
  }
  return res.status(400).end();
};

export const deposit = async (req, res) => {
  if (req.params.id) {
    return amendBalance(req.params.id, req.body.amount)
      .then(card => res.status(200).json({ balance: card.balance }))
      .catch(() => {
        res
          .status(409)
          .json({ code: 'DEPOSIT_ERROR', message: 'Card with this cardId already exists' });
      });
  }
  return res.status(400).end();
};

export const withdraw = async (req, res) => {
  const card = await amendBalance(req.params.id, -req.body.amount);

  if (card) {
    res.status(200).json({ balance: card.balance });
  } else {
    res
      .status(409)
      .json({ code: 'INSUFFICIENT_BALANCE', message: 'Not enough credits on the card' });
  }
};
