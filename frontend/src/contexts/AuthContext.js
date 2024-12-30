import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Set up axios defaults
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Validate token by making a request to the backend
                    await axios.get(`${process.env.REACT_APP_API_URL}/test-env`);

                    // If request succeeds, token is valid
                    setUser(JSON.parse(storedUser));
                } catch (err) {
                    // If token is invalid, clear storage
                    console.error('Auth initialization error:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Attempting login...');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                email,
                password,
            });
            console.log('Login response:', response.data);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setError(null);
            console.log('Login successful, user:', user);
            return user;
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'An error occurred during login');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setError(null);
            return user;
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred during registration');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setError(null);
    };

    const forgotPassword = async (email) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, { email });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
            throw err;
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
                token,
                newPassword,
            });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}; 