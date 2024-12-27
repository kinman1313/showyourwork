const mongoose = require('mongoose');



const ChoreSchema = new mongoose.Schema({

    name: { type: String, required: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    completed: { type: Boolean, default: false },

});



module.exports = mongoose.model('Chore', ChoreSchema);