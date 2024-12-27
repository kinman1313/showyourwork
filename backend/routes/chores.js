const express = require('express');

const Chore = require('../models/Chore');

const router = express.Router();



// Add a chore

router.post('/', async (req, res) => {

    const { name, assignedTo } = req.body;

    try {

        const chore = new Chore({ name, assignedTo });

        await chore.save();

        res.status(201).json(chore);

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



// Fetch chores for a specific user

router.get('/user/:userId', async (req, res) => {

    const { userId } = req.params;

    try {

        const chores = await Chore.find({ assignedTo: userId });

        res.json(chores);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});



// Update a chore

router.put('/:id', async (req, res) => {

    const { id } = req.params;

    const { completed } = req.body;

    try {

        const chore = await Chore.findByIdAndUpdate(id, { completed }, { new: true });

        res.json(chore);

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



// Delete a chore

router.delete('/:id', async (req, res) => {

    const { id } = req.params;

    try {

        await Chore.findByIdAndDelete(id);

        res.json({ message: 'Chore deleted successfully' });

    } catch (err) {

        res.status(400).json({ error: err.message });

    }

});



module.exports = router;
