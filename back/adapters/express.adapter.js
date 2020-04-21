const { Router } = require('express');

const addRoute = (...handlers) => handlers.map(
    handler => async (req, res, next) => {
        try {
            const output = await handler(req);
            if (!output) return next();
            const { status, json, text } = output;
            res.status(parseInt(status, 10) || 200);
            switch (true) {
                case typeof json === 'object': res.json(json); break
                case typeof text === 'string': res.send(text); break
                default: res.end()
            }
            
        } catch (error) {
            console.log('ERROR', error);
            res.status(500).json({ 
                status: 500,
                error: 'It is a problem on a server side. Please contact an admin.'
            })
        }
    }
);

module.exports = Object.freeze({
    router: Router(),

    get (path, ...handlers) {
        this.router.get(path, ...addRoute(...handlers));
        return this
    },

    post (path, ...handlers) {
        this.router.post(path, ...addRoute(...handlers));
        return this
    },
    
    put (path, ...handlers) {
        this.router.put(path, ...addRoute(...handlers));
        return this
    },

    patch (path, ...handlers) {
        this.router.patch(path, ...addRoute(...handlers));
        return this
    },

    delete (path, ...handlers) {
        this.router.delete(path, ...addRoute(...handlers));
        return this
    },
})
