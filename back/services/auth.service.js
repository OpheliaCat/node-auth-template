const crypto = require('crypto');

module.exports = {
    genCredentialsFlow: function* (password) {
        const salt = crypto.randomBytes(32).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'hex');
        const id = yield { salt, hash };
        const b64 = json => new Buffer(JSON.stringify(json)).toString('base64');
        const header = b64({ alg: "HS256", type: "jwt" });
        const payload = b64({ exp: Date.now() + 3600, id });
        const signature = crypto
            .createHmac('sha256', process.env.JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest('base64');
        yield `${header}.${payload}.${signature}`
    },

    authorizationFlow: function* (authorizationHeader) {
        const { header, payload, signature } = 
            authorizationHeader.replace('Bearer', '').trim().split('.');
        const testSignature = crypto
            .createHmac('sha256', process.env.JWT_SECRET)
            .update(`${header}.${payload}`)
            .digest('base64');
        yield signature === testSignature ? new Buffer(payload, 'base64').toString('ascii') : null;
    }
}