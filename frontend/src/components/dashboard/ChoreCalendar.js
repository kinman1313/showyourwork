import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Grid,
    Tooltip,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
} from '@mui/material';
import {
    ChevronLeft as PrevIcon,
    ChevronRight as NextIcon,
    Event as EventIcon,
    AccessTime as TimeIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import api from '../../api';

export default function ChoreCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [chores, setChores] = useState([]);
    const [selectedChore, setSelectedChore] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchChores();
    }, [fetchChores]);

    const fetchChores = async () => {
        try {
            const response = await api.get('/chores/calendar', {
                params: {
                    month: currentDate.getMonth() + 1,
                    year: currentDate.getFullYear(),
                },
            });
            setChores(response.data);
        } catch (err) {
            setError('Failed to fetch chores');
        }
    };

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
            days.push(<Grid item xs key={`empty-${i}`} sx={{ aspectRatio: '1' }} />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayChores = getChoresForDay(day);
            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();

            days.push(
                <Grid item xs key={day}>
                    <Card sx={{
                        height: '100%',
                        background: isToday ? 'rgba(25, 118, 210, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.2s',
                        cursor: dayChores.length > 0 ? 'pointer' : 'default',
                        '&:hover': dayChores.length > 0 ? {
                            transform: 'scale(1.05)',
                            boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`
                        } : {}
                    }}>
                        <CardContent>
                            <Typography
                                variant="h6"
                                sx={{
                                    textAlign: 'center',
                                    color: isToday ? 'primary.main' : 'text.primary'
                                }}
                            >
                                {day}
                            </Typography>
                            {dayChores.map((chore, index) => (
                                <Tooltip
                                    key={chore._id}
                                    title={`${chore.title} - ${chore.assignedTo?.name}`}
                                >
                                    <Chip
                                        size="small"
                                        label={chore.title}
                                        color={getStatusColor(chore.status)}
                                        onClick={() => setSelectedChore(chore)}
                                        sx={{
                                            mt: 0.5,
                                            width: '100%',
                                            maxWidth: '100%',
                                            overflow: 'hidden'
                                        }}
                                    />
                                </Tooltip>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            );
        }

        return days;
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
                    Chore Calendar
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handlePrevMonth} sx={{ color: 'primary.main' }}>
                        <PrevIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ mx: 2 }}>
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton onClick={handleNextMonth} sx={{ color: 'primary.main' }}>
                        <NextIcon />
                    </IconButton>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={1} columns={7}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Grid item xs key={day}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                mb: 1,
                                color: 'primary.main'
                            }}
                        >
                            {day}
                        </Typography>
                    </Grid>
                ))}
                {renderCalendarDays()}
            </Grid>

            <Dialog
                open={Boolean(selectedChore)}
                onClose={() => setSelectedChore(null)}
                maxWidth="sm"
                fullWidth
            >
                {selectedChore && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                                {selectedChore.title}
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" paragraph>
                                    {selectedChore.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography>
                                        Assigned to: {selectedChore.assignedTo?.name}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography>
                                        Due: {new Date(selectedChore.dueDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${selectedChore.points} points`}
                                    color="primary"
                                    sx={{ mr: 1 }}
                                />
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