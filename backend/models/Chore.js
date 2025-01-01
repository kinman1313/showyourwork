const mongoose = require('mongoose');

const ChoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    family: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'verified'],
        default: 'pending'
    },
    points: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date,
        required: true
    },
    completedDate: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedDate: Date,
    recurring: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: function () { return this.recurring.isRecurring; }
        },
        endDate: Date
    },
    notes: [{
        content: String,
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Index for efficient queries
ChoreSchema.index({ family: 1, status: 1 });
ChoreSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Chore', ChoreSchema);