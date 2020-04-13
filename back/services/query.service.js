const AJV = require('ajv');

const ajv = new AJV();

module.exports = {
    catchExceptions: (...middlewares) => middlewares.map(
        middleware => (req, res, next) => {
            try {
                middleware(req, res, next)
            } catch (error) {
                console.log('ERROR', error);
                res.status(500).json({ 
                    status: 500,
                    error: 'It is a problem on a server side. Please contact an admin.'
                })
            }
        }
    ),

    validateBody: schema => async ({ body }, res, next) => {
        const isValid = await ajv.validate(schema, body);
        if (!isValid) res.status(400).json({ status: 400, errors: ajv.errors })
        else next()
    },

    prepareQuery: ({ offset, limit, fields, ...rest }) => ({
        ...rest,
        offset: Number.isInteger(Number(offset)) && offset >= 0 ? Number(offset) : 0,
        limit: Number.isInteger(Number(limit)) ? Math.min(limit, 50) : 50,
        fields: fields ? fields.split(',').map(value => value.trim()) : undefined 
    })
}