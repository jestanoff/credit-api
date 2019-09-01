import { createCard, getCard, getCards } from '../models/card.js';

export const list = (req, res) => {
  getCards().then(cards => {
    res.status(200).json(cards);
  }).catch(console.error);
};

export const create = (req, res) => {
  createCard().then(card => {
    res.status(401).json(card);
  }).catch(console.error);
};

export const show = (req, res) => {
  if (req.params.id) {
    getCard(req.params.id).then(card => {
      res.status(200).json(card[0]);
    }).catch(console.error);
  } else {
    res.status(400).end();
  }
};

export const balance = (req, res) => {
  res.end(`The balance of card #${req.params.id} is ${req.params.id * 1.33} credits`);
};

export const deposit = (req, res) => {
  res.end(`Deposited to card #${req.params.id}, ${req.params.id * 0.63} credits`);
};

export const withdraw = (req, res) => {
  res.end(`Withdrew from card #${req.params.id}, ${req.params.id * 0.77} credits`);
};
