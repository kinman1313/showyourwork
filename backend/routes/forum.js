const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { ForumTopic, ForumPost } = require('../models/Forum');

// Get all topics
router.get('/topics', async (req, res) => {
    try {
        const topics = await ForumTopic.find()
            .populate('createdBy', 'name')
            .sort({ isSticky: -1, lastActivity: -1 });
        res.json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ error: 'Failed to fetch topics' });
    }
});

// Get single topic with posts
router.get('/topics/:id', async (req, res) => {
    try {
        const topic = await ForumTopic.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('posts.userId', 'name');

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // Increment view count
        topic.views += 1;
        await topic.save();

        res.json(topic);
    } catch (error) {
        console.error('Error fetching topic:', error);
        res.status(500).json({ error: 'Failed to fetch topic' });
    }
});

// Create new topic
router.post('/topics', auth, async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const topic = new ForumTopic({
            title,
            description,
            category,
            createdBy: req.user._id
        });
        await topic.save();

        const populatedTopic = await topic.populate('createdBy', 'name');
        res.status(201).json(populatedTopic);
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ error: 'Failed to create topic' });
    }
});

// Add post to topic
router.post('/topics/:id/posts', auth, async (req, res) => {
    try {
        const topic = await ForumTopic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (topic.isClosed) {
            return res.status(403).json({ error: 'This topic is closed' });
        }

        const post = {
            userId: req.user._id,
            content: req.body.content
        };

        topic.posts.push(post);
        topic.lastActivity = new Date();
        await topic.save();

        const updatedTopic = await ForumTopic.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('posts.userId', 'name');

        res.status(201).json(updatedTopic);
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).json({ error: 'Failed to add post' });
    }
});

// Update post
router.patch('/topics/:topicId/posts/:postId', auth, async (req, res) => {
    try {
        const topic = await ForumTopic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const post = topic.posts.id(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this post' });
        }

        post.content = req.body.content;
        post.updatedAt = new Date();
        await topic.save();

        const updatedTopic = await ForumTopic.findById(req.params.topicId)
            .populate('createdBy', 'name')
            .populate('posts.userId', 'name');

        res.json(updatedTopic);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Delete post
router.delete('/topics/:topicId/posts/:postId', auth, async (req, res) => {
    try {
        const topic = await ForumTopic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const post = topic.posts.id(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        post.remove();
        await topic.save();

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Like/Unlike post
router.post('/topics/:topicId/posts/:postId/like', auth, async (req, res) => {
    try {
        const topic = await ForumTopic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const post = topic.posts.id(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userLikeIndex = post.likes.indexOf(req.user._id);
        if (userLikeIndex === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(userLikeIndex, 1);
        }

        await topic.save();
        res.json({ likes: post.likes.length });
    } catch (error) {
        console.error('Error updating post likes:', error);
        res.status(500).json({ error: 'Failed to update likes' });
    }
});

// Close/Reopen topic (admin only)
router.patch('/topics/:id/status', auth, async (req, res) => {
    try {
        const topic = await ForumTopic.findById(req.params.id);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // TODO: Add admin check here
        topic.isClosed = req.body.isClosed;
        await topic.save();

        res.json(topic);
    } catch (error) {
        console.error('Error updating topic status:', error);
        res.status(500).json({ error: 'Failed to update topic status' });
    }
});

module.exports = router; 