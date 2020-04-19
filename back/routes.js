const { Router } = require('express');
const expressAdapter = require('./adapters/express.adapter');
const mongodbAdapter = require('./adapters/mongodb.adapter');


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
        ({ query }) => ({ json: testJSON.concat(query )})
    )
    .addRoute(
        { method: 'POST', path: '/users' },
        async ({ body }) => ({ 
            status: 201, 
            json: await mongodbAdapter()
                .getCollection('users')
                .set({ fields: body }) 
        })
    )
    .addRoute(
        { method: 'DELETE', path: '/users/:id' },
        async ({ params: { id } }) => ({ 
            status: 200, 
            json: await mongodbAdapter()
                .getCollection('users')
                .softDelete({ id })
        })
    )
    .addRoute(
        { method: 'GET', path: '/users' },
        async ({ query: { fields} }) => ({
            status: 200,
            json: await mongodbAdapter()
                .getCollection('users')
                .list({ exclude: fields })
        })
    )
    .router
