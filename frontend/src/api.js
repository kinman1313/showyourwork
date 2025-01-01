import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/auth/reset-password/${token}`, { password });
export const getCurrentUser = () => api.get('/auth/me');

// Family endpoints
export const getFamilyData = () => api.get('/family/me/family');
export const generateInviteCode = () => api.post('/family/invite-code');
export const joinFamily = (inviteCode) => api.post('/family/join', { inviteCode });

// Chore endpoints
export const getChores = () => api.get('/chores');
export const getAssignedChores = () => api.get('/chores/assigned');
export const createChore = (choreData) => api.post('/chores', choreData);
export const updateChore = (id, choreData) => api.put(`/chores/${id}`, choreData);
export const deleteChore = (id) => api.delete(`/chores/${id}`);
export const completeChore = (id) => api.patch(`/chores/${id}/complete`);
export const verifyChore = (id) => api.patch(`/chores/${id}/verify`);
export const resolveChore = (id) => api.patch(`/chores/${id}/resolve`);

// User endpoints
export const getChildren = () => api.get('/users/children');
export const getPoints = () => api.get('/users/points');

// Smart features endpoints
export const getChoreSuggestions = () => api.get('/smart/suggestions');
export const getSmartSchedule = () => api.get('/smart/smart-schedule');
export const adjustWeatherSchedule = (location) => api.post('/smart/weather-adjust', { location });
export const rotateChores = () => api.post('/smart/rotate');

export default api; 