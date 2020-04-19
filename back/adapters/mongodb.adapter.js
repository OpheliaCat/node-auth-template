const { MongoClient } = require('mongodb');

const parseProjection = exclude => {
    const outputFormat = {};
    if (typeof exclude === 'string' && exclude.length !== 0) exclude
        .split(',')
        .forEach(key => outputFormat[key] = 0);
    return outputFormat
}

module.exports = () => Object.freeze({
    client: null,
    db: null, 
    
    async connect () {
        this.client = await MongoClient.connect(process.env.MONGO_URI);
        this.db = this.client.db()
    },

    async createCollection (collection) {
        const collection = this.db.collection(collection);
        await collection.createIndex({ deleted: 1 });
        
        return Object.freeze({
            list ({ limit, offset, sort, exclude, where = {} }) {
                return collection.aggregate([
                    { $match: { deleted: false }},
                    { $skip: parseInt(offset) || 0 },
                    { $limit: Math.min(parseInt(limit, 10) || 50, 50) },
                    { $match: where },
                    { $sort: sort },
                    { $project: parseProjection(exclude) }
                ])
            },
    
            get (collection, { where = {}, exclude }) {
                return collection.findOne(
                    { ...where, deleted: false }, 
                    parseProjection(exclude)
                )
            },
            
            set (collection, { where = {}, fields = {}, exclude }) {
                return collection.findOneAndUpdate(
                    { ...where, deleted: false },
                    { 
                        $set: { ...fields, deleted: false, updatedAt: Date() }, 
                        $setOnInsert: { createdAt: Date() }
                    },
                    { upsert: true, projection: parseProjection(exclude), returnOriginal: false }
                )
            },
        
            softDelete (collection, { where = {}, exclude }) {
                return collection.findOneAndUpdate(
                    { ...where, deleted: false },
                    { $set: { deleted: true } },
                    { returnOriginal: false, projection: parseProjection(exclude) }
                )
            },
        
            restore () { // TODO
        
            }
        })
    }
})
