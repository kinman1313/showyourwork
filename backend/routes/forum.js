const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Forum = require('../models/Forum');
const User = require('../models/User');

// Get all topics
router.get('/topics', auth, async (req, res) => {
    try {
        const topics = await Forum.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(topics);
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Get single topic
router.get('/topics/:id', auth, async (req, res) => {
    try {
        const topic = await Forum.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('posts.user', 'name');
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        res.json(topic);
    } catch (error) {
        console.error('Get topic error:', error);
        res.status(500).json({ error: 'Failed to fetch topic' });
    }
});

// Create new topic
router.post('/topics', auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const topic = new Forum({
            title,
            content,
            createdBy: req.user.id
        });
        await topic.save();
        res.status(201).json(topic);
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({ error: 'Failed to create topic' });
    }
});

// Add post to topic
router.post('/topics/:id/posts', auth, async (req, res) => {
    try {
        const topic = await Forum.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const { content } = req.body;
        topic.posts.push({
            content,
            user: req.user.id
        });

        await topic.save();
        res.status(201).json(topic);
    } catch (error) {
        console.error('Add post error:', error);
        res.status(500).json({ error: 'Failed to add post' });
    }
});

// Update post
router.patch('/topics/:topicId/posts/:postId', auth, async (req, res) => {
    try {
        const topic = await Forum.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const post = topic.posts.id(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        post.content = req.body.content;
        await topic.save();
        res.json(topic);
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete post
router.delete('/topics/:topicId/posts/:postId', auth, async (req, res) => {
    try {
        const topic = await Forum.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const post = topic.posts.id(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        post.remove();
        await topic.save();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

module.exports = router; 