
const express = require('express')
const Joi = require('joi'); // use Joi to validate req object on POST/PUT requests
const app = express()
const port = process.env.port || 3000

app.use(express.json()); // middleware so res body is processed as JSON

app.get('/', (req, res) => res.send('Car Wash API!'))

app.get('/api/ids', (req, res) => res.send('Hello'))

app.listen(port, () => console.log(`App listening on port ${port}`))