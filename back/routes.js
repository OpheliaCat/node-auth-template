const { Router } = require('express');
const expressAdapter = require('./adapters/express.adapter')


const testJSON = [
    { id: 1, realName: 'Pahom', nickname: 'Poehavshiy' },
    { id: 2, realName: 'Yepiphan', nickname: 'Bratok' },
    { id: 3, realName: 'Osmolovskiy', nickname: 'Captain' },
    { id: 4, realName: 'Maslaev', nickname: 'Polkovnick' },
    { id: 5, realName: 'Baskova', nickname: null }
]

module.exports = expressAdapter(Router())
    .addRoute(
        { method: 'GET', path: '/test' },
        ({ query }) => ({ json: [...testJSON, query]})
    )
    .addRoute(
        { method: 'POST', path: '/post' },
        ({ body }) => ({ status: 201, json: [...testJSON, body]})
    )
    .router
