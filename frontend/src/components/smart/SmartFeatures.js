import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert
} from '@mui/material';
import axios from 'axios';

const SmartFeatures = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getSuggestions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/smart/suggestions`);
            setSuggestions(response.data.suggestions.split('\n').filter(s => s.trim()));
            setError('');
        } catch (err) {
            setError('Failed to get chore suggestions');
            console.error('Error getting suggestions:', err);
        }
        setLoading(false);
    };

    const checkWeather = async () => {
        setLoading(true);
        try {
            // Get user's location
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/smart/weather-check?lat=${latitude}&lon=${longitude}`
            );
            setWeather(response.data);
            setError('');
        } catch (err) {
            setError('Failed to check weather');
            console.error('Error checking weather:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        getSuggestions();
        checkWeather();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Smart Features
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        AI-Powered Chore Suggestions
                    </Typography>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <List>
                                {suggestions.map((suggestion, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={suggestion} />
                                    </ListItem>
                                ))}
                            </List>
                            <Button
                                variant="contained"
                                onClick={getSuggestions}
                                sx={{ mt: 2 }}
                            >
                                Get New Suggestions
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Weather-Aware Scheduling
                    </Typography>
                    {loading ? (
                        <CircularProgress />
                    ) : weather ? (
                        <>
                            <Typography variant="body1" paragraph>
                                Current Temperature: {weather.weather.temperature}°C
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Conditions: {weather.weather.description}
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Outdoor Activities: {weather.recommendOutdoor ? 'Recommended' : 'Not Recommended'}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={checkWeather}
                                sx={{ mt: 2 }}
                            >
                                Refresh Weather
                            </Button>
                        </>
                    ) : (
                        <Typography>Loading weather information...</Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default SmartFeatures; 