const AJV = require('ajv');

const ajv = new AJV();

module.exports = {
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