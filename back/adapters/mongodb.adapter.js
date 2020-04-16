const { MongoClient } = require('mongodb');
const AJV = require('ajv');

const ajv = AJV({ messages });

const parseProjection = exclude => {
    const outputFormat = {};
    if (typeof exclude === 'string' && exclude.length !== 0) exclude
        .split(',')
        .forEach(key => outputFormat[key] = 0);
    return outputFormat
}

module.exports = Object.freeze({
    client: null,
    db: null, 
    
    async connect () {
        this.client = await MongoClient.connect(process.env.MONGO_URI);
        this.db = this.client.db()
    },
    
    async list (collection, { limit, offset, exclude, where = {} }) {
        const list = await this.db
            .collection(collection)
            .find(where, parseProjection(exclude))
            .limit(Math.min(parseInt(limit, 10), 50))
            .skip(parseInt(offset) || 0)
            .toArray();
        return { status: 200, json: list }
    },

    async get (collection, { exclude, where = {} }) {
        const document = await this.db
            .collection(collection)
            .findOne(where, parseProjection(exclude));
        return { status: 200, json: document }
    },
    
    async add (collection, { schema, document }) {
        const isValid = await ajv.validate(schema, document);
        if (!isValid) return { status: 400, json: ajv.errors };
        const { insertedId } = await this.db
            .collection(collection)
            .insertOne(document);
        return { status: 201, insertedId }
    },

    async set (collection, { schema, where = {}, fields = {} }) {
        const document = await this.db
            .collection(collection)
            .findOne(where);
        if (!document) return { status: 404, text: 'NOT FOUND' };
        const isValid = await ajv.validate(schema, { ...document, ...set });
        if (!isValid) return { status: 400, json: ajv.errors };
        const { upsertedId } = await this.db
            .collection(collection)
            .updateOne({}, { $set: fields });
        return { status: 200, json: upsertedId }
    },

    async makeTransaction (callback) {
        const session = await this.client
            .startSession()
            .withTransaction(callback);
        return session.endSession()
    }
})