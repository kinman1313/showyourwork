import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Typography,
    IconButton,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Alert,
    LinearProgress,
    Tooltip,
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Event as EventIcon,
} from '@mui/icons-material';
import api from '../../api';

export default function ChoreCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [chores, setChores] = useState([]);
    const [selectedChore, setSelectedChore] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchChores = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/chores/calendar', {
                params: {
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear(),
                },
            });
            setChores(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch chores');
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchChores();
    }, [fetchChores]);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const getChoresForDay = (day) => {
        return chores.filter(chore => {
            const dueDate = new Date(chore.dueDate);
            return dueDate.getDate() === day &&
                dueDate.getMonth() === currentDate.getMonth() &&
                dueDate.getFullYear() === currentDate.getFullYear();
        });
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

    const renderCalendarDays = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <Grid item xs key={`empty-${i}`}>
                    <Box sx={{
                        height: '100%',
                        minHeight: 100,
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1
                    }} />
                </Grid>
            );
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayChores = getChoresForDay(day);
            days.push(
                <Grid item xs key={day}>
                    <Card sx={{
                        height: '100%',
                        minHeight: 100,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        cursor: dayChores.length ? 'pointer' : 'default',
                        transition: 'transform 0.2s',
                        '&:hover': dayChores.length ? {
                            transform: 'scale(1.02)',
                            background: 'rgba(255, 255, 255, 0.15)'
                        } : {}
                    }}>
                        <CardContent>
                            <Typography variant="h6" align="center" gutterBottom>
                                {day}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {dayChores.map((chore) => (
                                    <Tooltip
                                        key={chore._id}
                                        title={`${chore.title} - ${chore.assignedTo?.name || 'Unassigned'}`}
                                    >
                                        <Chip
                                            size="small"
                                            label={chore.title}
                                            color={getStatusColor(chore.status)}
                                            onClick={() => setSelectedChore(chore)}
                                            sx={{
                                                maxWidth: '100%',
                                                '& .MuiChip-label': {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }
                                            }}
                                        />
                                    </Tooltip>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            );
        }

        return days;
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
                    Chore Calendar
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={handlePrevMonth} color="primary">
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton onClick={handleNextMonth} color="primary">
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={2}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Grid item xs key={day}>
                        <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
                            {day}
                        </Typography>
                    </Grid>
                ))}

                {renderCalendarDays()}
            </Grid>

            <Dialog
                open={!!selectedChore}
                onClose={() => setSelectedChore(null)}
                PaperProps={{
                    sx: {
                        background: 'rgba(18, 18, 18, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                {selectedChore && (
                    <>
                        <DialogTitle>{selectedChore.title}</DialogTitle>
                        <DialogContent>
                            <Typography paragraph>
                                {selectedChore.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Assigned to: {selectedChore.assignedTo?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Points: {selectedChore.points}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={selectedChore.status.replace('_', ' ').toUpperCase()}
                                    color={getStatusColor(selectedChore.status)}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedChore(null)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
} 