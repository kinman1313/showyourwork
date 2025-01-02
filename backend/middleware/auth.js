const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Family = require('../models/Family');
const Chore = require('../models/Chore');

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('No token provided');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('User not found');

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Subscription check middleware
const checkSubscription = async (req, res, next) => {
    try {
        const family = await Family.findById(req.user.familyId);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        // Check subscription status
        if (family.subscription.status === 'inactive') {
            return res.status(403).json({ error: 'Subscription is inactive' });
        }

        // Check if trial has expired
        if (family.subscription.status === 'trial' &&
            family.subscription.trialEnds &&
            new Date() > family.subscription.trialEnds) {
            family.subscription.status = 'inactive';
            await family.save();
            return res.status(403).json({ error: 'Trial period has expired' });
        }

        req.family = family;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify subscription' });
    }
};

// Feature access middleware
const checkFeatureAccess = (feature) => async (req, res, next) => {
    try {
        const family = req.family || await Family.findById(req.user.familyId);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        // Check if the feature is enabled for the family's subscription
        if (!family.subscription.features[feature]) {
            return res.status(403).json({
                error: 'Feature not available in current plan',
                feature,
                currentPlan: family.subscription.plan,
                upgrade: true
            });
        }

        // Check usage limits
        if (feature === 'maxChoresPerMonth') {
            const currentMonth = new Date();
            currentMonth.setDate(1);
            currentMonth.setHours(0, 0, 0, 0);

            const choreCount = await Chore.countDocuments({
                familyId: family._id,
                createdAt: { $gte: currentMonth }
            });

            if (choreCount >= family.subscription.features.maxChoresPerMonth) {
                return res.status(403).json({
                    error: 'Monthly chore limit reached',
                    limit: family.subscription.features.maxChoresPerMonth,
                    current: choreCount,
                    upgrade: true
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify feature access' });
    }
};

// Usage tracking middleware
const trackUsage = async (req, res, next) => {
    try {
        const family = req.family || await Family.findById(req.user.familyId);
        if (!family) {
            return res.status(404).json({ error: 'Family not found' });
        }

        // Update last activity date
        family.statistics.lastActivityDate = new Date();

        // Update monthly stats
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        let monthStats = family.statistics.monthlyStats.find(
            stat => stat.month.getMonth() === monthStart.getMonth() &&
                stat.month.getFullYear() === monthStart.getFullYear()
        );

        if (!monthStats) {
            monthStats = {
                month: monthStart,
                choresCompleted: 0,
                pointsAwarded: 0,
                activeUsers: 0
            };
            family.statistics.monthlyStats.push(monthStats);
        }

        await family.save();
        next();
    } catch (error) {
        // Don't block the request if usage tracking fails
        console.error('Usage tracking error:', error);
        next();
    }
};

module.exports = {
    auth,
    checkSubscription,
    checkFeatureAccess,
    trackUsage
}; 