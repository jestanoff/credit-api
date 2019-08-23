import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  if (req.body.username === 'admin' && req.body.password === '12345') {
    const payload = { check: true };
    const token = jwt.sign(payload, req.app.get('Secret'), { expiresIn: 1440 }); // expires in 24h

    res.json({ message: 'Authentication done', token });
  } else {
    res.status(401).send('Password or Username not found');
  }
  next();
};
