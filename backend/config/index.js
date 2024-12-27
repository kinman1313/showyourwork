require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000',
    mongodb: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/chore-tracker'
    },
    jwt: {
        secret: process.env.JWT_SECRET
    },
    email: {
        service: process.env.EMAIL_SERVICE,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD
    }
}; 