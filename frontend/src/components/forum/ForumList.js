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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newForum, setNewForum] = useState({
        name: '',
        description: '',
        isPrivate: false,
    });
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchForums();
    }, []);

    const fetchForums = async () => {
        try {
            const response = await api.get('/forums');
            setForums(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch forums');
            setLoading(false);
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

    if (loading) return <LinearProgress />;

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
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Create Forum
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {forums.map((forum) => (
                    <Grid item xs={12} sm={6} md={4} key={forum._id}>
                        <Card sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            }
                        }} onClick={() => navigate(`/forums/${forum._id}`)}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <ForumIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" component="div">
                                        {forum.name}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {forum.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                    <Chip
                                        icon={forum.isPrivate ? <LockIcon /> : <PublicIcon />}
                                        label={forum.isPrivate ? 'Private' : 'Public'}
                                        color={forum.isPrivate ? 'secondary' : 'primary'}
                                        size="small"
                                    />
                                    <Chip
                                        icon={<PersonIcon />}
                                        label={forum.createdBy?.name || 'Unknown'}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {forums.length === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            No forums available. Create one to get started!
                        </Alert>
                    </Grid>
                )}
            </Grid>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create New Forum</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Forum Name"
                        fullWidth
                        value={newForum.name}
                        onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        value={newForum.description}
                        onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={newForum.isPrivate}
                                onChange={(e) => setNewForum({ ...newForum, isPrivate: e.target.checked })}
                            />
                        }
                        label="Private Forum"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateForum}
                        variant="contained"
                        disabled={!newForum.name.trim()}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 