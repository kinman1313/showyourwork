const express = require('express');

const User = require('../models/User');

const Chore = require('../models/Chore');

const router = express.Router();



// Register a new user (for admins)

router.post('/register-user', async (req, res) => {

    const { username, password } = req.body;

    try {

        const user = new User({ username, password });

        await user.save();

        res.status(201).json({ message: 'User registered successfully', user });

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



// Create a chore (for admins)

router.post('/create-chore', async (req, res) => {

    const { name, assignedTo } = req.body;

    try {

        const chore = new Chore({ name, assignedTo });

        await chore.save();

        res.status(201).json(chore);

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



// Fetch all users (for admins)

router.get('/users', async (req, res) => {

    try {

        const users = await User.find({}, 'username');

        res.json(users);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});



module.exports = router;

