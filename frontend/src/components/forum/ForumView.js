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
    }, [fetchForumData]);

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
        <div className="forum-view">
            <h2 className="gradient-text">{forum.title}</h2>
            <div className="topics-list">
                {topics.map(topic => (
                    <div key={topic.id} className="topic-card tech-border interactive-card">
                        <h3 className="neon-text">{topic.title}</h3>
                        <p>{topic.description}</p>
                        <button className="ripple floating">View Topic</button>
                    </div>
                ))}
            </div>
        </div>
    );
} 