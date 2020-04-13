module.exports = {
    catchErrors: (...middlewares) => middlewares.map(
        middleware => (req, res, next) => {
            try {
                middleware(req, res, next)
            } catch (error) {
                if (typeof error !== 'object' 
                || error.constructor !== Object 
                || typeof error.status !== 'number' 
                || error.status === 500) 
                    res.status(500).json({ 
                        error: 'It is a problem on a server side. Please contact an admin.'
                    })
                else res.status(error.status).json(error)
            }
        }
    ),

    prepareQuery: ({ offset, limit, fields, ...rest }) => ({
        ...rest,
        offset: Number.isInteger(Number(offset)) && offset >= 0 ? Number(offset) : 0,
        limit: Number.isInteger(Number(limit)) && limit >= 0 && limit < 51 ? Number(limit) : 50,
        fields: fields ? fields.split(',').map(value => value.trim()) : undefined 
    })
}