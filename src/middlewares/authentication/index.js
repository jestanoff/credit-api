const apiKeys = {
  admin: '4AF28F7298C7EAD8EEC6FFF22D879'
};

module.exports = (req, res, next)  => {
    console.log('Authenticating...')
    if (Object.values(apiKeys).includes(req.body.apiKey)) {
        return next()
    }
    return res.status(401).send('401 Not Authorised')
}
