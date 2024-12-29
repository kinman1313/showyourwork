import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function ChildDashboard() {
    const [chores, setChores] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [choresRes, pointsRes] = await Promise.all([
                    api.get('/chores/assigned'),
                    api.get('/users/points')
                ]);
                setChores(choresRes.data);
                setTotalPoints(pointsRes.data.points);
                setError('');
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCompleteChore = async (choreId) => {
        try {
            const response = await api.patch(`/chores/${choreId}/complete`);
            setChores(
                chores.map((chore) =>
                    chore._id === choreId ? { ...chore, status: 'completed' } : chore
                )
            );
            setTotalPoints(response.data.totalPoints);
            setError('');
        } catch (err) {
            console.error('Complete chore error:', err);
            setError('Failed to complete chore');
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Chores
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Typography variant="h6" gutterBottom>
                Total Points: {totalPoints}
            </Typography>
            <Grid container spacing={3}>
                {chores.map((chore) => (
                    <Grid item xs={12} sm={6} md={4} key={chore._id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{chore.title}</Typography>
                                <Typography color="textSecondary">
                                    Points: {chore.points}
                                </Typography>
                                <Typography>{chore.description}</Typography>
                                <Typography color="textSecondary">
                                    Due: {new Date(chore.dueDate).toLocaleDateString()}
                                </Typography>
                                {chore.status === 'assigned' && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<CheckIcon />}
                                        onClick={() => handleCompleteChore(chore._id)}
                                        sx={{ mt: 1 }}
                                    >
                                        Mark Complete
                                    </Button>
                                )}
                                {chore.status === 'completed' && (
                                    <Typography color="success.main" sx={{ mt: 1 }}>
                                        Completed - Waiting for verification
                                    </Typography>
                                )}
                                {chore.status === 'verified' && (
                                    <Typography color="success.main" sx={{ mt: 1 }}>
                                        Verified
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 