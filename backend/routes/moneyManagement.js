const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    SavingsGoal,
    Transaction,
    FinancialLessonProgress,
    MoneyGoal
} = require('../models/MoneyManagement');

// Get user's savings goals
router.get('/savings-goals', auth, async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ userId: req.user._id });
        res.json(goals);
    } catch (error) {
        console.error('Error fetching savings goals:', error);
        res.status(500).json({ error: 'Failed to fetch savings goals' });
    }
});

// Create a new savings goal
router.post('/savings-goals', auth, async (req, res) => {
    try {
        const goal = new SavingsGoal({
            ...req.body,
            userId: req.user._id
        });
        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating savings goal:', error);
        res.status(500).json({ error: 'Failed to create savings goal' });
    }
});

// Update savings goal progress
router.patch('/savings-goals/:id', auth, async (req, res) => {
    try {
        const goal = await SavingsGoal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );
        if (!goal) {
            return res.status(404).json({ error: 'Savings goal not found' });
        }
        res.json(goal);
    } catch (error) {
        console.error('Error updating savings goal:', error);
        res.status(500).json({ error: 'Failed to update savings goal' });
    }
});

// Get user's transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Record a new transaction
router.post('/transactions', auth, async (req, res) => {
    try {
        const transaction = new Transaction({
            ...req.body,
            userId: req.user._id
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Get financial lesson progress
router.get('/lessons/progress', auth, async (req, res) => {
    try {
        const progress = await FinancialLessonProgress.find({ userId: req.user._id });
        res.json(progress);
    } catch (error) {
        console.error('Error fetching lesson progress:', error);
        res.status(500).json({ error: 'Failed to fetch lesson progress' });
    }
});

// Update lesson progress
router.post('/lessons/progress', auth, async (req, res) => {
    try {
        const { lessonId, completed, pointsEarned } = req.body;
        const progress = await FinancialLessonProgress.findOneAndUpdate(
            { userId: req.user._id, lessonId },
            {
                $set: {
                    completed,
                    completedAt: completed ? new Date() : null,
                    pointsEarned
                }
            },
            { new: true, upsert: true }
        );
        res.json(progress);
    } catch (error) {
        console.error('Error updating lesson progress:', error);
        res.status(500).json({ error: 'Failed to update lesson progress' });
    }
});

// Get money goals and preferences
router.get('/goals', auth, async (req, res) => {
    try {
        let goals = await MoneyGoal.findOne({ userId: req.user._id });
        if (!goals) {
            goals = new MoneyGoal({ userId: req.user._id });
            await goals.save();
        }
        res.json(goals);
    } catch (error) {
        console.error('Error fetching money goals:', error);
        res.status(500).json({ error: 'Failed to fetch money goals' });
    }
});

// Update money goals and preferences
router.patch('/goals', auth, async (req, res) => {
    try {
        const goals = await MoneyGoal.findOneAndUpdate(
            { userId: req.user._id },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json(goals);
    } catch (error) {
        console.error('Error updating money goals:', error);
        res.status(500).json({ error: 'Failed to update money goals' });
    }
});

// Get financial summary
router.get('/summary', auth, async (req, res) => {
    try {
        const [transactions, goals, lessonProgress] = await Promise.all([
            Transaction.find({ userId: req.user._id }),
            MoneyGoal.findOne({ userId: req.user._id }),
            FinancialLessonProgress.find({ userId: req.user._id })
        ]);

        const totalEarnings = transactions
            .filter(t => t.type === 'earning')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalSavings = transactions
            .filter(t => t.type === 'saving')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalSpending = transactions
            .filter(t => t.type === 'spending')
            .reduce((sum, t) => sum + t.amount, 0);

        const completedLessons = lessonProgress.filter(l => l.completed).length;
        const totalPoints = lessonProgress.reduce((sum, l) => sum + l.pointsEarned, 0);

        res.json({
            totalEarnings,
            totalSavings,
            totalSpending,
            completedLessons,
            totalPoints,
            goals
        });
    } catch (error) {
        console.error('Error fetching financial summary:', error);
        res.status(500).json({ error: 'Failed to fetch financial summary' });
    }
});

module.exports = router; 