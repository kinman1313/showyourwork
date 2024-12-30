import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    Alert,
    Paper,
    Divider,
    Chip,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import api from '../../api';

export default function ForumView() {
    const { forumId } = useParams();
    const navigate = useNavigate();
    const [forum, setForum] = useState(null);
    const [topics, setTopics] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchForumData = async () => {
            try {
                const [forumResponse, topicsResponse] = await Promise.all([
                    api.get(`/forums/${forumId}`),
                    api.get(`/forums/${forumId}/topics`)
                ]);
                setForum(forumResponse.data);
                setTopics(topicsResponse.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch forum data');
                console.error('Forum fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchForumData();
    }, [forumId]);

    if (loading) {
        return <Box>Loading...</Box>;
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/forums')} color="primary">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1">
                    {forum?.name}
                </Typography>
            </Box>

            <Paper sx={{
                p: 3,
                mb: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <Typography variant="body1" paragraph>
                    {forum?.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        icon={<PersonIcon />}
                        label={`Created by ${forum?.createdBy?.name}`}
                        variant="outlined"
                        size="small"
                    />
                </Box>
            </Paper>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="h5">Topics</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/forums/${forumId}/topics/new`)}
                >
                    New Topic
                </Button>
            </Box>

            <List>
                {topics.map((topic) => (
                    <React.Fragment key={topic._id}>
                        <ListItem
                            button
                            onClick={() => navigate(`/forums/${forumId}/topics/${topic._id}`)}
                            sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                mb: 1,
                                borderRadius: 1,
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            <ListItemText
                                primary={topic.title}
                                secondary={
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                        <Chip
                                            icon={<PersonIcon />}
                                            label={topic.author?.name}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={<ScheduleIcon />}
                                            label={new Date(topic.createdAt).toLocaleDateString()}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                }
                            />
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
                {topics.length === 0 && (
                    <Alert severity="info">
                        No topics yet. Be the first to create one!
                    </Alert>
                )}
            </List>
        </Box>
    );
} 