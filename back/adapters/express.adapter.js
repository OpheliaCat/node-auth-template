module.exports = Object.freeze({
    makeMiddlewares: (...handlers) => handlers.map(
        handler => (req, res, next) => {
            try {
                const output = handler(req);
                if (typeof output !== 'object') next();
                const { status, json, text } = output;
                res.status(Number(status) || 200);
                switch (true) {
                    case typeof json === 'object': res.json(json)
                    case typeof text === 'string': res.send(text)
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
    )
})