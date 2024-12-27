const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');



const UserSchema = new mongoose.Schema({

    username: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: { type: String, enum: ['parent', 'kid'], default: 'kid' },

    resetToken: { type: String },

    resetTokenExpiration: { type: Date },

});



UserSchema.pre('save', async function (next) {

    if (this.isModified('password')) {

        this.password = await bcrypt.hash(this.password, 10);

    }

    next();

});



module.exports = mongoose.model('User', UserSchema);