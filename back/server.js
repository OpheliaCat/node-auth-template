const express = require('express');
const routes = require('./routes');

module.exports = express()
    .use((_, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next()
    })
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use('/rest', routes)
