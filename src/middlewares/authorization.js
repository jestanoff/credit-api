import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  // Check the header for the token
  const token = req.get('Authorization');
  if (token) {
    // Verifies secret and checks if the token is expired
    jwt.verify(token, req.app.get('Secret'), (err, decoded) => {
      if (err) {
        return res.status(401).send(`Invalid authentication token on ${req.baseUrl}`);
      }
      // If everything is good, save to the request so it can be used in other routes
      req.decoded = decoded;
      return next();
    });
  } else {
    res.status(401).send('No authentication token provided');
  }
};
