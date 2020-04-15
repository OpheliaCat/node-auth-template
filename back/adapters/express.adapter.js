module.exports = router => Object.freeze({
    router,

    addRoute: function ({ method, path }, ...handlers) {
        const middlewares = handlers.map(
            handler => (req, res, next) => {
                try {
                    const output = handler(req);
                    if (typeof output !== 'object') return next();
                    const { status, json, text } = output;
                    res.status(Number(status) || 200);
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
        this.router[method.toLowerCase()](path, ...middlewares);
        return this
    }
})
