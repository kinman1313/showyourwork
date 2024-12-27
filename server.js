require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const app = express();

// Enable CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// MongoDB Connection with error handling
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('MongoDB Atlas connection error:', err);
        // Continue running the server even if MongoDB fails
    });

// Add a test connection using native MongoDB driver
const testMongoConnection = async () => {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        console.log('MongoDB driver connection successful');
        await client.close();
    } catch (err) {
        console.error('MongoDB driver connection error:', err);
    }
};

testMongoConnection();

// Test route - doesn't require MongoDB
app.get('/test-env', (req, res) => {
    try {
        // Set proper JSON headers
        res.setHeader('Content-Type', 'application/json');
        res.json({
            success: true,
            nodeEnv: process.env.NODE_ENV,
            port: process.env.PORT,
            serverTime: new Date().toISOString(),
            mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Add this to handle internationalized domain names without punycode
const { toASCII } = require('url');

// If you're handling domains, use this instead of direct punycode
const handleDomain = (domain) => {
    try {
        return new URL(domain).hostname;
    } catch {
        return domain;
    }
};

// Your existing server setup...
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
}); 