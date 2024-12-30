import axios from 'axios';

const API_URL = 'https://showyourwork-backend.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add token if exists
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request for debugging
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Log successful response
        console.log(`Response from ${response.config.url}: Status ${response.status}`);
        return response;
    },
    (error) => {
        // Log error details
        console.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });

        // Handle authentication errors
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        // Handle network errors
        if (error.message === 'Network Error') {
            console.error('Network error - please check your connection');
        }

        // Handle timeout
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        }

        return Promise.reject(error);
    }
);

export default api; 