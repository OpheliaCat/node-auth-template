const { Router } = require('express');
const handleErrors = require('./services/error.handler');

module.exports = Router()
    .get('/', (_, res) => res.json({ message: 'Hello Bratok!' }))
    .get('/test', handleErrors((req, res) => {
        if (req.query.msg !== 'hi') 
            throw { status: 400, error: "You didn't say hi!" }
        res.status(200).json({ message: "hi, boddy" })
    }))
