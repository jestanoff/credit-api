import {
  amendBalance, createCard, getCard, getCards,
} from '../models/card.js';

export const list = (req, res) => {
  getCards()
    .then(cards => {
      res.status(200).json(cards);
    })
    .catch(console.error);
};

export const create = (req, res) => {
  createCard()
    .then(card => {
      res.status(401).json(card);
    })
    .catch(console.error);
};

export const show = (req, res) => {
  if (req.params.id) {
    getCard(req.params.id)
      .then(card => {
        res.status(200).json(card);
      })
      .catch(console.error);
  } else {
    res.status(400).end();
  }
};

export const balance = (req, res) => {
  if (req.params.id) {
    getCard(req.params.id)
      .then(card => {
        res.status(200).json({ balance: card[0].balance });
      })
      .catch(console.error);
  } else {
    res.status(400).end();
  }
};

export const deposit = async (req, res) => {
  const card = await amendBalance(req.params.id, req.body.amount);
  res.status(200).json({ balance: card.balance });
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
