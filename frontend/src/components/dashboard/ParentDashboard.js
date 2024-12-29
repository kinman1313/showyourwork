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
import axios from 'axios';
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
                    axios.get(`${process.env.REACT_APP_API_URL}/chores`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }),
                    axios.get(`${process.env.REACT_APP_API_URL}/users/children`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    }),
                ]);
                setChores(choresRes.data);
                setChildren(childrenRes.data);
            } catch (err) {
                setError('Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateChore = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/chores`,
                newChore,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setChores([...chores, response.data]);
            setOpenDialog(false);
            setNewChore({
                title: '',
                description: '',
                points: 0,
                assignedTo: '',
                dueDate: '',
            });
        } catch (err) {
            setError('Failed to create chore');
        }
    };

    const handleVerifyChore = async (choreId) => {
        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}/chores/${choreId}/status`,
                { status: 'verified' },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setChores(
                chores.map((chore) =>
                    chore._id === choreId ? { ...chore, status: 'verified' } : chore
                )
            );
        } catch (err) {
            setError('Failed to verify chore');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewChore((prev) => ({
            ...prev,
            [name]: value,
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
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Chore</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Title"
                        name="title"
                        value={newChore.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        value={newChore.description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Points"
                        name="points"
                        type="number"
                        value={newChore.points}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        select
                        label="Assign To"
                        name="assignedTo"
                        value={newChore.assignedTo}
                        onChange={handleChange}
                    >
                        {children.map((child) => (
                            <MenuItem key={child._id} value={child._id}>
                                {child.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Due Date"
                        name="dueDate"
                        type="date"
                        value={newChore.dueDate}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleCreateChore} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
} 