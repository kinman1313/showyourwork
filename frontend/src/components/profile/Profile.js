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
} from '@mui/material';
import {
    Edit as EditIcon,
    PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        profilePicture: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (user) {
            setEditData({
                name: user.name || '',
                email: user.email || '',
                profilePicture: user.profilePicture || '',
            });
        }
    }, [user]);

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

            // If a new file was selected, upload it first
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

            // Update user profile
            const response = await api.put('/users/profile', {
                name: editData.name,
                email: editData.email,
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
                    maxWidth: 600,
                    margin: '0 auto',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        src={user.profilePicture}
                        sx={{
                            width: 100,
                            height: 100,
                            mr: 3,
                            border: '3px solid',
                            borderColor: 'primary.main',
                        }}
                    >
                        {user.name?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {user.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            {user.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Typography>
                    </Box>
                </Box>

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
                            src={selectedFile ? URL.createObjectURL(selectedFile) : user.profilePicture}
                            sx={{ width: 80, height: 80, mr: 2 }}
                        >
                            {user.name?.[0]}
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

                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={editData.name}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={editData.email}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
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