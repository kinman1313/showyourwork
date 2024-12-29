const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();

// Test endpoint for health check
app.get('/test-env', (req, res) => {
    res.json({
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request origin:', origin);
        console.log('Allowed origins:', process.env.NODE_ENV === 'production' ? [process.env.FRONTEND_URL] : ['http://localhost:3000']);

        if (process.env.NODE_ENV === 'production') {
            if (!origin || process.env.FRONTEND_URL.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        } else {
            callback(null, true);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ShowYourWork API' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['parent', 'child'], required: true },
    name: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For children to reference their parent
});

const User = mongoose.model('User', userSchema);

// Chore Schema
const choreSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    points: { type: Number, default: 0 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'assigned', 'completed', 'verified'], default: 'pending' },
    dueDate: Date,
    completedDate: Date
});

const Chore = mongoose.model('Chore', choreSchema);

// Forum Schema
const forumSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: false },
    allowedRoles: [{ type: String, enum: ['parent', 'child'] }]
});

// Topic Schema
const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isPinned: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [String]
});

// Comment Schema
const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Forum = mongoose.model('Forum', forumSchema);
const Topic = mongoose.model('Topic', topicSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('No token provided');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) throw new Error('User not found');

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Auth Routes
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, role, name, parentEmail } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object
        const userData = {
            email,
            password: hashedPassword,
            role,
            name
        };

        // If registering a child, link to parent
        if (role === 'child' && parentEmail) {
            const parent = await User.findOne({ email: parentEmail, role: 'parent' });
            if (!parent) {
                return res.status(400).json({ error: 'Parent email not found' });
            }
            userData.parentId = parent._id;
        }

        const user = new User(userData);
        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ token, user: { id: user._id, email, role, name } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, email, role: user.role, name: user.name } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset Request',
            html: `Please click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.`
        });

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Chore Routes
app.post('/chores', (req, res, next) => {
    console.log('Received request to /chores:', {
        method: req.method,
        headers: req.headers,
        body: req.body
    });
    next();
}, auth, async (req, res) => {
    try {
        console.log('Creating chore with data:', {
            body: req.body,
            user: {
                id: req.user._id,
                role: req.user.role,
                email: req.user.email
            }
        });

        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can create chores' });
        }

        // Validate required fields
        const { title, points, assignedTo, dueDate } = req.body;
        console.log('Validating fields:', {
            title: { value: title, type: typeof title },
            points: { value: points, type: typeof points },
            assignedTo: { value: assignedTo, type: typeof assignedTo },
            dueDate: { value: dueDate, type: typeof dueDate }
        });

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (points === undefined || points === null) {
            return res.status(400).json({ error: 'Points are required' });
        }
        if (!assignedTo) {
            return res.status(400).json({ error: 'AssignedTo is required' });
        }
        if (!dueDate) {
            return res.status(400).json({ error: 'Due date is required' });
        }

        // Validate assignedTo is a valid child
        const child = await User.findOne({ _id: assignedTo, parentId: req.user._id });
        console.log('Child lookup result:', child ? {
            id: child._id,
            name: child.name,
            parentId: child.parentId
        } : 'No child found');

        if (!child) {
            return res.status(400).json({ error: 'Invalid child assignment' });
        }

        const chore = new Chore({
            ...req.body,
            assignedBy: req.user._id,
            status: 'pending'
        });

        console.log('Chore object before save:', {
            ...chore.toObject(),
            validation: chore.validateSync()
        });

        await chore.save();
        console.log('Chore saved successfully:', chore.toObject());

        res.status(201).json(chore);
    } catch (error) {
        console.error('Error creating chore:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            errors: error.errors,
            body: req.body
        });
        res.status(400).json({
            error: error.message,
            type: error.name,
            details: error.errors ? Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })) : undefined
        });
    }
});

app.get('/chores', auth, async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can view all chores' });
        }
        const chores = await Chore.find({ assignedBy: req.user._id })
            .populate('assignedTo', 'name');
        res.json(chores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/chores/assigned', auth, async (req, res) => {
    try {
        if (req.user.role !== 'child') {
            return res.status(403).json({ error: 'Only children can view assigned chores' });
        }
        const chores = await Chore.find({ assignedTo: req.user._id })
            .populate('assignedBy', 'name');
        res.json(chores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/chores/:id/complete', auth, async (req, res) => {
    try {
        if (req.user.role !== 'child') {
            return res.status(403).json({ error: 'Only children can complete chores' });
        }

        const chore = await Chore.findOne({ _id: req.params.id, assignedTo: req.user._id });
        if (!chore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        if (chore.status !== 'assigned') {
            return res.status(400).json({ error: 'Chore cannot be completed' });
        }

        chore.status = 'completed';
        chore.completedDate = new Date();
        await chore.save();

        // Calculate total points
        const completedChores = await Chore.find({
            assignedTo: req.user._id,
            status: { $in: ['completed', 'verified'] }
        });
        const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);

        res.json({ chore, totalPoints });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/chores/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const validTransitions = {
            'pending': ['in_progress'],
            'in_progress': ['completed'],
            'completed': ['verified']
        };

        const chore = await Chore.findById(req.params.id);
        if (!chore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        // Check if user has permission to update status
        if (req.user.role === 'child') {
            if (chore.assignedTo.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to update this chore' });
            }
            if (!validTransitions[chore.status]?.includes(status)) {
                return res.status(400).json({ error: 'Invalid status transition' });
            }
        } else if (req.user.role === 'parent') {
            if (chore.assignedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to update this chore' });
            }
            if (status !== 'verified' || chore.status !== 'completed') {
                return res.status(400).json({ error: 'Parents can only verify completed chores' });
            }
        }

        chore.status = status;
        if (status === 'completed') {
            chore.completedDate = new Date();
        }
        await chore.save();

        res.json(chore);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/users/children', auth, async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can view children' });
        }
        const children = await User.find({ parentId: req.user._id }, 'name email');
        res.json(children);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/users/points', auth, async (req, res) => {
    try {
        if (req.user.role !== 'child') {
            return res.status(403).json({ error: 'Only children can view their points' });
        }

        const completedChores = await Chore.find({
            assignedTo: req.user._id,
            status: { $in: ['completed', 'verified'] }
        });
        const points = completedChores.reduce((sum, chore) => sum + chore.points, 0);

        res.json({ points });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a chore
app.put('/chores/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, points, assignedTo, dueDate } = req.body;

        // Verify the user is a parent
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can update chores' });
        }

        const updatedChore = await Chore.findByIdAndUpdate(
            id,
            {
                title,
                description,
                points,
                assignedTo,
                dueDate: new Date(dueDate)
            },
            { new: true }
        ).populate('assignedTo');

        if (!updatedChore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        res.json(updatedChore);
    } catch (error) {
        console.error('Update chore error:', error);
        res.status(500).json({ error: 'Failed to update chore' });
    }
});

// Delete a chore
app.delete('/chores/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify the user is a parent
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can delete chores' });
        }

        const deletedChore = await Chore.findByIdAndDelete(id);

        if (!deletedChore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        res.json({ message: 'Chore deleted successfully' });
    } catch (error) {
        console.error('Delete chore error:', error);
        res.status(500).json({ error: 'Failed to delete chore' });
    }
});

// Forum Routes
app.post('/forums', auth, async (req, res) => {
    try {
        const { name, description, isPrivate, allowedRoles } = req.body;

        // Only parents can create forums
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can create forums' });
        }

        const forum = new Forum({
            name,
            description,
            createdBy: req.user._id,
            moderators: [req.user._id],
            isPrivate,
            allowedRoles
        });

        await forum.save();
        res.status(201).json(forum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/forums', auth, async (req, res) => {
    try {
        const forums = await Forum.find({
            $or: [
                { isPrivate: false },
                { moderators: req.user._id },
                { allowedRoles: req.user.role }
            ]
        }).populate('createdBy', 'name').populate('moderators', 'name');
        res.json(forums);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Topic Routes
app.post('/forums/:forumId/topics', auth, async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const { forumId } = req.params;

        const forum = await Forum.findById(forumId);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        // Check if user has access to the forum
        if (forum.isPrivate &&
            !forum.moderators.includes(req.user._id) &&
            !forum.allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const topic = new Topic({
            title,
            content,
            forum: forumId,
            author: req.user._id,
            tags
        });

        await topic.save();
        await topic.populate('author', 'name');
        res.status(201).json(topic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/forums/:forumId/topics', auth, async (req, res) => {
    try {
        const { forumId } = req.params;
        const { sort = '-createdAt' } = req.query;

        const forum = await Forum.findById(forumId);
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        // Check if user has access to the forum
        if (forum.isPrivate &&
            !forum.moderators.includes(req.user._id) &&
            !forum.allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const topics = await Topic.find({ forum: forumId })
            .sort(sort)
            .populate('author', 'name')
            .populate('likes', 'name');
        res.json(topics);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Comment Routes
app.post('/topics/:topicId/comments', auth, async (req, res) => {
    try {
        const { content, parentCommentId } = req.body;
        const { topicId } = req.params;

        const topic = await Topic.findById(topicId).populate('forum');
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // Check if user has access to the forum
        if (topic.forum.isPrivate &&
            !topic.forum.moderators.includes(req.user._id) &&
            !topic.forum.allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const comment = new Comment({
            content,
            topic: topicId,
            author: req.user._id,
            parentComment: parentCommentId
        });

        await comment.save();
        await comment.populate('author', 'name');
        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/topics/:topicId/comments', auth, async (req, res) => {
    try {
        const { topicId } = req.params;

        const topic = await Topic.findById(topicId).populate('forum');
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // Check if user has access to the forum
        if (topic.forum.isPrivate &&
            !topic.forum.moderators.includes(req.user._id) &&
            !topic.forum.allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const comments = await Comment.find({ topic: topicId })
            .sort('createdAt')
            .populate('author', 'name')
            .populate('likes', 'name')
            .populate('parentComment');
        res.json(comments);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like/Unlike Routes
app.post('/topics/:topicId/like', auth, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        const hasLiked = topic.likes.includes(req.user._id);
        if (hasLiked) {
            topic.likes = topic.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            topic.likes.push(req.user._id);
        }

        await topic.save();
        res.json({ likes: topic.likes.length, hasLiked: !hasLiked });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/comments/:commentId/like', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const hasLiked = comment.likes.includes(req.user._id);
        if (hasLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            comment.likes.push(req.user._id);
        }

        await comment.save();
        res.json({ likes: comment.likes.length, hasLiked: !hasLiked });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove the static file serving section and replace with a catch-all route
app.get('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
}); 