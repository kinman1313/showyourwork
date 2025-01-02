const OpenAI = require('openai');
const axios = require('axios');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Generate chore suggestions based on user history and preferences
async function generateChoreSuggestions(user, completedChores) {
    try {
        const choreHistory = completedChores.map(chore => ({
            title: chore.title,
            completedDate: chore.completedDate,
            points: chore.points
        }));

        const prompt = `Based on this user's chore history: ${JSON.stringify(choreHistory)}, 
            suggest 5 age-appropriate household chores that would be suitable for their next tasks. 
            Consider the complexity and points of previously completed chores.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that suggests age-appropriate chores for children. Keep suggestions practical and safe."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        return completion.choices[0].message.content.split('\n');
    } catch (error) {
        console.error('Error generating suggestions:', error);
        throw new Error('Failed to generate chore suggestions');
    }
}

// Generate smart schedule based on user's history
async function generateSmartSchedule(user, choreHistory) {
    try {
        const schedule = [];
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Analyze patterns in chore history
        const patterns = analyzeChorePatterns(choreHistory);

        // Generate schedule for each day
        daysOfWeek.forEach(day => {
            const dayChores = patterns.filter(pattern => pattern.preferredDay === day);
            schedule.push({
                day,
                suggestedChores: dayChores.map(chore => ({
                    title: chore.title,
                    estimatedTime: chore.averageTime,
                    points: chore.averagePoints
                }))
            });
        });

        return schedule;
    } catch (error) {
        console.error('Error generating schedule:', error);
        throw new Error('Failed to generate smart schedule');
    }
}

// Adjust schedule based on weather conditions
async function adjustScheduleForWeather(user, currentChores) {
    try {
        // Get weather data for user's location
        const weatherData = await getWeatherData(user.location);

        // Adjust schedule based on weather conditions
        const adjustedChores = currentChores.map(chore => {
            const adjustment = getWeatherAdjustment(chore, weatherData);
            return {
                ...chore.toObject(),
                adjustment
            };
        });

        return adjustedChores;
    } catch (error) {
        console.error('Error adjusting for weather:', error);
        throw new Error('Failed to adjust schedule for weather');
    }
}

// Generate chore rotation suggestions
async function generateChoreRotation(familyMembers, currentChores) {
    try {
        const rotation = [];
        let choreIndex = 0;

        // Create fair rotation of chores among family members
        while (choreIndex < currentChores.length) {
            familyMembers.forEach(member => {
                if (choreIndex < currentChores.length) {
                    rotation.push({
                        chore: currentChores[choreIndex],
                        assignedTo: member
                    });
                    choreIndex++;
                }
            });
        }

        return rotation;
    } catch (error) {
        console.error('Error generating rotation:', error);
        throw new Error('Failed to generate chore rotation');
    }
}

// Helper function to analyze chore patterns
function analyzeChorePatterns(choreHistory) {
    const patterns = [];
    const choreMap = new Map();

    // Group chores by title and analyze patterns
    choreHistory.forEach(chore => {
        if (!choreMap.has(chore.title)) {
            choreMap.set(chore.title, []);
        }
        choreMap.get(chore.title).push(chore);
    });

    // Calculate averages and identify patterns
    choreMap.forEach((chores, title) => {
        const totalPoints = chores.reduce((sum, chore) => sum + chore.points, 0);
        const averagePoints = totalPoints / chores.length;
        const preferredDay = identifyPreferredDay(chores);

        patterns.push({
            title,
            averagePoints,
            preferredDay,
            averageTime: calculateAverageTime(chores)
        });
    });

    return patterns;
}

// Helper function to identify preferred day for chores
function identifyPreferredDay(chores) {
    const dayCount = new Map();
    chores.forEach(chore => {
        const day = new Date(chore.completedDate).toLocaleDateString('en-US', { weekday: 'long' });
        dayCount.set(day, (dayCount.get(day) || 0) + 1);
    });

    let preferredDay = 'Monday';
    let maxCount = 0;
    dayCount.forEach((count, day) => {
        if (count > maxCount) {
            maxCount = count;
            preferredDay = day;
        }
    });

    return preferredDay;
}

// Helper function to calculate average time between chore completion
function calculateAverageTime(chores) {
    if (chores.length < 2) return 60; // Default 60 minutes if not enough data

    const timeDiffs = [];
    for (let i = 1; i < chores.length; i++) {
        const diff = new Date(chores[i].completedDate) - new Date(chores[i - 1].completedDate);
        timeDiffs.push(diff / (1000 * 60)); // Convert to minutes
    }

    return Math.round(timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length);
}

// Helper function to get weather data
async function getWeatherData(location) {
    try {
        // Replace with actual weather API call
        const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${location}&days=7`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Helper function to determine weather-based adjustments
function getWeatherAdjustment(chore, weatherData) {
    if (!weatherData) return null;

    const adjustment = {
        shouldPostpone: false,
        reason: null,
        suggestedDate: null
    };

    // Add weather-based adjustment logic here
    // Example: Postpone outdoor chores if rain is forecasted
    if (isOutdoorChore(chore) && weatherData.forecast.includes('rain')) {
        adjustment.shouldPostpone = true;
        adjustment.reason = 'Rain forecasted';
        adjustment.suggestedDate = findNextClearDay(weatherData.forecast);
    }

    return adjustment;
}

// Helper function to check if a chore is typically done outdoors
function isOutdoorChore(chore) {
    const outdoorKeywords = ['lawn', 'garden', 'yard', 'outdoor', 'outside'];
    return outdoorKeywords.some(keyword =>
        chore.title.toLowerCase().includes(keyword) ||
        (chore.description && chore.description.toLowerCase().includes(keyword))
    );
}

// Helper function to find the next clear day in the forecast
function findNextClearDay(forecast) {
    const clearDay = forecast.find(day => !day.includes('rain'));
    return clearDay ? new Date(clearDay.date) : null;
}

module.exports = {
    generateChoreSuggestions,
    generateSmartSchedule,
    adjustScheduleForWeather,
    generateChoreRotation
}; 