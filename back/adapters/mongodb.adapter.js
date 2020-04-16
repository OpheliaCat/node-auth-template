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
        const db = await MongoClient.connect(process.env.MONGO_URI)
        db.db().collection().findOneAndUpdate()
        this.db = this.client.db()
    },
    
    async list (collection, { limit, offset, exclude, where = {} }) {
        const list = await this.db
            .collection(collection)
            .find(
                { ...where, 'metadata.deleted': false }, 
                parseProjection(exclude)
            )
            .limit(Math.min(parseInt(limit, 10) || 50, 50))
            .skip(parseInt(offset) || 0)
            .toArray();
        return { status: 200, json: list }
    },

    async get (collection, { exclude, where = {} }) {
        const document = await this.db
            .collection(collection)
            .findOne(
                { ...where, 'metadata.deleted': false }, 
                parseProjection(exclude)
            );
        return { status: 200, json: document }
    },
    
    async add (collection, { schema, document }) {
        const isValid = await ajv.validate(schema, document);
        if (!isValid) return { status: 400, json: ajv.errors };
        const metadata = {  
            createdAt: Date(), 
            updatedAt: Date(), 
            deleted: false 
        };
        const { insertedId } = await this.db
            .collection(collection)
            .insertOne({ ...document, metadata });
        return { status: 201, json: { ...document, _id: insertedId, metadata } }
    },

    async set (collection, { schema, where = {}, fields = {} }) {
        const document = await this.db
            .collection(collection)
            .findOne({ ...where, 'metadata.deleted': false });
        if (!document) return { status: 404, text: 'NOT FOUND' };
        const { metadata, _id, ...rest } = document;
        const isValid = await ajv.validate(schema, { ...rest, ...fields });
        if (!isValid) return { status: 400, json: ajv.errors };
        await this.db
            .collection(collection)
            .updateOne(
                { _id }, 
                { $set: { 
                    ...fields, metadata: { deleted: false, updatedAt: Date() } 
                } }
            );
        return { status: 200, json: { ...document, ...fields } }
    },

    async softDelete (collection, { where = {}, exclude }) {
        const document = await this.db
            .collection(collection)
            .findOneAndUpdate(
                { ...where, 'metadata.deleted': false },
                { $set: { metadata: { deleted: true } } },
                { returnOriginal: false, projection: parseProjection(exclude) }
            );
        return { status: 200, json: document }
    },

    async makeTransaction (callback) {
        const session = await this.client
            .startSession()
            .withTransaction(callback);
        return session.endSession()
    }
})