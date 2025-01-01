const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    settings: {
        allowMultipleParents: {
            type: Boolean,
            default: true
        },
        choreRotationEnabled: {
            type: Boolean,
            default: false
        },
        pointsEnabled: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Generate invite code before saving if one doesn't exist
familySchema.pre('save', function (next) {
    if (!this.inviteCode) {
        this.inviteCode = require('crypto').randomBytes(4).toString('hex').toUpperCase();
    }
    next();
});

const Family = mongoose.model('Family', familySchema);

module.exports = Family; 