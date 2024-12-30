import React, { useState, useEffect } from 'react';
import {
    Box,
    Avatar,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    Paper,
    Grid,
    Chip,
} from '@mui/material';
import {
    Edit as EditIcon,
    PhotoCamera as PhotoCameraIcon,
    Star as StarIcon,
    EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function Profile({ onClose }) {
    const { user, setUser } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        bio: '',
        interests: '',
        favoriteChores: '',
        profilePicture: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [stats, setStats] = useState({
        totalPoints: 0,
        completedChores: 0,
        level: 1,
    });

    useEffect(() => {
        if (user) {
            setEditData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                interests: user.interests || '',
                favoriteChores: user.favoriteChores || '',
                profilePicture: user.profilePicture || '',
            });
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const response = await api.get('/users/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch user stats:', err);
        }
    };

    const handleEditClick = () => {
        setOpenDialog(true);
    };

    const handleClose = () => {
        setOpenDialog(false);
        setError('');
        setSuccess('');
        setSelectedFile(null);
    };

    const handleFileSelect = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSave = async () => {
        try {
            let profilePictureUrl = editData.profilePicture;

            if (selectedFile) {
                const formData = new FormData();
                formData.append('profilePicture', selectedFile);
                const uploadResponse = await api.post('/users/upload-profile-picture', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                profilePictureUrl = uploadResponse.data.url;
            }

            const response = await api.put('/users/profile', {
                ...editData,
                profilePicture: profilePictureUrl,
            });

            setUser(response.data);
            setSuccess('Profile updated successfully');
            setTimeout(handleClose, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    if (!user) {
        return null;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: 800,
                    margin: '0 auto',
                }}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar
                                src={user.profilePicture || `https://www.gravatar.com/avatar/${user.email}?s=200&d=mp`}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    mb: 2,
                                    border: '3px solid',
                                    borderColor: 'primary.main',
                                }}
                                onError={(e) => {
                                    e.target.src = `data:image/svg+xml,${encodeURIComponent(
                                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encodeURIComponent('#1976d2')}"><text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy=".3em">${user.name?.[0]?.toUpperCase() || '?'}</text></svg>`
                                    )}`;
                                }}
                            >
                                {user.name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                                {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {user.email}
                            </Typography>
                            <Chip
                                icon={<StarIcon />}
                                label={`Level ${stats.level}`}
                                color="primary"
                                sx={{ mb: 1 }}
                            />
                            <Chip
                                icon={<TrophyIcon />}
                                label={`${stats.totalPoints} Points`}
                                color="secondary"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                About Me
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {user.bio || 'No bio added yet'}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Interests
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {user.interests || 'No interests added yet'}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Favorite Chores
                            </Typography>
                            <Typography variant="body1">
                                {user.favoriteChores || 'No favorite chores added yet'}
                            </Typography>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Stats
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Points
                                    </Typography>
                                    <Typography variant="h6">
                                        {stats.totalPoints}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Completed Chores
                                    </Typography>
                                    <Typography variant="h6">
                                        {stats.completedChores}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>

                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                    sx={{
                        mt: 2,
                        background: 'rgba(25, 118, 210, 0.9)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            background: 'rgba(25, 118, 210, 1)',
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    Edit Profile
                </Button>
            </Paper>

            <Dialog
                open={openDialog}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'rgba(18, 18, 18, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                }}
            >
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                            src={selectedFile ? URL.createObjectURL(selectedFile) : (user.profilePicture || `https://www.gravatar.com/avatar/${user.email}?s=80&d=mp`)}
                            sx={{ width: 80, height: 80, mr: 2 }}
                            onError={(e) => {
                                e.target.src = `data:image/svg+xml,${encodeURIComponent(
                                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encodeURIComponent('#1976d2')}"><text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy=".3em">${user.name?.[0]?.toUpperCase() || '?'}</text></svg>`
                                )}`;
                            }}
                        >
                            {user.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <label htmlFor="profile-picture">
                            <input
                                accept="image/*"
                                id="profile-picture"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <IconButton
                                color="primary"
                                aria-label="upload picture"
                                component="span"
                            >
                                <PhotoCameraIcon />
                            </IconButton>
                        </label>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoFocus
                                margin="dense"
                                name="name"
                                label="Name"
                                type="text"
                                fullWidth
                                value={editData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                margin="dense"
                                name="email"
                                label="Email"
                                type="email"
                                fullWidth
                                value={editData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                name="bio"
                                label="Bio"
                                multiline
                                rows={3}
                                fullWidth
                                value={editData.bio}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                name="interests"
                                label="Interests"
                                multiline
                                rows={2}
                                fullWidth
                                value={editData.interests}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="dense"
                                name="favoriteChores"
                                label="Favorite Chores"
                                multiline
                                rows={2}
                                fullWidth
                                value={editData.favoriteChores}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 