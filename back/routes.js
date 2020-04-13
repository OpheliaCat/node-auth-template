const { Router } = require('express');
const makeResponse = require('./services/response.service');

module.exports = Router()
    .get('/', (_, res) => res.json({ message: 'Hello Bratok!' }))
    .get('/test', makeResponse(req => {
        if (req.query.msg !== 'hi') 
            throw { status: 400, error: "You didn't say hi!" };
        return { message: "hi, boddy" }
    }))
