const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Family = require('../models/Family');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');

// Get family data for the current user
router.get('/me/family', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('familyId');
        if (!user || !user.familyId) {
            return res.status(404).json({ error: 'No family found' });
        }

        const [parents, children] = await Promise.all([
            User.find({ familyId: user.familyId._id, role: 'parent' }, 'name email'),
            User.find({ familyId: user.familyId._id, role: 'child' }, 'name email')
        ]);

        res.json({
            familyId: user.familyId._id,
            name: user.familyId.name,
            inviteCode: user.familyId.inviteCode,
            parents,
            children,
            settings: user.familyId.settings
        });
    } catch (error) {
        console.error('Get family error:', error);
        res.status(500).json({ error: 'Failed to fetch family data' });
    }
});

// Generate new invite code
router.post('/invite-code', auth, async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can generate invite codes' });
        }

        const user = await User.findById(req.user._id).populate('familyId');
        if (!user || !user.familyId) {
            return res.status(404).json({ error: 'No family found' });
        }

        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        user.familyId.inviteCode = inviteCode;
        await user.familyId.save();

        res.json({ inviteCode });
    } catch (error) {
        console.error('Generate invite code error:', error);
        res.status(500).json({ error: 'Failed to generate invite code' });
    }
});

// Join family with invite code
router.post('/join', auth, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        if (!inviteCode) {
            return res.status(400).json({ error: 'Invite code is required' });
        }

        const family = await Family.findOne({ inviteCode });
        if (!family) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.familyId = family._id;
        await user.save();

        res.json({ message: 'Successfully joined family' });
    } catch (error) {
        console.error('Join family error:', error);
        res.status(500).json({ error: 'Failed to join family' });
    }
});

module.exports = router; 