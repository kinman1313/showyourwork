const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Family = require('../models/Family');
const auth = require('../middleware/auth');

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

module.exports = router;
