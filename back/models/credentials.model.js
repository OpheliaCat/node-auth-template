const AJV = require('ajv');
const { moveTo } = require('../adapters/mongodb.adapter');
const { signJWT, encryptPassword } = require('../adapters/crypto.adapter');

const ajv = AJV();

module.exports = Object.freeze({
    async createSession ({ body: { password, ...rest } }) {
        ajv.validate('users.schema', { password, ...rest });
        if (ajv.errors) return { status: 400, json: ajv.errors };
        const { _id, ...rest } = await moveTo('users')
            .set({ 
                fields: { password: encryptPassword(password), ...rest }, 
                exclude: 'password' 
            });
        console.log(_id);
        return {
            status: 201,
            json: { accessToken: signJWT(_id), _id, ...rest }
        }
    }
})
