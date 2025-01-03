const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'Token is not valid' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

const checkSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('familyId');
        if (!user.familyId || !user.familyId.subscription) {
            return res.status(403).json({ error: 'Premium subscription required' });
        }
        next();
    } catch (error) {
        console.error('Check subscription error:', error);
        res.status(500).json({ error: 'Failed to verify subscription' });
    }
};

const checkFeatureAccess = (feature) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('familyId');
        if (!user.familyId?.settings?.[feature]) {
            return res.status(403).json({ error: 'Feature not enabled' });
        }
        next();
    } catch (error) {
        console.error('Check feature access error:', error);
        res.status(500).json({ error: 'Failed to verify feature access' });
    }
};

const trackUsage = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('familyId');
        if (!user.familyId) {
            return next();
        }

        const today = new Date().toISOString().split('T')[0];
        const usageIndex = user.familyId.featureUsage.findIndex(u => u.date === today);

        if (usageIndex === -1) {
            user.familyId.featureUsage.push({ date: today, count: 1 });
        } else {
            user.familyId.featureUsage[usageIndex].count += 1;
        }

        // Keep only last 30 days of usage
        user.familyId.featureUsage = user.familyId.featureUsage
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 30);

        await user.familyId.save();
        next();
    } catch (error) {
        console.error('Track usage error:', error);
        next(); // Continue even if tracking fails
    }
};

module.exports = { auth, checkSubscription, checkFeatureAccess, trackUsage }; 