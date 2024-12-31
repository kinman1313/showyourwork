import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Alert,
    Box
} from '@mui/material';
import {
    AutoAwesome as SuggestIcon,
    Schedule as ScheduleIcon,
    WbSunny as WeatherIcon,
    Loop as RotateIcon
} from '@mui/icons-material';
import axios from 'axios';

const SmartFeatures = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [schedule, setSchedule] = useState(null);
    const [weatherAdjustments, setWeatherAdjustments] = useState([]);
    const [rotation, setRotation] = useState(null);
    const [loading, setLoading] = useState({
        suggestions: false,
        schedule: false,
        weather: false,
        rotation: false
    });
    const [error, setError] = useState(null);

    const fetchSuggestions = async () => {
        try {
            setLoading(prev => ({ ...prev, suggestions: true }));
            const response = await axios.get('/api/smart/suggestions');
            setSuggestions(response.data);
        } catch (err) {
            setError('Failed to fetch suggestions');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, suggestions: false }));
        }
    };

    const fetchSmartSchedule = async () => {
        try {
            setLoading(prev => ({ ...prev, schedule: true }));
            const response = await axios.get('/api/smart/smart-schedule');
            setSchedule(response.data);
        } catch (err) {
            setError('Failed to fetch smart schedule');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, schedule: false }));
        }
    };

    const checkWeather = async () => {
        try {
            setLoading(prev => ({ ...prev, weather: true }));
            // Get user's location (you might want to store this in user preferences)
            const location = 'New York'; // Replace with actual user location
            const response = await axios.post('/api/smart/weather-adjust', { location });
            setWeatherAdjustments(response.data);
        } catch (err) {
            setError('Failed to check weather adjustments');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, weather: false }));
        }
    };

    const rotateChores = async () => {
        try {
            setLoading(prev => ({ ...prev, rotation: true }));
            const response = await axios.post('/api/smart/rotate');
            setRotation(response.data);
        } catch (err) {
            setError('Failed to rotate chores');
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, rotation: false }));
        }
    };

    useEffect(() => {
        fetchSuggestions();
        fetchSmartSchedule();
        checkWeather();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* AI Suggestions */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SuggestIcon sx={{ mr: 1 }} />
                            <Typography component="h2" variant="h6" color="primary">
                                AI Suggestions
                            </Typography>
                        </Box>
                        {loading.suggestions ? (
                            <CircularProgress />
                        ) : (
                            <List>
                                {suggestions.map((suggestion, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <AutoAwesome />
                                        </ListItemIcon>
                                        <ListItemText primary={suggestion} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        <Button
                            variant="contained"
                            onClick={fetchSuggestions}
                            disabled={loading.suggestions}
                        >
                            Refresh Suggestions
                        </Button>
                    </Paper>
                </Grid>

                {/* Smart Schedule */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ScheduleIcon sx={{ mr: 1 }} />
                            <Typography component="h2" variant="h6" color="primary">
                                Smart Schedule
                            </Typography>
                        </Box>
                        {loading.schedule ? (
                            <CircularProgress />
                        ) : schedule ? (
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary="Recommended Times"
                                        secondary={schedule.recommendedTimes.join(', ')}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Estimated Duration"
                                        secondary={`${schedule.estimatedDuration} minutes`}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Priority"
                                        secondary={schedule.priority}
                                    />
                                </ListItem>
                            </List>
                        ) : null}
                        <Button
                            variant="contained"
                            onClick={fetchSmartSchedule}
                            disabled={loading.schedule}
                        >
                            Update Schedule
                        </Button>
                    </Paper>
                </Grid>

                {/* Weather Adjustments */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <WeatherIcon sx={{ mr: 1 }} />
                            <Typography component="h2" variant="h6" color="primary">
                                Weather-Based Adjustments
                            </Typography>
                        </Box>
                        {loading.weather ? (
                            <CircularProgress />
                        ) : (
                            <List>
                                {weatherAdjustments.map((adjustment, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={adjustment.name}
                                            secondary={adjustment.note}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        <Button
                            variant="contained"
                            onClick={checkWeather}
                            disabled={loading.weather}
                        >
                            Check Weather
                        </Button>
                    </Paper>
                </Grid>

                {/* Chore Rotation */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <RotateIcon sx={{ mr: 1 }} />
                            <Typography component="h2" variant="h6" color="primary">
                                Chore Rotation
                            </Typography>
                        </Box>
                        {loading.rotation ? (
                            <CircularProgress />
                        ) : rotation ? (
                            <List>
                                {Object.entries(rotation).map(([userId, chore]) => (
                                    <ListItem key={userId}>
                                        <ListItemText
                                            primary={chore.name}
                                            secondary={`Assigned to: ${userId}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : null}
                        <Button
                            variant="contained"
                            onClick={rotateChores}
                            disabled={loading.rotation}
                        >
                            Rotate Chores
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default SmartFeatures; 