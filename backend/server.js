const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const smartRoutes = require('./routes/smart');
const familyRoutes = require('./routes/family');
const moneyManagementRoutes = require('./routes/moneyManagement');
const forumRoutes = require('./routes/forum');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
    origin: 'https://showyourwork-frontend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());

// Mount all routes under /api
app.use('/api', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://showyourwork-frontend.onrender.com');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Basic test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Test environment route
app.get('/api/test-env', (req, res) => {
    res.json({ status: 'ok', message: 'Environment test successful' });
});

// Mount feature routes
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/smart', smartRoutes);
app.use('/api/money', moneyManagementRoutes);
app.use('/api/forum', forumRoutes);

// Catch-all route for undefined paths
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/api/test-env`);
});