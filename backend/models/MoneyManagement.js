const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['earning', 'spending', 'saving'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['chores', 'allowance', 'gift', 'other'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const financialLessonProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonId: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    pointsEarned: {
        type: Number,
        default: 0
    }
});

const moneyGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weeklyAllowance: {
        type: Number,
        default: 0
    },
    savingsPercentage: {
        type: Number,
        default: 20
    },
    spendingPercentage: {
        type: Number,
        default: 60
    },
    donationPercentage: {
        type: Number,
        default: 20
    }
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const FinancialLessonProgress = mongoose.model('FinancialLessonProgress', financialLessonProgressSchema);
const MoneyGoal = mongoose.model('MoneyGoal', moneyGoalSchema);

module.exports = {
    SavingsGoal,
    Transaction,
    FinancialLessonProgress,
    MoneyGoal
}; 