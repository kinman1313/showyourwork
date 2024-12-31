const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const axios = require('axios');
const auth = require('../middleware/auth');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Get AI-powered chore suggestions
router.get('/suggestions', auth, async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that suggests age-appropriate chores based on the child's age and preferences."
                },
                {
                    role: "user",
                    content: `Suggest 5 age-appropriate chores for a child who is ${req.user.age || '10'} years old.`
                }
            ]
        });

        res.json({ suggestions: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error generating suggestions:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

// Check weather and adjust outdoor chores
router.get('/weather-check', auth, async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        const weather = weatherResponse.data;
        const isGoodWeather = weather.main.temp > 10 && !weather.rain && !weather.snow;

        res.json({
            weather: {
                temperature: weather.main.temp,
                conditions: weather.weather[0].main,
                description: weather.weather[0].description
            },
            recommendOutdoor: isGoodWeather
        });
    } catch (error) {
        console.error('Error checking weather:', error);
        res.status(500).json({ error: 'Failed to check weather' });
    }
});

module.exports = router;
