export const list = (req, res) => {
  res.end('All Cards');
};

export const create = (req, res) => {
  res.end('Card has been created with id 1');
};

export const show = (req, res) => {
  res.end(`Get card with id #${req.params.id}`);
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
