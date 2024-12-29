import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    ThumbUp as LikeIcon,
    Comment as CommentIcon,
    ArrowBack as BackIcon,
    Tag as TagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function ForumView() {
    const { forumId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [forum, setForum] = useState(null);
    const [topics, setTopics] = useState([]);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newTopic, setNewTopic] = useState({
        title: '',
        content: '',
        tags: ''
    });

    useEffect(() => {
        fetchForumData();
    }, [forumId]);

    const fetchForumData = async () => {
        try {
            const [forumRes, topicsRes] = await Promise.all([
                api.get(`/forums/${forumId}`),
                api.get(`/forums/${forumId}/topics`)
            ]);
            setForum(forumRes.data);
            setTopics(topicsRes.data);
            setError('');
        } catch (err) {
            console.error('Fetch forum data error:', err);
            setError('Failed to fetch forum data');
        }
    };

    const handleCreateTopic = async () => {
        try {
            const topicData = {
                ...newTopic,
                tags: newTopic.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            };
            const response = await api.post(`/forums/${forumId}/topics`, topicData);
            setTopics([response.data, ...topics]);
            setOpenDialog(false);
            setNewTopic({
                title: '',
                content: '',
                tags: ''
            });
            setError('');
        } catch (err) {
            console.error('Create topic error:', err);
            setError(err.response?.data?.error || 'Failed to create topic');
        }
    };

    const handleLikeTopic = async (topicId) => {
        try {
            const response = await api.post(`/topics/${topicId}/like`);
            setTopics(topics.map(topic =>
                topic._id === topicId
                    ? { ...topic, likes: response.data.hasLiked ? [...topic.likes, user] : topic.likes.filter(like => like._id !== user.id) }
                    : topic
            ));
        } catch (err) {
            console.error('Like topic error:', err);
            setError('Failed to like topic');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!forum) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading forum...</Typography>
            </Box>
        );
    }

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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        onClick={() => navigate('/forums')}
                        sx={{ mr: 2, color: 'primary.main' }}
                    >
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
                        {forum.name}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        background: 'rgba(25, 118, 210, 0.9)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            background: 'rgba(25, 118, 210, 1)',
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    New Topic
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Stack spacing={2}>
                {topics.map((topic) => (
                    <Card
                        key={topic._id}
                        sx={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`
                            }
                        }}
                        onClick={() => navigate(`/topics/${topic._id}`)}
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {topic.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {topic.content.length > 200
                                    ? `${topic.content.substring(0, 200)}...`
                                    : topic.content}
                            </Typography>
                            {topic.tags?.length > 0 && (
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    {topic.tags.map((tag) => (
                                        <Chip
                                            key={tag}
                                            icon={<TagIcon />}
                                            label={tag}
                                            size="small"
                                            variant="outlined"
                                            sx={{ background: 'rgba(255, 255, 255, 0.05)' }}
                                        />
                                    ))}
                                </Stack>
                            )}
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Like">
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLikeTopic(topic._id);
                                            }}
                                            color={topic.likes?.some(like => like._id === user.id) ? 'primary' : 'default'}
                                        >
                                            <LikeIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="body2" sx={{ mr: 2 }}>
                                        {topic.likes?.length || 0}
                                    </Typography>
                                    <Tooltip title="Comments">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CommentIcon sx={{ mr: 1 }} />
                                            <Typography variant="body2">
                                                {topic.commentCount || 0}
                                            </Typography>
                                        </Box>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Posted by {topic.author.name} • {formatDate(topic.createdAt)}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    sx: {
                        background: 'rgba(18, 18, 18, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="title"
                        label="Title"
                        type="text"
                        fullWidth
                        value={newTopic.title}
                        onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="content"
                        label="Content"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={newTopic.content}
                        onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="tags"
                        label="Tags (comma-separated)"
                        type="text"
                        fullWidth
                        value={newTopic.tags}
                        onChange={(e) => setNewTopic({ ...newTopic, tags: e.target.value })}
                        helperText="Enter tags separated by commas (e.g., question, help, discussion)"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateTopic}
                        disabled={!newTopic.title || !newTopic.content}
                        variant="contained"
                        sx={{
                            background: 'rgba(25, 118, 210, 0.9)',
                            '&:hover': {
                                background: 'rgba(25, 118, 210, 1)',
                                transform: 'scale(1.05)'
                            }
                        }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 