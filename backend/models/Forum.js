const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const forumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    posts: [postSchema],
    views: {
        type: Number,
        default: 0
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    isSticky: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['general', 'help', 'suggestions', 'announcements'],
        default: 'general'
    }
}, {
    timestamps: true
});

// Update updatedAt timestamp before saving
postSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Forum = mongoose.model('Forum', forumSchema);

module.exports = Forum; 