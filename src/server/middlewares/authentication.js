import jwt from 'jsonwebtoken';

export default (req, res) => {
// * Block consecutive failed attempts by the same user name and IP address.
// * Block number of failed attempts from an IP address over some long period of time.
//   For example, block an IP address if it makes 100 failed attempts in one day.

  if (req.body.username === 'admin' && req.body.password === '12345') {
    const payload = { userId: '1234' };
    jwt.sign(payload, req.app.get('Secret'), { expiresIn: '24h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ message: 'Authentication successful', token });
    });
  } else {
    res.status(401).send('Password or Username not found');
  }
};
