import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    Paper,
    Alert,
    useTheme,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const theme = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const user = await login(email, password);
            navigate(user.role === 'parent' ? '/parent-dashboard' : '/child-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to log in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '200%',
                            height: '100%',
                            background: 'linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.1) 40%, rgba(255, 255, 255, 0.1) 60%, transparent 80%)',
                            animation: 'shine 3s infinite linear',
                        },
                        '@keyframes shine': {
                            to: {
                                transform: 'translateX(50%)',
                            },
                        },
                    }}
                >
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            mb: 3,
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                            letterSpacing: '0.5px',
                        }}
                    >
                        Welcome Back
                    </Typography>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                width: '100%',
                                mb: 2,
                                background: 'rgba(211, 47, 47, 0.1)',
                                border: '1px solid rgba(211, 47, 47, 0.3)',
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            width: '100%',
                            '& .MuiTextField-root': {
                                mb: 2,
                            },
                        }}
                    >
                        <TextField
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.23)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: theme.palette.primary.main,
                                    },
                                },
                            }}
                        />
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.23)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: theme.palette.primary.main,
                                    },
                                },
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 2,
                                mb: 3,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1.5,
                            }}
                        >
                            <Link
                                component={RouterLink}
                                to="/register"
                                variant="body2"
                                sx={{
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease-in-out',
                                    '&:hover': {
                                        color: theme.palette.primary.light,
                                    },
                                }}
                            >
                                Don't have an account? Sign Up
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/forgot-password"
                                variant="body2"
                                sx={{
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease-in-out',
                                    '&:hover': {
                                        color: theme.palette.primary.light,
                                    },
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
} 