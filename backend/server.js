const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const smartFeaturesRoutes = require('./routes/smartFeatures');
const familyRoutes = require('./routes/family');
const choresRoutes = require('./routes/chores');
const authRoutes = require('./routes/auth');
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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/smart', smartFeaturesRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/chores', choresRoutes);

// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Test environment route
app.get('/test-env', (req, res) => {
    res.json({ status: 'ok', message: 'Environment test successful' });
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