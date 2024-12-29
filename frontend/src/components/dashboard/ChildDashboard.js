import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Chip,
    LinearProgress,
    Alert,
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Check as CompleteIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import api from '../../api';

export default function ChildDashboard() {
    const [chores, setChores] = useState([]);
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchChores();
        fetchPoints();
    }, []);

    const fetchChores = async () => {
        try {
            const response = await api.get('/chores/assigned');
            setChores(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch chores');
            setLoading(false);
        }
    };

    const fetchPoints = async () => {
        try {
            const response = await api.get('/users/points');
            setPoints(response.data.points);
        } catch (err) {
            console.error('Failed to fetch points:', err);
        }
    };

    const handleStatusChange = async (choreId, newStatus) => {
        try {
            await api.patch(`/chores/${choreId}/status`, { status: newStatus });
            fetchChores(); // Refresh chores after status update
            fetchPoints(); // Refresh points in case the chore was completed
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update chore status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'in_progress': return 'info';
            case 'completed': return 'success';
            case 'verified': return 'secondary';
            default: return 'default';
        }
    };

    const getStatusActions = (chore) => {
        switch (chore.status) {
            case 'pending':
                return (
                    <Button
                        startIcon={<StartIcon />}
                        variant="contained"
                        color="primary"
                        onClick={() => handleStatusChange(chore._id, 'in_progress')}
                        sx={{ mt: 2 }}
                    >
                        Start Chore
                    </Button>
                );
            case 'in_progress':
                return (
                    <Button
                        startIcon={<CompleteIcon />}
                        variant="contained"
                        color="success"
                        onClick={() => handleStatusChange(chore._id, 'completed')}
                        sx={{ mt: 2 }}
                    >
                        Mark Complete
                    </Button>
                );
            case 'completed':
                return (
                    <Chip
                        label="Waiting for verification"
                        color="secondary"
                        sx={{ mt: 2 }}
                    />
                );
            case 'verified':
                return (
                    <Chip
                        icon={<StarIcon />}
                        label="Verified"
                        color="secondary"
                        sx={{ mt: 2 }}
                    />
                );
            default:
                return null;
        }
    };

    if (loading) return <LinearProgress />;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                background: 'rgba(0, 0, 0, 0.6)',
                p: 2,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }}>
                <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
                    My Chores
                </Typography>
                <Chip
                    icon={<StarIcon />}
                    label={`${points} Points`}
                    color="primary"
                    sx={{ fontSize: '1.2rem', py: 2.5 }}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {chores.map((chore) => (
                    <Grid item xs={12} sm={6} md={4} key={chore._id}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            }
                        }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {chore.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {chore.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Chip
                                        label={`${chore.points} points`}
                                        color="primary"
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        label={chore.status.replace('_', ' ').toUpperCase()}
                                        color={getStatusColor(chore.status)}
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Due: {new Date(chore.dueDate).toLocaleDateString()}
                                </Typography>
                                {getStatusActions(chore)}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {chores.length === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            No chores assigned yet!
                        </Alert>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
} 