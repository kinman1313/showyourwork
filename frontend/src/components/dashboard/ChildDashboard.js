import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    PendingActions as PendingIcon,
    EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import axios from 'axios';
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
                    axios.get(`${process.env.REACT_APP_API_URL}/chores`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }),
                    axios.get(`${process.env.REACT_APP_API_URL}/users/points`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }),
                ]);
                setChores(choresRes.data);
                setTotalPoints(pointsRes.data.points);
            } catch (err) {
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCompleteChore = async (choreId) => {
        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}/chores/${choreId}/status`,
                { status: 'completed' },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setChores(
                chores.map((chore) =>
                    chore._id === choreId ? { ...chore, status: 'completed' } : chore
                )
            );
        } catch (err) {
            setError('Failed to complete chore');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    My Dashboard
                </Typography>
                <Card sx={{ minWidth: 200, bgcolor: 'primary.dark' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrophyIcon sx={{ mr: 1, color: 'gold' }} />
                            <Typography variant="h6" component="div" color="white">
                                Total Points: {totalPoints}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Active Chores */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                My Active Chores
                            </Typography>
                            {chores
                                .filter((chore) => chore.status === 'pending')
                                .map((chore) => (
                                    <Card key={chore._id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle1">{chore.title}</Typography>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleCompleteChore(chore._id)}
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {chore.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <TrophyIcon sx={{ mr: 1, color: 'gold', fontSize: '1rem' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Points: {chore.points}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Due: {new Date(chore.dueDate).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Completed Chores */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Completed Chores
                            </Typography>
                            {chores
                                .filter((chore) => chore.status === 'completed' || chore.status === 'verified')
                                .map((chore) => (
                                    <Card key={chore._id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle1">{chore.title}</Typography>
                                                {chore.status === 'verified' ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <PendingIcon color="warning" />
                                                )}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {chore.description}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <TrophyIcon sx={{ mr: 1, color: 'gold', fontSize: '1rem' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Points: {chore.points}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Completed: {new Date(chore.completedDate).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
} 