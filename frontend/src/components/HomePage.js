import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/auth');
        }
    }, [token, navigate]);

    return (
        <div className="home-page">
            <h1>Welcome to Chore Tracker</h1>
            {/* Add your home page content here */}
        </div>
    );
};

export default HomePage;

