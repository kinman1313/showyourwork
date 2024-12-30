import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Avatar,
    IconButton,
    Divider,
    Alert,
    Chip,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function TopicView() {
    const { forumId, topicId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopicData = async () => {
            try {
                const [topicResponse, commentsResponse] = await Promise.all([
                    api.get(`/topics/${topicId}`),
                    api.get(`/topics/${topicId}/comments`)
                ]);
                setTopic(topicResponse.data);
                setComments(commentsResponse.data);
                setError('');
            } catch (err) {
                setError('Failed to fetch topic data');
                console.error('Topic fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopicData();
    }, [topicId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await api.post(`/topics/${topicId}/comments`, {
                content: newComment
            });
            setComments([...comments, response.data]);
            setNewComment('');
            setError('');
        } catch (err) {
            setError('Failed to post comment');
            console.error('Comment post error:', err);
        }
    };

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
                <IconButton onClick={() => navigate(`/forums/${forumId}`)} color="primary">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" component="h1">
                    {topic?.title}
                </Typography>
            </Box>

            <Paper sx={{
                p: 3,
                mb: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Avatar src={topic?.author?.profilePicture}>
                        {topic?.author?.name?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1">
                            {topic?.author?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                                icon={<PersonIcon />}
                                label={topic?.author?.name}
                                size="small"
                                variant="outlined"
                            />
                            <Chip
                                icon={<ScheduleIcon />}
                                label={new Date(topic?.createdAt).toLocaleDateString()}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                </Box>
                <Typography variant="body1" paragraph>
                    {topic?.content}
                </Typography>
            </Paper>

            <Typography variant="h5" sx={{ mb: 2 }}>
                Comments
            </Typography>

            <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    variant="outlined"
                    sx={{ mb: 1 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    disabled={!newComment.trim()}
                >
                    Post Comment
                </Button>
            </Box>

            {comments.map((comment) => (
                <Paper
                    key={comment._id}
                    sx={{
                        p: 2,
                        mb: 2,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <Avatar src={comment.author?.profilePicture}>
                            {comment.author?.name?.[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2">
                                {comment.author?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2">
                        {comment.content}
                    </Typography>
                </Paper>
            ))}

            {comments.length === 0 && (
                <Alert severity="info">
                    No comments yet. Be the first to comment!
                </Alert>
            )}
        </Box>
    );
} 