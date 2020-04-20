const { MongoClient, ObjectID } = require('mongodb');

let client = null;
let db = null;

const parseProjection = exclude => {
    const outputFormat = {};
    if (typeof exclude === 'string' && exclude.length !== 0) exclude
        .split(',')
        .forEach(key => outputFormat[key] = 0);
    return outputFormat
}

module.exports = Object.freeze({
    
    async connect () {
        client = await MongoClient.connect(
            process.env.MONGODB_URI,
            { useUnifiedTopology: true }
        );
        db = client.db()
    },

    moveTo (name) {
        const collection = db.collection(name);
        
        return Object.freeze({
            async initIndexes () {
                return collection
                    .createIndexes([{ 
                        key: { deleted: 1 }, 
                        name: 'deleted'  
                    }])
            },
            
            async list ({ limit, offset, sort, exclude, where }) {
                const pipeline = [
                    { $match: { deleted: false }},
                    { $skip: parseInt(offset, 10) || 0 },
                    { $limit: Math.min(parseInt(limit, 10) || 50, 50) }
                ];
                if (where) pipeline.push({ $match: where });
                if (sort) pipeline.push({ $sort: sort });
                if (exclude) pipeline.push({ $project: parseProjection(exclude) });
                return collection
                    .aggregate(pipeline)
                    .toArray()
            },
    
            async get ({ where = {}, exclude }) {
                return collection.findOne(
                    { ...where, deleted: false }, 
                    parseProjection(exclude)
                )
            },
            
            async set ({ id, fields = {}, exclude }) {
                const { value } = await collection.findOneAndUpdate(
                    { _id: ObjectID.isValid(id) ? ObjectID(id) : ObjectID(), deleted: false },
                    { 
                        $set: { ...fields, deleted: false, updatedAt: Date() }, 
                        $setOnInsert: { createdAt: Date() }
                    },
                    { upsert: true, projection: parseProjection(exclude), returnOriginal: false }
                );
                return value
            },
        
            async softDelete ({ id, exclude }) {
                const { value } = await collection.findOneAndUpdate(
                    { _id: ObjectID(id), deleted: false },
                    { $set: { deleted: true } },
                    { returnOriginal: false, projection: parseProjection(exclude) }
                );
                return value
            },
        
            restore () { // TODO
        
            }
        })
    }
})
