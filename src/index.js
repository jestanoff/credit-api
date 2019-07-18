
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Joi = require('joi'); // use Joi to validate req object on POST/PUT requests
const helmet = require('helmet')
const authentication = require('./middlewares/authentication')
const app = express()

// Database
mongoose.connect('mongodb://localhost/carwash', { useNewUrlParser: true })
    .then(() => console.log('connected to MongoDB'))
    .catch(err => console.log('could not connect to MongoDB', err))

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    currentBalance: Number,
    date: { type: Date, default: Date.now },
    value: Number,
}))
const transaction = new Transaction({
    currentBalance: 0,
    value: 1,
})

const createTransaction = async () => {
    const result = await transaction.save();
    console.log(result)
}
// createTransaction();

const getTransactions = async () => {
    /* COMPARISON */
    // eq (equal)
    // ne (not equal)
    // gt (greater than)
    // gte (greater than or equal to)
    // lt (less than)
    // lte (less than or equal to)
    // in (one of array of values)
    // nin (not in)
    /* LOGICAL */
    // or
    // and
    const result = await Transaction
        .find({ value: { $gte: 0, $lte: 1 } })
        .or([ { value: 1 }, { currentBalance: 0 } ])
        .limit(20)
        .sort({ value: 1 })
        .select({ date: 1, value: 1 })
    console.log(result)
}
getTransactions();

const port = process.env.port || 3000

// Middlewares
app.use(helmet()); // Helps secure the app by setting various http headers
app.use(express.json()); // Process res body as JSON
app.use(morgan('dev')); // Logging requests
app.use(authentication)

app.get('/', (req, res) => res.send('Car Wash API!'))

app.get('/api/ids', (req, res) => res.send('Hello'))

app.listen(port, () => console.log(`App listening on port ${port}`))