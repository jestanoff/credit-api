module.exports = (req, res, next)  => {
    console.log('Authenticating...')
    if (req.body.apiKey) {
        return next()
    }
    return res.status(401).send('401 Not Authorised')
}
