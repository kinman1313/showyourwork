import React, { useState, useEffect } from 'react';
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
    MenuItem,
    IconButton,
    Alert,
    CardActions,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Check as CheckIcon,
    AccessTime as PendingIcon,
    CheckCircle as VerifiedIcon,
    WorkOutline as InProgressIcon,
} from '@mui/icons-material';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function ParentDashboard() {
    const [chores, setChores] = useState([]);
    const [children, setChildren] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [newChore, setNewChore] = useState({
        title: '',
        description: '',
        points: 0,
        assignedTo: '',
        dueDate: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [choresRes, childrenRes] = await Promise.all([
                api.get('/chores'),
                api.get('/users/children')
            ]);
            setChores(choresRes.data);
            setChildren(childrenRes.data);
            setError('');
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to fetch dashboard data');
        }
    };

    const handleCreateChore = async () => {
        try {
            const choreData = {
                ...newChore,
                points: Number(newChore.points),
                dueDate: new Date(newChore.dueDate).toISOString()
            };
            const response = await api.post('/chores', choreData);
            setChores([...chores, response.data]);
            setOpenDialog(false);
            setNewChore({
                title: '',
                description: '',
                points: 0,
                assignedTo: '',
                dueDate: '',
            });
            setError('');
        } catch (err) {
            console.error('Create chore error:', err);
            setError(err.response?.data?.error || 'Failed to create chore');
        }
    };

    const handleVerifyChore = async (choreId) => {
        try {
            const response = await api.patch(`/chores/${choreId}/status`, { status: 'verified' });
            setChores(chores.map(chore =>
                chore._id === choreId ? { ...chore, status: response.data.status } : chore
            ));
            setError('');
        } catch (err) {
            console.error('Verify chore error:', err);
            setError('Failed to verify chore');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewChore(prev => ({
            ...prev,
            [name]: name === 'points' ? parseInt(value) || 0 : value,
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'in_progress': return 'info';
            case 'completed': return 'success';
            case 'verified': return 'secondary';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <PendingIcon />;
            case 'in_progress': return <InProgressIcon />;
            case 'completed': return <CheckIcon />;
            case 'verified': return <VerifiedIcon />;
            default: return null;
        }
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
                    Parent Dashboard
                </Typography>
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
                    Create Chore
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {chores.map((chore) => (
                    <Grid item xs={12} md={6} key={chore._id}>
                        <Card sx={{
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`
                            }
                        }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {chore.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {chore.description}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Chip
                                        icon={getStatusIcon(chore.status)}
                                        label={chore.status.replace('_', ' ').toUpperCase()}
                                        color={getStatusColor(chore.status)}
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        label={`${chore.points} points`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Assigned to: {chore.assignedTo?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Due: {new Date(chore.dueDate).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                {chore.status === 'completed' && (
                                    <Tooltip title="Verify Completion">
                                        <IconButton
                                            onClick={() => handleVerifyChore(chore._id)}
                                            color="success"
                                            sx={{
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    background: 'rgba(46, 125, 50, 0.1)'
                                                }
                                            }}
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create Chore Dialog */}
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
                <DialogTitle>Create New Chore</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="title"
                        label="Title"
                        type="text"
                        fullWidth
                        value={newChore.title}
                        onChange={handleChange}
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
                        value={newChore.description}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="points"
                        label="Points"
                        type="number"
                        fullWidth
                        value={newChore.points}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="assignedTo"
                        label="Assign To"
                        select
                        fullWidth
                        value={newChore.assignedTo}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    >
                        {children.map((child) => (
                            <MenuItem key={child._id} value={child._id}>
                                {child.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        name="dueDate"
                        label="Due Date"
                        type="date"
                        fullWidth
                        value={newChore.dueDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        required
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
                        onClick={handleCreateChore}
                        disabled={!newChore.title || !newChore.points || !newChore.assignedTo || !newChore.dueDate}
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