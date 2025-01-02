const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['savings', 'education', 'toys', 'charity', 'other'],
        default: 'savings'
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'savings'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const lessonProgressSchema = new mongoose.Schema({
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
    score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const moneyGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weeklyAllowance: {
        type: Number,
        required: true,
        min: 0
    },
    savingsPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    spendingPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    donationPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Validate that percentages add up to 100
moneyGoalSchema.pre('save', function (next) {
    const total = this.savingsPercentage + this.spendingPercentage + this.donationPercentage;
    if (total !== 100) {
        next(new Error('Percentages must add up to 100'));
    }
    next();
});

// Update isCompleted when currentAmount reaches targetAmount
savingsGoalSchema.pre('save', function (next) {
    if (this.currentAmount >= this.targetAmount) {
        this.isCompleted = true;
    }
    next();
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
const MoneyGoal = mongoose.model('MoneyGoal', moneyGoalSchema);

module.exports = {
    SavingsGoal,
    Transaction,
    LessonProgress,
    MoneyGoal
};