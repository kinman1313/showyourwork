const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const smartFeaturesRoutes = require('./routes/smartFeatures');
require('dotenv').config();

const app = express();

// More permissive CORS setup for debugging
app.use(cors({
    origin: 'https://showyourwork-frontend.onrender.com',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    allowedHeaders: '*'
}));

// Body parser middleware
app.use(express.json());

// Smart features routes
app.use('/api/smart', smartFeaturesRoutes);

// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Test environment route
app.get('/test-env', (req, res) => {
    res.json({ status: 'ok', message: 'Environment test successful' });
});

// Auth routes
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Temporary test user
        if (email === 'test@example.com' && password === 'password123') {
            const token = jwt.sign(
                { userId: 1 },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            return res.json({
                token,
                user: { id: 1, email }
            });
        }

        res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Forums route
app.get('/forums', (req, res) => {
    // Temporary forum data
    const forums = [
        { id: 1, title: 'General Discussion', description: 'General topics' },
        { id: 2, title: 'Technical Support', description: 'Get help with technical issues' }
    ];

    res.json(forums);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/test-env`);
});