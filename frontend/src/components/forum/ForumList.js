import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    Chip,
    Alert,
    LinearProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Forum as ForumIcon,
    Person as PersonIcon,
    Public as PublicIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function ForumList() {
    const [forums, setForums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newForum, setNewForum] = useState({
        name: '',
        description: '',
        isPrivate: false,
    });
    const navigate = useNavigate();
    const { loading: authLoading } = useAuth();

    useEffect(() => {
        fetchForums();
    }, []);

    const fetchForums = async () => {
        try {
            const response = await api.get('/forums');
            setForums(response.data);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to fetch forums');
            setIsLoading(false);
        }
    };

    const handleCreateForum = async () => {
        try {
            await api.post('/forums', newForum);
            setOpenDialog(false);
            setNewForum({ name: '', description: '', isPrivate: false });
            fetchForums();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create forum');
        }
    };

    if (authLoading) return <LinearProgress />;

    return (
        <div className="forum-list">
            {forums.map(forum => (
                <div key={forum.id} className="forum-card tech-border floating interactive-card">
                    <h3 className="forum-title gradient-text">{forum.title}</h3>
                    <p className="forum-description">{forum.description}</p>
                    <button className="ripple">View Forum</button>
                </div>
            ))}
        </div>
    );
} 