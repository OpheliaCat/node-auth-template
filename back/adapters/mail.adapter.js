const mailer = require('nodemailer');

module.exports = {
    transport: null,
    
    initTransport: () => {
        this.transport = mailer.createTransport({

        })
    }
}