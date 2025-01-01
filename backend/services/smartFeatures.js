const OpenAI = require('openai');
const axios = require('axios');
const Chore = require('../models/Chore');
const User = require('../models/User');

// Initialize OpenAI with error handling
let openai;
try {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} catch (error) {
    console.error('Error initializing OpenAI:', error);
}

// AI-powered chore suggestions
async function generateChoreSuggestions(userPreferences, completedChores) {
    if (!openai) {
        throw new Error('OpenAI client not initialized');
    }

    try {
        const prompt = `Based on these completed chores: ${JSON.stringify(completedChores)} 
            and user preferences: ${JSON.stringify(userPreferences)}, 
            suggest 5 age-appropriate household chores. Format the response as a JSON array of strings.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: "You are a helpful assistant that suggests age-appropriate chores for children. Keep suggestions practical and safe."
            },
            {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 200
        });

        const suggestions = JSON.parse(completion.choices[0].message.content);
        return { suggestions };
    } catch (error) {
        console.error('Error generating chore suggestions:', error);
        throw new Error('Failed to generate chore suggestions');
    }
}

// Smart scheduling based on past performance
async function generateSmartSchedule(userId, choreHistory) {
    try {
        // Get user's completed chores from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentChores = await Chore.find({
            assignedTo: userId,
            completedAt: { $gte: thirtyDaysAgo }
        }).sort('-completedAt');

        // Generate schedule recommendations
        const schedule = {
            bestTimes: findPreferredTimes(recentChores),
            recommendedDays: findPreferredDays(recentChores),
            estimatedDuration: calculateAverageCompletionTime(recentChores),
            successRate: calculateSuccessRate(recentChores)
        };

        return schedule;
    } catch (error) {
        console.error('Error generating smart schedule:', error);
        throw new Error('Failed to generate smart schedule');
    }
}

// Weather-aware outdoor chore scheduling
async function checkWeatherAndAdjustSchedule(location = 'New York') {
    try {
        if (!process.env.WEATHER_API_KEY) {
            throw new Error('Weather API key not configured');
        }

        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(weatherUrl);

        if (!response.data || !response.data.list) {
            throw new Error('Invalid weather data received');
        }

        // Get next 5 days forecast
        const forecast = response.data.list.slice(0, 5);

        // Generate weather-based recommendations
        const recommendations = forecast.map(day => ({
            date: new Date(day.dt * 1000).toLocaleDateString(),
            suitable: day.weather[0].main !== 'Rain' && day.weather[0].main !== 'Snow',
            temperature: day.main.temp,
            conditions: day.weather[0].main,
            recommendation: getWeatherRecommendation(day)
        }));

        return { recommendations };
    } catch (error) {
        console.error('Error checking weather:', error);
        throw new Error('Failed to check weather conditions');
    }
}

// Automatic chore rotation
async function rotateChores(familyMembers, chores) {
    try {
        // Get all active family members
        const activeMembers = familyMembers.filter(member => member.isActive);
        if (activeMembers.length === 0) {
            throw new Error('No active family members found');
        }

        // Create a fair rotation schedule
        const rotationSchedule = {};
        chores.forEach((chore, index) => {
            const assigneeIndex = index % activeMembers.length;
            const assignee = activeMembers[assigneeIndex];

            if (!rotationSchedule[assignee._id]) {
                rotationSchedule[assignee._id] = [];
            }
            rotationSchedule[assignee._id].push(chore);
        });

        // Update chore assignments in database
        for (const [userId, assignedChores] of Object.entries(rotationSchedule)) {
            for (const chore of assignedChores) {
                await Chore.findByIdAndUpdate(chore._id, {
                    assignedTo: userId,
                    updatedAt: new Date()
                });
            }
        }

        return rotationSchedule;
    } catch (error) {
        console.error('Error rotating chores:', error);
        throw new Error('Failed to rotate chores');
    }
}

// Helper functions
function findPreferredTimes(chores) {
    if (!chores.length) return [];

    const timeSlots = chores.reduce((acc, chore) => {
        if (chore.completedAt) {
            const hour = new Date(chore.completedAt).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(timeSlots)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => ({
            hour: parseInt(hour),
            period: hour < 12 ? 'AM' : 'PM',
            displayHour: hour % 12 || 12
        }));
}

function findPreferredDays(chores) {
    if (!chores.length) return [];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayPreferences = chores.reduce((acc, chore) => {
        if (chore.completedAt) {
            const day = new Date(chore.completedAt).getDay();
            acc[day] = (acc[day] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(dayPreferences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([day]) => days[day]);
}

function calculateAverageCompletionTime(chores) {
    const completedChores = chores.filter(chore => chore.completionTime);
    if (!completedChores.length) return 0;

    const sum = completedChores.reduce((acc, chore) => acc + chore.completionTime, 0);
    return Math.round(sum / completedChores.length);
}

function calculateSuccessRate(chores) {
    if (!chores.length) return 0;
    const completed = chores.filter(chore => chore.status === 'completed').length;
    return Math.round((completed / chores.length) * 100);
}

function getWeatherRecommendation(weatherData) {
    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].main.toLowerCase();

    if (condition.includes('rain') || condition.includes('snow')) {
        return 'Reschedule outdoor chores';
    }
    if (temp > 30) {
        return 'Schedule outdoor chores for early morning or evening';
    }
    if (temp < 5) {
        return 'Consider indoor alternatives';
    }
    return 'Good conditions for outdoor chores';
}

module.exports = {
    generateChoreSuggestions,
    generateSmartSchedule,
    checkWeatherAndAdjustSchedule,
    rotateChores
}; 