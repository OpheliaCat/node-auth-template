const mongodbAdapter = require('./adapters/mongodb.adapter');
const server = require('./server');

(async () => {
    try {
        await mongodbAdapter().connect();
        const port = process.env.PORT || 777;
        server.listen(port, () => console.log('Server runs on port %s...', port))
    } catch (error) {
        console.log(error);
        process.exit(0);
    }  
})()
