const express = require('express');
const router = express.Router();
const {
    generateChoreSuggestions,
    generateSmartSchedule,
    adjustScheduleForWeather,
    generateChoreRotation
} = require('../services/smartFeatures');
const auth = require('../middleware/auth');
const { checkSubscription, checkFeatureAccess, trackUsage } = require('../middleware/subscription');
const Chore = require('../models/Chore');
const User = require('../models/User');

// Get AI-powered chore suggestions
router.get('/suggestions',
    auth,
    checkSubscription,
    checkFeatureAccess('smartFeaturesEnabled'),
    trackUsage,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id).populate('familyId');
            const completedChores = await Chore.find({
                assignedTo: req.user._id,
                status: { $in: ['completed', 'verified', 'resolved'] }
            }).sort('-completedDate').limit(10);

            const suggestions = await generateChoreSuggestions(user, completedChores);
            res.json(suggestions);
        } catch (error) {
            console.error('Error getting chore suggestions:', error);
            res.status(500).json({ error: 'Failed to generate chore suggestions' });
        }
    });

// Generate smart schedule based on past performance
router.get('/smart-schedule',
    auth,
    checkSubscription,
    checkFeatureAccess('smartFeaturesEnabled'),
    trackUsage,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            const choreHistory = await Chore.find({
                assignedTo: req.user._id,
                status: { $in: ['completed', 'verified', 'resolved'] }
            }).sort('-completedDate');

            const schedule = await generateSmartSchedule(user, choreHistory);
            res.json(schedule);
        } catch (error) {
            console.error('Error generating smart schedule:', error);
            res.status(500).json({ error: 'Failed to generate smart schedule' });
        }
    });

// Check weather and adjust outdoor chores
router.get('/weather-adjust',
    auth,
    checkSubscription,
    checkFeatureAccess('smartFeaturesEnabled'),
    trackUsage,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            const currentChores = await Chore.find({
                assignedTo: req.user._id,
                status: 'pending',
                isOutdoor: true
            });

            const adjustedSchedule = await adjustScheduleForWeather(user, currentChores);
            res.json({ adjustedSchedule });
        } catch (error) {
            console.error('Error adjusting schedule for weather:', error);
            res.status(500).json({ error: 'Failed to adjust schedule for weather' });
        }
    });

// Rotate chores among family members
router.get('/rotate',
    auth,
    checkSubscription,
    checkFeatureAccess('smartFeaturesEnabled'),
    trackUsage,
    async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            const familyMembers = await User.find({
                familyId: user.familyId,
                role: 'child'
            });

            const currentChores = await Chore.find({
                familyId: user.familyId,
                status: 'pending'
            });

            const rotationSuggestions = await generateChoreRotation(familyMembers, currentChores);
            res.json({ rotationSuggestions });
        } catch (error) {
            console.error('Error rotating chores:', error);
            res.status(500).json({ error: 'Failed to generate chore rotation' });
        }
    });

module.exports = router; 