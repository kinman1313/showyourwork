const express = require('express');

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const User = require('../models/User');

const { sendResetEmail } = require('../utils/email');

const router = express.Router();



// Register

router.post('/register', async (req, res) => {

    const { username, password, isParent } = req.body;

    try {

        const role = isParent ? 'parent' : 'kid';

        const user = new User({ username, password, role });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



// Login

router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    try {

        const user = await User.findOne({ username });

        if (!user) throw new Error('User not found');



        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) throw new Error('Invalid credentials');



        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, userId: user._id });

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



// Request password reset

router.post('/request-reset', async (req, res) => {

    const { email } = req.body;

    try {

        const user = await User.findOne({ username: email });

        if (!user) throw new Error('User not found');



        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetToken = resetToken;

        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour

        await user.save();



        sendResetEmail(email, resetToken);

        res.json({ message: 'Reset email sent' });

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



// Reset password

router.post('/reset-password', async (req, res) => {

    const { token, newPassword } = req.body;

    try {

        const user = await User.findOne({

            resetToken: token,

            resetTokenExpiration: { $gt: Date.now() },

        });

        if (!user) throw new Error('Invalid or expired token');



        user.password = newPassword;

        user.resetToken = undefined;

        user.resetTokenExpiration = undefined;

        await user.save();



        res.json({ message: 'Password reset successfully' });

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



module.exports = router;
