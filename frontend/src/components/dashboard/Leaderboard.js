import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    Tooltip,
    LinearProgress,
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Star as StarIcon,
    Whatshot as FireIcon,
} from '@mui/icons-material';
import api from '../../api';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get('/users/leaderboard');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch leaderboard');
            setLoading(false);
        }
    };

    const getAchievementIcon = (points) => {
        if (points >= 1000) return <TrophyIcon sx={{ color: '#FFD700' }} />;
        if (points >= 500) return <StarIcon sx={{ color: '#C0C0C0' }} />;
        if (points >= 100) return <FireIcon sx={{ color: '#CD7F32' }} />;
        return null;
    };

    const getLevel = (points) => {
        return Math.floor(points / 100) + 1;
    };

    const getProgressToNextLevel = (points) => {
        return (points % 100);
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
                    Leaderboard
                </Typography>
                <TrophyIcon sx={{ color: '#FFD700', fontSize: 40 }} />
            </Box>

            <Card sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
            }}>
                <CardContent>
                    <List>
                        {users.map((user, index) => (
                            <ListItem
                                key={user._id}
                                sx={{
                                    mb: 2,
                                    background: index < 3 ? `rgba(255, 215, 0, ${0.1 - index * 0.02})` : 'transparent',
                                    borderRadius: 1,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: index < 3 ? 'primary.main' : 'grey.500',
                                            border: index === 0 ? '2px solid #FFD700' : 'none'
                                        }}
                                    >
                                        {user.name[0]}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="h6">
                                                {index + 1}. {user.name}
                                            </Typography>
                                            {getAchievementIcon(user.points)}
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Tooltip title="Total Points">
                                                    <Chip
                                                        label={`${user.points} points`}
                                                        color="primary"
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Level">
                                                    <Chip
                                                        label={`Level ${getLevel(user.points)}`}
                                                        color="secondary"
                                                        size="small"
                                                    />
                                                </Tooltip>
                                            </Box>
                                            <Tooltip title="Progress to Next Level">
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={getProgressToNextLevel(user.points)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: index < 3 ? 'primary.main' : 'secondary.main'
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </Box>
    );
} 