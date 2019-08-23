exports.getCards = (req, res) => {
  res.send('All Cards');
};

exports.createCard = (req, res) => {
  res.send('Card has been created with id 1');
};

exports.getCard = (req, res) => {
  res.send(`Get card with id #${req.params.id}`);
};

exports.getBalance = (req, res) => {
  res.send(`The balance of card #${req.params.id} is ${req.params.id * 1.33} credits`);
};

exports.deposit = (req, res) => {
  res.send(`Deposited to card #${req.params.id}, ${req.params.id * 0.63} credits`);
};

exports.withdraw = (req, res) => {
  res.send(`Withdrew from card #${req.params.id}, ${req.params.id * 0.77} credits`);
};
