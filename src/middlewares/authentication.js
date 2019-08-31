import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  if (req.body.username === 'admin' && req.body.password === '12345') {
    const payload = { userId: '1234' };
    jwt.sign(payload, req.app.get('Secret'), { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.json({ message: 'Authentication successful', token });
    });
  } else {
    res.status(401).send('Password or Username not found');
  }
  next();
};
