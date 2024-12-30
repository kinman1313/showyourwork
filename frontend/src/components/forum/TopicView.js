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
        <div className="topic-view">
            <h2 className="gradient-text">{topic.title}</h2>
            <div className="posts-container">
                {comments.map(comment => (
                    <div key={comment._id} className="post-card tech-border interactive-card">
                        <div className="post-header shimmer">
                            <span className="author">{comment.author.name}</span>
                            <span className="date">{formatDate(comment.createdAt)}</span>
                        </div>
                        <div className="post-content">{comment.content}</div>
                    </div>
                ))}
            </div>
        </div>
    );
} 