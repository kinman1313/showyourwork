import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    TextField,
    Alert,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Divider,
    Avatar,
} from '@mui/material';
import {
    ThumbUp as LikeIcon,
    ArrowBack as BackIcon,
    Tag as TagIcon,
    Reply as ReplyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function TopicView() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);

    useEffect(() => {
        fetchTopicData();
    }, [fetchTopicData]);

    const fetchTopicData = async () => {
        try {
            const [topicRes, commentsRes] = await Promise.all([
                api.get(`/topics/${topicId}`),
                api.get(`/topics/${topicId}/comments`)
            ]);
            setTopic(topicRes.data);
            setComments(commentsRes.data);
            setError('');
        } catch (err) {
            console.error('Fetch topic data error:', err);
            setError('Failed to fetch topic data');
        }
    };

    const handleCreateComment = async () => {
        try {
            const commentData = {
                content: newComment,
                parentCommentId: replyTo?._id
            };
            const response = await api.post(`/topics/${topicId}/comments`, commentData);
            setComments([...comments, response.data]);
            setNewComment('');
            setReplyTo(null);
            setError('');
        } catch (err) {
            console.error('Create comment error:', err);
            setError(err.response?.data?.error || 'Failed to create comment');
        }
    };

    const handleLikeTopic = async () => {
        try {
            const response = await api.post(`/topics/${topicId}/like`);
            setTopic(prev => ({
                ...prev,
                likes: response.data.hasLiked ? [...prev.likes, user] : prev.likes.filter(like => like._id !== user.id)
            }));
        } catch (err) {
            console.error('Like topic error:', err);
            setError('Failed to like topic');
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const response = await api.post(`/comments/${commentId}/like`);
            setComments(comments.map(comment =>
                comment._id === commentId
                    ? {
                        ...comment,
                        likes: response.data.hasLiked
                            ? [...comment.likes, user]
                            : comment.likes.filter(like => like._id !== user.id)
                    }
                    : comment
            ));
        } catch (err) {
            console.error('Like comment error:', err);
            setError('Failed to like comment');
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

    if (!topic) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading topic...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                background: 'rgba(0, 0, 0, 0.6)',
                p: 2,
                borderRadius: 2,
                backdropFilter: 'blur(10px)'
            }}>
                <IconButton
                    onClick={() => navigate(`/forums/${topic.forum}`)}
                    sx={{ mr: 2, color: 'primary.main' }}
                >
                    <BackIcon />
                </IconButton>
                <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
                    {topic.title}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Card sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                mb: 3
            }}>
                <CardContent>
                    <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                        {topic.content}
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
                                    onClick={handleLikeTopic}
                                    color={topic.likes?.some(like => like._id === user.id) ? 'primary' : 'default'}
                                >
                                    <LikeIcon />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {topic.likes?.length || 0}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Posted by {topic.author.name} • {formatDate(topic.createdAt)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Comments ({comments.length})
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder={replyTo ? `Reply to ${replyTo.author.name}...` : "Add a comment..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                                background: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {replyTo && (
                            <Typography variant="body2" color="text.secondary">
                                Replying to {replyTo.author.name}'s comment
                                <Button
                                    size="small"
                                    onClick={() => setReplyTo(null)}
                                    sx={{ ml: 1 }}
                                >
                                    Cancel
                                </Button>
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            disabled={!newComment.trim()}
                            onClick={handleCreateComment}
                            sx={{
                                background: 'rgba(25, 118, 210, 0.9)',
                                '&:hover': {
                                    background: 'rgba(25, 118, 210, 1)',
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            Post Comment
                        </Button>
                    </Box>
                </Box>

                <Stack spacing={2}>
                    {comments.map((comment) => (
                        <Card
                            key={comment._id}
                            sx={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                ml: comment.parentComment ? 4 : 0
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                                        {comment.author.name[0]}
                                    </Avatar>
                                    <Typography variant="subtitle2">
                                        {comment.author.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                        • {formatDate(comment.createdAt)}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                                    {comment.content}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Tooltip title="Like">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleLikeComment(comment._id)}
                                            color={comment.likes?.some(like => like._id === user.id) ? 'primary' : 'default'}
                                        >
                                            <LikeIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="body2" sx={{ mr: 2 }}>
                                        {comment.likes?.length || 0}
                                    </Typography>
                                    <Tooltip title="Reply">
                                        <IconButton
                                            size="small"
                                            onClick={() => setReplyTo(comment)}
                                        >
                                            <ReplyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
} 