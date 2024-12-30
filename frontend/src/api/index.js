import axios from 'axios';

const API_URL = 'https://showyourwork-backend.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: false
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // Log request for debugging
        console.log('Making request to:', config.url);

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Received response:', response.status);
        return response;
    },
    (error) => {
        console.error('Response error:', error);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 