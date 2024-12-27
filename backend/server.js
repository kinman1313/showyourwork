const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

require('dotenv').config();



const authRoutes = require('./routes/auth');

const choreRoutes = require('./routes/chores');

const adminRoutes = require('./routes/admin');



const app = express();

const PORT = process.env.PORT || 5000;



// Middleware

app.use(cors());

app.use(express.json());



// MongoDB Connection

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

    .then(() => console.log('MongoDB connected'))

    .catch(err => console.log(err));



// Routes

app.use('/api/auth', authRoutes);

app.use('/api/chores', choreRoutes);

app.use('/api/admin', adminRoutes);



// Start server

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));