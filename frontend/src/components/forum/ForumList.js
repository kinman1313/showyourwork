import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
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
    Chip,
    Alert,
    IconButton,
    Stack,
    FormGroup,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    Lock as LockIcon,
    Public as PublicIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';

export default function ForumList() {
    const [forums, setForums] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const [newForum, setNewForum] = useState({
        name: '',
        description: '',
        isPrivate: false,
        allowedRoles: []
    });

    useEffect(() => {
        fetchForums();
    }, []);

    const fetchForums = async () => {
        try {
            const response = await api.get('/forums');
            setForums(response.data);
            setError('');
        } catch (err) {
            console.error('Fetch forums error:', err);
            setError('Failed to fetch forums');
        }
    };

    const handleCreateForum = async () => {
        try {
            const response = await api.post('/forums', newForum);
            setForums([...forums, response.data]);
            setOpenDialog(false);
            setNewForum({
                name: '',
                description: '',
                isPrivate: false,
                allowedRoles: []
            });
            setError('');
        } catch (err) {
            console.error('Create forum error:', err);
            setError(err.response?.data?.error || 'Failed to create forum');
        }
    };

    const handleRoleToggle = (role) => {
        setNewForum(prev => ({
            ...prev,
            allowedRoles: prev.allowedRoles.includes(role)
                ? prev.allowedRoles.filter(r => r !== role)
                : [...prev.allowedRoles, role]
        }));
    };

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
                <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
                    Forums
                </Typography>
                {user.role === 'parent' && (
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
                        Create Forum
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {forums.map((forum) => (
                    <Grid item xs={12} md={6} key={forum._id}>
                        <Card sx={{
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`
                            }
                        }} onClick={() => navigate(`/forums/${forum._id}`)}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {forum.isPrivate ? (
                                        <Tooltip title="Private Forum">
                                            <LockIcon sx={{ mr: 1, color: 'warning.main' }} />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Public Forum">
                                            <PublicIcon sx={{ mr: 1, color: 'success.main' }} />
                                        </Tooltip>
                                    )}
                                    <Typography variant="h6" component="div">
                                        {forum.name}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {forum.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <GroupIcon sx={{ mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Created by {forum.createdBy.name}
                                    </Typography>
                                </Box>
                                {forum.allowedRoles?.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Stack direction="row" spacing={1}>
                                            {forum.allowedRoles.map((role) => (
                                                <Chip
                                                    key={role}
                                                    label={role}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

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
                <DialogTitle>Create New Forum</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Forum Name"
                        type="text"
                        fullWidth
                        value={newForum.name}
                        onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={newForum.description}
                        onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormGroup sx={{ mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newForum.isPrivate}
                                    onChange={(e) => setNewForum({ ...newForum, isPrivate: e.target.checked })}
                                />
                            }
                            label="Private Forum"
                        />
                    </FormGroup>
                    {newForum.isPrivate && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Allowed Roles
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Chip
                                    label="Parent"
                                    onClick={() => handleRoleToggle('parent')}
                                    color={newForum.allowedRoles.includes('parent') ? 'primary' : 'default'}
                                    clickable
                                />
                                <Chip
                                    label="Child"
                                    onClick={() => handleRoleToggle('child')}
                                    color={newForum.allowedRoles.includes('child') ? 'primary' : 'default'}
                                    clickable
                                />
                            </Stack>
                        </Box>
                    )}
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
                        onClick={handleCreateForum}
                        disabled={!newForum.name || (newForum.isPrivate && newForum.allowedRoles.length === 0)}
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