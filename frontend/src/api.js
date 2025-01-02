import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://showyourwork-backend.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
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
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const register = (userData) => api.post('/api/auth/register', userData);
export const forgotPassword = (email) => api.post('/api/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post(`/api/auth/reset-password/${token}`, { password });
export const getCurrentUser = () => api.get('/api/auth/me');

// Family endpoints
export const getFamilyData = () => api.get('/api/family/me/family');
export const generateInviteCode = () => api.post('/api/family/invite-code');
export const joinFamily = (inviteCode) => api.post('/api/family/join', { inviteCode });

// Chore endpoints
export const getChores = () => api.get('/api/chores');
export const getAssignedChores = () => api.get('/api/chores/assigned');
export const createChore = (choreData) => api.post('/api/chores', choreData);
export const updateChore = (id, choreData) => api.put(`/api/chores/${id}`, choreData);
export const deleteChore = (id) => api.delete(`/api/chores/${id}`);
export const completeChore = (id) => api.patch(`/api/chores/${id}/complete`);
export const verifyChore = (id) => api.patch(`/api/chores/${id}/verify`);
export const resolveChore = (id) => api.patch(`/api/chores/${id}/resolve`);

// User endpoints
export const getChildren = () => api.get('/api/users/children');
export const getPoints = () => api.get('/api/users/points');

// Smart features endpoints
export const getChoreSuggestions = () => api.get('/api/smart/suggestions');
export const getSmartSchedule = () => api.get('/api/smart/smart-schedule');
export const adjustWeatherSchedule = (location) => api.post('/api/smart/weather-adjust', { location });
export const rotateChores = () => api.post('/api/smart/rotate');

// Money Management endpoints
export const getSavingsGoals = () => api.get('/api/money/savings-goals');
export const createSavingsGoal = (goalData) => api.post('/api/money/savings-goals', goalData);
export const updateSavingsGoal = (id, goalData) => api.patch(`/api/money/savings-goals/${id}`, goalData);

export const getTransactions = () => api.get('/api/money/transactions');
export const createTransaction = (transactionData) => api.post('/api/money/transactions', transactionData);

export const getLessonProgress = () => api.get('/api/money/lessons/progress');
export const updateLessonProgress = (progressData) => api.post('/api/money/lessons/progress', progressData);

export const getMoneyGoals = () => api.get('/api/money/goals');
export const updateMoneyGoals = (goalsData) => api.patch(`/api/money/goals`, goalsData);

export const getFinancialSummary = () => api.get('/api/money/summary');

// Forum endpoints
export const getTopics = () => api.get('/api/forum/topics');
export const getTopic = (id) => api.get(`/api/forum/topics/${id}`);
export const createTopic = (topicData) => api.post('/api/forum/topics', topicData);
export const createPost = (topicId, postData) => api.post(`/api/forum/topics/${topicId}/posts`, postData);
export const updatePost = (topicId, postId, postData) => api.patch(`/api/forum/topics/${topicId}/posts/${postId}`, postData);
export const deletePost = (topicId, postId) => api.delete(`/api/forum/topics/${topicId}/posts/${postId}`);
export const likePost = (topicId, postId) => api.post(`/api/forum/topics/${topicId}/posts/${postId}/like`);

export default api; 