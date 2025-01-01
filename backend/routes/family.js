const express = require('express');
const router = express.Router();
const Family = require('../models/Family');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a new family
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can create families' });
        }

        const { name } = req.body;
        const family = new Family({
            name,
            createdBy: req.user._id,
            parents: [req.user._id]
        });

        await family.save();

        // Update the user's family reference
        await User.findByIdAndUpdate(req.user._id, { family: family._id });

        res.status(201).json(family);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Join a family using invite code
router.post('/join/:inviteCode', auth, async (req, res) => {
    try {
        const family = await Family.findOne({ inviteCode: req.params.inviteCode });
        if (!family) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        // Check if user is already in a family
        if (req.user.family) {
            return res.status(400).json({ error: 'User is already in a family' });
        }

        // Add user to appropriate array based on role
        if (req.user.role === 'parent') {
            if (!family.settings.allowMultipleParents) {
                return res.status(400).json({ error: 'This family does not allow multiple parents' });
            }
            family.parents.push(req.user._id);
        } else {
            family.children.push(req.user._id);
        }

        await family.save();

        // Update user's family reference
        await User.findByIdAndUpdate(req.user._id, { family: family._id });

        res.json(family);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get family details
router.get('/', auth, async (req, res) => {
    try {
        if (!req.user.family) {
            return res.status(404).json({ error: 'User is not part of a family' });
        }

        const family = await Family.findById(req.user.family)
            .populate('parents', 'name email')
            .populate('children', 'name email age');

        res.json(family);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update family settings
router.put('/settings', auth, async (req, res) => {
    try {
        const family = await Family.findById(req.user.family);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        if (!family.parents.includes(req.user._id)) {
            return res.status(403).json({ error: 'Only parents can update family settings' });
        }

        family.settings = { ...family.settings, ...req.body };
        await family.save();

        res.json(family);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Generate new invite code
router.post('/invite-code', auth, async (req, res) => {
    try {
        const family = await Family.findById(req.user.family);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        if (!family.parents.includes(req.user._id)) {
            return res.status(403).json({ error: 'Only parents can generate invite codes' });
        }

        family.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await family.save();

        res.json({ inviteCode: family.inviteCode });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove member from family
router.delete('/members/:userId', auth, async (req, res) => {
    try {
        const family = await Family.findById(req.user.family);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        if (!family.parents.includes(req.user._id)) {
            return res.status(403).json({ error: 'Only parents can remove family members' });
        }

        const memberToRemove = await User.findById(req.params.userId);
        if (!memberToRemove) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (memberToRemove.role === 'parent') {
            family.parents = family.parents.filter(id => id.toString() !== req.params.userId);
        } else {
            family.children = family.children.filter(id => id.toString() !== req.params.userId);
        }

        await family.save();

        // Remove family reference from user
        await User.findByIdAndUpdate(req.params.userId, { $unset: { family: 1 } });

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 