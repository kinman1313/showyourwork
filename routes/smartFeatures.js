const express = require('express');
const router = express.Router();
const { auth, checkSubscription, checkFeatureAccess, trackUsage } = require('../middleware/auth');
const { User, Chore } = require('../models');
const {
    generateChoreSuggestions,
    generateSmartSchedule,
    adjustScheduleForWeather,
    generateChoreRotation
} = require('../services/smartFeatures');

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
            res.json({ suggestions });
        } catch (error) {
            console.error('Smart suggestions error:', error);
            res.status(500).json({ error: 'Failed to generate suggestions' });
        }
    });

// Generate smart schedule based on user's history
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
            res.json({ schedule });
        } catch (error) {
            console.error('Smart schedule error:', error);
            res.status(500).json({ error: 'Failed to generate schedule' });
        }
    });

// Adjust schedule based on weather conditions
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
                status: 'pending'
            });

            const adjustedSchedule = await adjustScheduleForWeather(user, currentChores);
            res.json({ adjustedSchedule });
        } catch (error) {
            console.error('Weather adjustment error:', error);
            res.status(500).json({ error: 'Failed to adjust schedule for weather' });
        }
    });

// Generate chore rotation suggestions
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
                assignedBy: user.parentId || user._id,
                status: 'pending'
            });

            const rotationSuggestions = await generateChoreRotation(familyMembers, currentChores);
            res.json({ rotationSuggestions });
        } catch (error) {
            console.error('Chore rotation error:', error);
            res.status(500).json({ error: 'Failed to generate chore rotation' });
        }
    });

module.exports = router; 