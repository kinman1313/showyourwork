const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
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

const forumTopicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'help', 'suggestions', 'announcements'],
        default: 'general'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    posts: [forumPostSchema],
    views: {
        type: Number,
        default: 0
    },
    isSticky: {
        type: Boolean,
        default: false
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add middleware to update lastActivity
forumTopicSchema.pre('save', function (next) {
    this.lastActivity = new Date();
    next();
});

const ForumTopic = mongoose.model('ForumTopic', forumTopicSchema);
const ForumPost = mongoose.model('ForumPost', forumPostSchema);

module.exports = {
    ForumTopic,
    ForumPost
}; 