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

        // Log outgoing requests
        console.log('Request:', {
            method: config.method,
            url: config.url,
            headers: config.headers
        });

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
        console.log('Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        if (error.response) {
            // Server responded with error
            console.error('Server error:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // Request made but no response
            console.error('Network error:', error.message);
        } else {
            // Error in request configuration
            console.error('Request config error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api; 