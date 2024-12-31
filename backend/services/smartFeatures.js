const OpenAI = require('openai');
const schedule = require('node-schedule');
const axios = require('axios');
const Chore = require('../models/Chore');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// AI-powered chore suggestions
async function generateChoreSuggestions(userPreferences, completedChores) {
    try {
        const prompt = `Based on these completed chores: ${JSON.stringify(completedChores)} 
            and user preferences: ${JSON.stringify(userPreferences)}, 
            suggest 5 age-appropriate household chores. Consider difficulty level and time requirements.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Error generating chore suggestions:', error);
        throw error;
    }
}

// Smart scheduling based on past performance
async function generateSmartSchedule(userId, choreHistory) {
    try {
        // Analyze past performance patterns
        const performanceMetrics = await analyzePerformance(choreHistory);

        // Generate optimal schedule based on metrics
        const schedule = optimizeSchedule(performanceMetrics);

        return schedule;
    } catch (error) {
        console.error('Error generating smart schedule:', error);
        throw error;
    }
}

// Weather-aware outdoor chore scheduling
async function checkWeatherAndAdjustSchedule(location, outdoorChores) {
    try {
        const weatherApiKey = process.env.WEATHER_API_KEY;
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${weatherApiKey}`;

        const response = await axios.get(weatherUrl);
        const forecast = response.data;

        return adjustChoresBasedOnWeather(outdoorChores, forecast);
    } catch (error) {
        console.error('Error checking weather and adjusting schedule:', error);
        throw error;
    }
}

// Automatic chore rotation
async function rotateChores(familyMembers, chores) {
    try {
        const rotationSchedule = generateRotationSchedule(familyMembers, chores);
        await updateChoreAssignments(rotationSchedule);
        return rotationSchedule;
    } catch (error) {
        console.error('Error rotating chores:', error);
        throw error;
    }
}

// Helper functions
async function analyzePerformance(choreHistory) {
    // Analyze completion times, patterns, and success rates
    const metrics = {
        averageCompletionTime: calculateAverageCompletionTime(choreHistory),
        preferredTimes: findPreferredTimes(choreHistory),
        successRate: calculateSuccessRate(choreHistory)
    };
    return metrics;
}

function optimizeSchedule(metrics) {
    // Create optimized schedule based on performance metrics
    return {
        recommendedTimes: metrics.preferredTimes,
        estimatedDuration: metrics.averageCompletionTime,
        priority: calculatePriority(metrics.successRate)
    };
}

function adjustChoresBasedOnWeather(chores, forecast) {
    const adjustedSchedule = chores.map(chore => {
        if (chore.isOutdoor) {
            const weatherCondition = getWeatherForChoreTime(chore.scheduledTime, forecast);
            return adjustChoreForWeather(chore, weatherCondition);
        }
        return chore;
    });
    return adjustedSchedule;
}

function generateRotationSchedule(familyMembers, chores) {
    // Implement fair rotation algorithm
    const schedule = {};
    let choreIndex = 0;

    familyMembers.forEach(member => {
        schedule[member.id] = chores[choreIndex % chores.length];
        choreIndex++;
    });

    return schedule;
}

async function updateChoreAssignments(schedule) {
    // Update chore assignments in the database
    for (const [userId, chore] of Object.entries(schedule)) {
        await Chore.findByIdAndUpdate(chore.id, { assignedTo: userId });
    }
}

// Utility functions
function calculateAverageCompletionTime(history) {
    if (!history.length) return 0;
    const sum = history.reduce((acc, record) => acc + record.completionTime, 0);
    return sum / history.length;
}

function findPreferredTimes(history) {
    // Analyze patterns to find optimal times
    const timeSlots = history.reduce((acc, record) => {
        const hour = new Date(record.completedAt).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(timeSlots)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));
}

function calculateSuccessRate(history) {
    if (!history.length) return 0;
    const successful = history.filter(record => record.completed).length;
    return (successful / history.length) * 100;
}

function calculatePriority(successRate) {
    if (successRate >= 90) return 'low';
    if (successRate >= 70) return 'medium';
    return 'high';
}

function getWeatherForChoreTime(scheduledTime, forecast) {
    // Find the most relevant weather forecast for the scheduled time
    return forecast.list.find(f =>
        Math.abs(new Date(f.dt * 1000) - scheduledTime) < 3 * 60 * 60 * 1000
    );
}

function adjustChoreForWeather(chore, weather) {
    const updatedChore = { ...chore };

    if (!weather) return updatedChore;

    // Adjust based on weather conditions
    if (weather.rain || weather.snow) {
        updatedChore.status = 'rescheduled';
        updatedChore.note = 'Rescheduled due to precipitation';
    } else if (weather.main.temp > 30) { // Temperature in Celsius
        updatedChore.note = 'Consider doing this chore during cooler hours';
    }

    return updatedChore;
}

module.exports = {
    generateChoreSuggestions,
    generateSmartSchedule,
    checkWeatherAndAdjustSchedule,
    rotateChores
}; 