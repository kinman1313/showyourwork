const mongoose = require('mongoose');

const choreSchema = new mongoose.Schema({
    title: {
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
        enum: ['pending', 'completed', 'verified', 'rescheduled'],
        default: 'pending'
    },
    isOutdoor: {
        type: Boolean,
        default: false
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    completedAt: Date,
    completionTime: Number,
    points: {
        type: Number,
        default: 0
    },
    note: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
choreSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const Chore = mongoose.model('Chore', choreSchema);

module.exports = Chore;