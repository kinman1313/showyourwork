const mongoose = require('mongoose');

const choreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'overdue', 'rescheduled', 'active'],
        default: 'pending'
    },
    points: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    completionTime: {
        type: Number // in minutes
    },
    isOutdoor: {
        type: Boolean,
        default: false
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    recurring: {
        type: Boolean,
        default: false
    },
    recurringPattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', null],
        default: null
    },
    preferredTimeOfDay: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', null],
        default: null
    },
    weatherSensitive: {
        type: Boolean,
        default: false
    },
    estimatedDuration: {
        type: Number, // in minutes
        default: 30
    },
    category: {
        type: String,
        enum: ['indoor', 'outdoor', 'homework', 'personal', 'other'],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    note: {
        type: String
    },
    history: [{
        status: String,
        timestamp: Date,
        completionTime: Number,
        note: String
    }]
}, {
    timestamps: true
});

// Middleware to update history before saving
choreSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.history.push({
            status: this.status,
            timestamp: new Date(),
            completionTime: this.completionTime,
            note: this.note
        });
    }
    next();
});

// Method to calculate success rate
choreSchema.methods.calculateSuccessRate = function () {
    if (!this.history.length) return 0;
    const completed = this.history.filter(record => record.status === 'completed').length;
    return (completed / this.history.length) * 100;
};

// Method to get optimal time based on history
choreSchema.methods.getOptimalTime = function () {
    const completedTasks = this.history.filter(record => record.status === 'completed');
    if (!completedTasks.length) return null;

    const timeSlots = completedTasks.reduce((acc, record) => {
        const hour = new Date(record.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});

    const optimalHour = Object.entries(timeSlots)
        .sort(([, a], [, b]) => b - a)[0][0];

    return parseInt(optimalHour);
};

module.exports = mongoose.model('Chore', choreSchema);