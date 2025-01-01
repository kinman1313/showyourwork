const express = require('express');
const router = express.Router();
const Chore = require('../models/Chore');
const User = require('../models/User');
const Family = require('../models/Family');
const auth = require('../middleware/auth');

// Helper function to check if user is a parent in the family
const isParentInFamily = async (userId, familyId) => {
    const family = await Family.findById(familyId);
    return family && family.parents.includes(userId);
};

// Get all chores for the family
router.get('/family', auth, async (req, res) => {
    try {
        if (!req.user.family) {
            return res.status(404).json({ error: 'User is not part of a family' });
        }

        const chores = await Chore.find({ family: req.user.family })
            .populate('assignedTo', 'name')
            .populate('assignedBy', 'name')
            .populate('verifiedBy', 'name')
            .sort({ dueDate: 1 });

        res.json(chores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get chores assigned to specific user
router.get('/my-chores', auth, async (req, res) => {
    try {
        const chores = await Chore.find({
            family: req.user.family,
            assignedTo: req.user._id
        })
            .populate('assignedTo', 'name')
            .populate('assignedBy', 'name')
            .populate('verifiedBy', 'name')
            .sort({ dueDate: 1 });

        res.json(chores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create a new chore
router.post('/', auth, async (req, res) => {
    try {
        if (!req.user.family) {
            return res.status(404).json({ error: 'User is not part of a family' });
        }

        if (!(await isParentInFamily(req.user._id, req.user.family))) {
            return res.status(403).json({ error: 'Only parents can create chores' });
        }

        const chore = new Chore({
            ...req.body,
            family: req.user.family,
            assignedBy: req.user._id
        });

        await chore.save();

        await chore.populate([
            { path: 'assignedTo', select: 'name' },
            { path: 'assignedBy', select: 'name' }
        ]);

        res.status(201).json(chore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update chore status
router.patch('/:choreId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const chore = await Chore.findById(req.params.choreId);

        if (!chore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        if (chore.family.toString() !== req.user.family.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this chore' });
        }

        // Only assigned child or family parents can update status
        const isParent = await isParentInFamily(req.user._id, req.user.family);
        const isAssignedChild = chore.assignedTo.toString() === req.user._id.toString();

        if (!isParent && !isAssignedChild) {
            return res.status(403).json({ error: 'Not authorized to update this chore' });
        }

        // If child is marking as completed
        if (status === 'completed' && isAssignedChild) {
            chore.completedDate = new Date();
        }

        // If parent is verifying
        if (status === 'verified' && isParent) {
            chore.verifiedBy = req.user._id;
            chore.verifiedDate = new Date();
        }

        chore.status = status;
        await chore.save();

        await chore.populate([
            { path: 'assignedTo', select: 'name' },
            { path: 'assignedBy', select: 'name' },
            { path: 'verifiedBy', select: 'name' }
        ]);

        res.json(chore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add note to chore
router.post('/:choreId/notes', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const chore = await Chore.findById(req.params.choreId);

        if (!chore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        if (chore.family.toString() !== req.user.family.toString()) {
            return res.status(403).json({ error: 'Not authorized to add notes to this chore' });
        }

        chore.notes.push({
            content,
            addedBy: req.user._id
        });

        await chore.save();
        await chore.populate({
            path: 'notes.addedBy',
            select: 'name'
        });

        res.json(chore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete chore (parents only)
router.delete('/:choreId', auth, async (req, res) => {
    try {
        const chore = await Chore.findById(req.params.choreId);

        if (!chore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        if (chore.family.toString() !== req.user.family.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this chore' });
        }

        if (!(await isParentInFamily(req.user._id, req.user.family))) {
            return res.status(403).json({ error: 'Only parents can delete chores' });
        }

        await chore.remove();
        res.json({ message: 'Chore deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get chore statistics for family
router.get('/stats', auth, async (req, res) => {
    try {
        if (!req.user.family) {
            return res.status(404).json({ error: 'User is not part of a family' });
        }

        const stats = await Chore.aggregate([
            { $match: { family: req.user.family } },
            {
                $group: {
                    _id: '$assignedTo',
                    totalChores: { $sum: 1 },
                    completedChores: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                        }
                    },
                    verifiedChores: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'verified'] }, 1, 0]
                        }
                    },
                    totalPoints: { $sum: '$points' }
                }
            }
        ]);

        // Populate user details for each stat entry
        const populatedStats = await User.populate(stats, {
            path: '_id',
            select: 'name'
        });

        res.json(populatedStats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
