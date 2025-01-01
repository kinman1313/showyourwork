const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    settings: {
        allowMultipleParents: {
            type: Boolean,
            default: true
        },
        requireParentApproval: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });

// Generate unique invite code before saving
FamilySchema.pre('save', async function (next) {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Family', FamilySchema); 