const expressAdapter = require('./adapters/express.adapter');
const { moveTo } = require('./adapters/mongodb.adapter');


const testJSON = [
    { id: 1, realName: 'Pahom', nickname: 'Poehavshiy' },
    { id: 2, realName: 'Yepiphan', nickname: 'Bratok' },
    { id: 3, realName: 'Osmolovskiy', nickname: 'Captain' },
    { id: 4, realName: 'Maslaev', nickname: 'Polkovnick' },
    { id: 5, realName: 'Baskova', nickname: null }
]

module.exports = expressAdapter
    .get('/users', async ({ query }) => ({
        status: 200,
        json: await moveTo('users').list(query)
    }))
    .post('/users', async ({ query, body }) => ({
        status: 201, 
        json: await moveTo('users').set({ fields: body, ...query }) 
    }))
    .delete('/users', async ({ params: { id } }) => ({
        status: 200,
        json: await moveTo('users').softDelete({ id })
    }))
    .router
