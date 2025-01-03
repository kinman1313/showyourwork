const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    subscription: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    featureUsage: [{
        date: String,
        count: Number
    }],
    settings: {
        allowChildChoreCreation: {
            type: Boolean,
            default: false
        },
        requireParentVerification: {
            type: Boolean,
            default: true
        },
        pointsPerChore: {
            type: Number,
            default: 10
        },
        bonusPoints: {
            type: Number,
            default: 5
        },
        smartFeaturesEnabled: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Generate a random invite code before saving if one doesn't exist
familySchema.pre('save', async function (next) {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Family = mongoose.model('Family', familySchema);

module.exports = Family; 