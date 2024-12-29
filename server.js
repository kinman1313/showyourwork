const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://chore-tracker-frontend.onrender.com']
        : ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

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
    status: { type: String, enum: ['pending', 'completed', 'verified'], default: 'pending' },
    dueDate: Date,
    completedDate: Date
});

const Chore = mongoose.model('Chore', choreSchema);

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
app.post('/chores', auth, async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Only parents can create chores' });
        }

        const chore = new Chore({
            ...req.body,
            assignedBy: req.user._id
        });
        await chore.save();
        res.status(201).json(chore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/chores', auth, async (req, res) => {
    try {
        let chores;
        if (req.user.role === 'parent') {
            chores = await Chore.find({ assignedBy: req.user._id })
                .populate('assignedTo', 'name');
        } else {
            chores = await Chore.find({ assignedTo: req.user._id })
                .populate('assignedBy', 'name');
        }
        res.json(chores);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.patch('/chores/:id/status', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const chore = await Chore.findById(id);

        if (!chore) {
            return res.status(404).json({ error: 'Chore not found' });
        }

        if (req.user.role === 'child' && status === 'completed') {
            chore.status = status;
            chore.completedDate = new Date();
        } else if (req.user.role === 'parent' && status === 'verified') {
            chore.status = status;
        } else {
            return res.status(403).json({ error: 'Invalid status update' });
        }

        await chore.save();
        res.json(chore);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
    });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 