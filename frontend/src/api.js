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

// Money Management endpoints
export const getSavingsGoals = () => api.get('/money/savings-goals');
export const createSavingsGoal = (goalData) => api.post('/money/savings-goals', goalData);
export const updateSavingsGoal = (id, goalData) => api.patch(`/money/savings-goals/${id}`, goalData);

export const getTransactions = () => api.get('/money/transactions');
export const createTransaction = (transactionData) => api.post('/money/transactions', transactionData);

export const getLessonProgress = () => api.get('/money/lessons/progress');
export const updateLessonProgress = (progressData) => api.post('/money/lessons/progress', progressData);

export const getMoneyGoals = () => api.get('/money/goals');
export const updateMoneyGoals = (goalsData) => api.patch('/money/goals', goalsData);

export const getFinancialSummary = () => api.get('/money/summary');

// Forum endpoints
export const getTopics = () => api.get('/api/forum/topics');
export const getTopic = (id) => api.get(`/api/forum/topics/${id}`);
export const createTopic = (topicData) => api.post('/api/forum/topics', topicData);
export const createPost = (topicId, postData) => api.post(`/api/forum/topics/${topicId}/posts`, postData);
export const updatePost = (topicId, postId, postData) => api.patch(`/api/forum/topics/${topicId}/posts/${postId}`, postData);
export const deletePost = (topicId, postId) => api.delete(`/api/forum/topics/${topicId}/posts/${postId}`);
export const likePost = (topicId, postId) => api.post(`/api/forum/topics/${topicId}/posts/${postId}/like`);

export default api; 