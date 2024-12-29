require('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    email: {
        service: process.env.EMAIL_SERVICE,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD
    },
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
};

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
});

module.exports = config; 