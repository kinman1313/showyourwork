const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration - MUST be before any routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://showyourwork-frontend.onrender.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Parse JSON bodies
app.use(express.json());

// Test route
app.get('/test-env', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
app.use('/auth', require('./routes/auth'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});