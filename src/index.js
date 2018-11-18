
const express = require('express')
const morgan = require('morgan')
const Joi = require('joi'); // use Joi to validate req object on POST/PUT requests
const helmet = require('helmet')
const authentication = require('./middlewares/authentication')
const app = express()

const port = process.env.port || 3000

// Middlewares
app.use(helmet()); // Helps secure the app by setting various http headers
app.use(express.json()); // Process res body as JSON
app.use(morgan()); // Logging requests
app.use(authentication)

app.get('/', (req, res) => res.send('Car Wash API!'))

app.get('/api/ids', (req, res) => res.send('Hello'))

app.listen(port, () => console.log(`App listening on port ${port}`))