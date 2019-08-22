const getCards = (req, res) => {
  res.send('All Cards');
};

const createCard = (req, res) => {
  res.send(`Card has been created with id 1`);
};

const getCard = (req, res) => {
  res.send(`Get card with id #${req.params.id}`);
};

const getBalance = (req, res) => {
  res.send(`The balance of card #${req.params.id} is ${req.params.id * 1.33} credits`);
};

const deposit = (req, res) => {
  res.send(`Deposited to card #${req.params.id}, ${req.params.id * 0.63} credits`);
};

const withdraw = (req, res) => {
  res.send(`Withdrew from card #${req.params.id}, ${req.params.id * 0.77} credits`);
};

module.exports = {
  createCard,
  deposit,
  getBalance,
  getCard,
  getCards, 
  withdraw,
};
