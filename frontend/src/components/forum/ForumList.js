import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Skeleton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function ForumList() {
    const [forums, setForums] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchForums = async () => {
            try {
                const response = await api.get('/forums');
                setForums(response.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch forums');
                console.error('Forum fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchForums();
    }, []);

    if (loading) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3].map((n) => (
                    <Grid item xs={12} md={4} key={n}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" height={40} />
                                <Skeleton variant="text" />
                                <Skeleton variant="text" width="60%" />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Box>
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
                    Forums
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/forums/new')}
                    sx={{
                        background: 'rgba(25, 118, 210, 0.9)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            background: 'rgba(25, 118, 210, 1)',
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    New Forum
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {forums.map((forum) => (
                    <Grid item xs={12} md={4} key={forum._id}>
                        <Card
                            sx={{
                                height: '100%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-5px)'
                                }
                            }}
                            onClick={() => navigate(`/forums/${forum._id}`)}
                        >
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {forum.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {forum.description || 'No description available'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Created by: {forum.createdBy?.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 