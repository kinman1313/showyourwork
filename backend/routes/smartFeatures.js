const express = require('express');
const router = express.Router();
const {
    generateChoreSuggestions,
    generateSmartSchedule,
    checkWeatherAndAdjustSchedule,
    rotateChores
} = require('../services/smartFeatures');
const auth = require('../middleware/auth');

// Get AI-powered chore suggestions
router.get('/suggestions', auth, async (req, res) => {
    try {
        const userPreferences = req.user.preferences;
        const completedChores = await Chore.find({
            assignedTo: req.user._id,
            status: 'completed'
        });

        const suggestions = await generateChoreSuggestions(userPreferences, completedChores);
        res.json(suggestions);
    } catch (error) {
        console.error('Error getting chore suggestions:', error);
        res.status(500).json({ error: 'Failed to generate chore suggestions' });
    }
});

// Generate smart schedule based on past performance
router.get('/smart-schedule', auth, async (req, res) => {
    try {
        const choreHistory = await Chore.find({
            assignedTo: req.user._id
        }).sort('-completedAt');

        const schedule = await generateSmartSchedule(req.user._id, choreHistory);
        res.json(schedule);
    } catch (error) {
        console.error('Error generating smart schedule:', error);
        res.status(500).json({ error: 'Failed to generate smart schedule' });
    }
});

// Check weather and adjust outdoor chores
router.post('/weather-adjust', auth, async (req, res) => {
    try {
        const { location } = req.body;
        const outdoorChores = await Chore.find({
            assignedTo: req.user._id,
            isOutdoor: true,
            status: 'pending'
        });

        const adjustedSchedule = await checkWeatherAndAdjustSchedule(location, outdoorChores);
        res.json(adjustedSchedule);
    } catch (error) {
        console.error('Error adjusting schedule for weather:', error);
        res.status(500).json({ error: 'Failed to adjust schedule for weather' });
    }
});

// Rotate chores among family members
router.post('/rotate', auth, async (req, res) => {
    try {
        const familyMembers = await User.find({
            familyId: req.user.familyId
        });

        const chores = await Chore.find({
            familyId: req.user.familyId,
            status: 'active'
        });

        const rotationSchedule = await rotateChores(familyMembers, chores);
        res.json(rotationSchedule);
    } catch (error) {
        console.error('Error rotating chores:', error);
        res.status(500).json({ error: 'Failed to rotate chores' });
    }
});

module.exports = router; 