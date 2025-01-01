const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Family = require('../models/Family');
const auth = require('../middleware/auth');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, familyData } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const user = new User({
            email,
            password,
            name,
            role
        });

        // Handle family creation/joining
        if (role === 'parent') {
            if (familyData?.createFamily) {
                // Create new family
                const family = new Family({
                    name: familyData.familyName || `${name}'s Family`,
                    createdBy: user._id,
                    parents: [user._id]
                });
                await family.save();
                user.family = family._id;
            } else if (familyData?.inviteCode) {
                // Join existing family
                const family = await Family.findOne({ inviteCode: familyData.inviteCode });
                if (!family) {
                    return res.status(404).json({ error: 'Invalid family invite code' });
                }
                if (!family.settings.allowMultipleParents) {
                    return res.status(400).json({ error: 'This family does not allow multiple parents' });
                }
                family.parents.push(user._id);
                await family.save();
                user.family = family._id;
            }
        } else if (role === 'child') {
            if (!familyData?.inviteCode) {
                return res.status(400).json({ error: 'Children must provide a family invite code' });
            }
            // Join family
            const family = await Family.findOne({ inviteCode: familyData.inviteCode });
            if (!family) {
                return res.status(400).json({ error: 'Invalid family invite code' });
            }
            family.children.push(user._id);
            await family.save();
            user.family = family._id;
        }

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                family: user.family
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('family', 'name inviteCode');

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

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                family: user.family
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get current user's family details
router.get('/me/family', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'family',
            populate: [
                { path: 'parents', select: 'name email' },
                { path: 'children', select: 'name email age' }
            ]
        });

        if (!user.family) {
            return res.status(404).json({ error: 'User is not part of a family' });
        }

        res.json(user.family);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = newPassword; // The pre-save hook will hash the password
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
