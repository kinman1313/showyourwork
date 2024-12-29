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
} from '@mui/material';
import {
    Add as AddIcon,
    Check as CheckIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import api from '../../api';
import { useAuth } from '../../contexts/AuthContext';

export default function ParentDashboard() {
    const [chores, setChores] = useState([]);
    const [children, setChildren] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [newChore, setNewChore] = useState({
        title: '',
        description: '',
        points: 0,
        assignedTo: '',
        dueDate: '',
    });

    // Fetch chores and children data
    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateChore = async () => {
        try {
            // Ensure points is a number and format the data
            const choreData = {
                ...newChore,
                points: Number(newChore.points),
                dueDate: new Date(newChore.dueDate).toISOString()
            };

            // Log the exact data being sent
            console.log('Sending chore data:', {
                title: choreData.title,
                description: choreData.description,
                points: choreData.points,
                assignedTo: choreData.assignedTo,
                dueDate: choreData.dueDate
            });

            const response = await api.post('/chores', choreData);
            console.log('Chore creation response:', response.data);
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
            // Log the complete error details
            console.error('Create chore error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                data: err.response?.data
            });

            // Show the specific error message to the user
            setError(err.response?.data?.error || 'Failed to create chore');
        }
    };

    const handleVerifyChore = async (choreId) => {
        try {
            const response = await api.patch(`/chores/${choreId}/status`, { status: 'verified' });
            setChores(
                chores.map((chore) =>
                    chore._id === choreId ? { ...chore, status: 'verified' } : chore
                )
            );
            setError('');
        } catch (err) {
            console.error('Verify chore error:', err);
            setError('Failed to verify chore');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewChore((prev) => ({
            ...prev,
            [name]: name === 'points' ? parseInt(value) || 0 : value,
        }));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Parent Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
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
                {/* Pending Verification */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Pending Verification
                            </Typography>
                            {chores
                                .filter((chore) => chore.status === 'completed')
                                .map((chore) => (
                                    <Card key={chore._id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="subtitle1">{chore.title}</Typography>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleVerifyChore(chore._id)}
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Assigned to: {chore.assignedTo?.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Points: {chore.points}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Active Chores */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Active Chores
                            </Typography>
                            {chores
                                .filter((chore) => chore.status === 'pending')
                                .map((chore) => (
                                    <Card key={chore._id} sx={{ mb: 2, bgcolor: 'background.paper' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1">{chore.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Assigned to: {chore.assignedTo?.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Due: {new Date(chore.dueDate).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Points: {chore.points}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Create Chore Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateChore}
                        disabled={!newChore.title || !newChore.points || !newChore.assignedTo || !newChore.dueDate}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 