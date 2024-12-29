const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Test route
router.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});

// Register
router.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const user = new User({ username, password });
        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 