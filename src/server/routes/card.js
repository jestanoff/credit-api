import {
  amendBalance, createCard, getCard, getCards,
} from '../models/card.js';

const CARD_NOT_FOUND = {
  code: 'CARD_NOT_FOUND',
  message: "Card with this id doesn't exist",
};

export const list = (req, res) => getCards()
  .then(cards => res.status(200).json(cards))
  .catch(err => {
    console.error(err);
    return res.status(500).end();
  });

export const create = (req, res) => {
  if (req.params.id) {
    return createCard(req.params.id)
      .then(card => res.status(201).json(card))
      .catch(err => {
        if (err.name === 'ValidationError') {
          return res
            .status(409)
            .json({ code: 'CARD_ALREADY_EXISTS', message: err.errors.cardId.message });
        }
        console.error(err);
        return res.status(500).end();
      });
  }
  return res.status(400).end();
};

export const show = (req, res) => {
  if (req.params.id) {
    return getCard(req.params.id)
      .then(card => {
        if (!card) return res.status(409).json(CARD_NOT_FOUND);
        return res.status(200).json(card);
      })
      .catch(err => {
        console.error(err);
        return res.status(500).end();
      });
  }
  return res.status(400).end();
};

export const balance = (req, res) => {
  if (req.params.id) {
    return getCard(req.params.id)
      .then(card => {
        if (!card) return res.status(409).json(CARD_NOT_FOUND);
        return res.status(200).json({ balance: card.balance });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).end();
      });
  }
  return res.status(400).end();
};

export const deposit = async (req, res) => {
  if (req.params.id && req.body.amount) {
    try {
      const card = await amendBalance(req.params.id, req.body.amount);
      return res.status(200).json({ balance: card.balance });
    } catch (err) {
      if (err.code === 'CARD_NOT_FOUND') return res.status(409).json(CARD_NOT_FOUND);

      console.error(err);
      return res.status(500).end();
    }
  }
  return res.status(400).end();
};

export const withdraw = async (req, res) => {
  if (req.params.id && req.body.amount) {
    try {
      const card = await amendBalance(req.params.id, -req.body.amount);
      return res.status(200).json({ balance: card.balance });
    } catch (err) {
      if (err.code === 'NOT_ENOUGH_CREDITS') {
        return res
          .status(409)
          .json({ code: 'INSUFFICIENT_BALANCE', message: 'Not enough credits on the card' });
      }

      if (err.code === 'CARD_NOT_FOUND') return res.status(409).json(CARD_NOT_FOUND);

      console.error(err);
      return res.status(500).end();
    }
  }
  return res.status(400).end();
};
