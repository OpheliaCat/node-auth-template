const crypto = require('crypto');

module.exports = {
    encryptPassword: password => {
        const salt = crypto
            .randomBytes(32)
            .toString('hex');
        const hash = crypto
            .pbkdf2Sync(password, salt, 1000, 64, 'hex')
            .toString('hex');
        return `${hash}.${salt}`
    },

    comparePassword: (password, passwordHash) => {
        const [hash, salt] = passwordHash.split('.');
        const testHash = crypto
            .pbkdf2Sync(password, salt, 1000, 64, 'hex')
            .toString('hex');
        return hash === testHash
    },

    signJWT: identity => {
        const b64 = json => new Buffer(JSON.stringify(json)).toString('base64');
        const header = b64({ alg: "HS256", type: "jwt" });
        const payload = b64({ exp: Date.now() + 3600, identity });
        const signature = crypto
            .sign('sha256', `${header}.${payload}`, process.env.JWT_SECRET)
            .toString('base64');
        return `${header}.${payload}.${signature}`
    },
    
    verifyJWT: token => {
        const [ header, payload, signature ] = token
            .replace('Bearer', '')
            .trim()
            .split('.');
        return crypto
            .verify('sha256', `${header}.${payload}`, process.env.JWT_SECRET, signature)
    }
}