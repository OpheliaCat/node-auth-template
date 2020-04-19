const path = require('path');
const mongodbAdapter = require('./adapters/mongodb.adapter');
const server = require('./server');

require('dotenv').config({ path: path.resolve(process.cwd(), 'back', '.env') });

(async () => {
    try {
        await mongodbAdapter().connect();
        await mongodbAdapter().initIndexes('users');
        const port = process.env.PORT || 777;
        server.listen(port, () => console.log('Server runs on port %s...', port))
    } catch (error) {
        console.log(error);
        process.exit(0);
    }  
})()
