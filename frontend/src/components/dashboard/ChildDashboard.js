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
    CardActions,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Done as DoneIcon,
    AccessTime as PendingIcon,
    CheckCircle as VerifiedIcon,
    WorkOutline as InProgressIcon,
} from '@mui/icons-material';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function ChildDashboard() {
    const [chores, setChores] = useState([]);
    const [points, setPoints] = useState(0);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchChores();
    }, []);

    const fetchChores = async () => {
        try {
            const response = await api.get('/chores/assigned');
            setChores(response.data);
            // Fetch total points
            const pointsResponse = await api.get('/users/points');
            setPoints(pointsResponse.data.points);
        } catch (err) {
            setError('Failed to fetch chores');
            console.error('Fetch error:', err);
        }
    };

    const handleStatusChange = async (choreId, newStatus) => {
        try {
            const response = await api.patch(`/chores/${choreId}/status`, { status: newStatus });
            setChores(chores.map(chore =>
                chore._id === choreId ? { ...chore, status: response.data.status } : chore
            ));
            if (newStatus === 'completed') {
                // Update points when a chore is completed
                const pointsResponse = await api.get('/users/points');
                setPoints(pointsResponse.data.points);
            }
            setError('');
        } catch (err) {
            setError('Failed to update chore status');
            console.error('Update error:', err);
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <PendingIcon />;
            case 'in_progress': return <InProgressIcon />;
            case 'completed': return <DoneIcon />;
            case 'verified': return <VerifiedIcon />;
            default: return null;
        }
    };

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
                    label={`Total Points: ${points}`}
                    color="primary"
                    sx={{
                        fontSize: '1.2rem',
                        p: 2,
                        height: 'auto',
                        '& .MuiChip-label': {
                            p: 1
                        }
                    }}
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {chores.map((chore) => (
                    <Grid item xs={12} md={6} key={chore._id}>
                        <Card sx={{
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`
                            }
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {chore.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {chore.description}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Chip
                                        icon={getStatusIcon(chore.status)}
                                        label={chore.status.replace('_', ' ').toUpperCase()}
                                        color={getStatusColor(chore.status)}
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        label={`${chore.points} points`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Due: {new Date(chore.dueDate).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                {chore.status === 'pending' && (
                                    <Tooltip title="Start Chore">
                                        <IconButton
                                            onClick={() => handleStatusChange(chore._id, 'in_progress')}
                                            color="primary"
                                            sx={{
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    background: 'rgba(25, 118, 210, 0.1)'
                                                }
                                            }}
                                        >
                                            <StartIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {chore.status === 'in_progress' && (
                                    <Tooltip title="Mark as Completed">
                                        <IconButton
                                            onClick={() => handleStatusChange(chore._id, 'completed')}
                                            color="success"
                                            sx={{
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    background: 'rgba(46, 125, 50, 0.1)'
                                                }
                                            }}
                                        >
                                            <DoneIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 