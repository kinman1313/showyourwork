import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    const [chores, setChores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }

        const fetchChores = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chores`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChores(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchChores();
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/auth');
    };

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="home-page">
            <h1>Chore Tracker</h1>
            <button onClick={handleLogout}>Logout</button>

            <div className="chores-list">
                {chores.map(chore => (
                    <div key={chore._id} className={`chore-item ${chore.completed ? 'completed' : ''}`}>
                        <span>{chore.name}</span>
                        <span>{chore.assignedTo}</span>
                        <span>{new Date(chore.dueDate).toLocaleDateString()}</span>
                    </div>
                ))}
            </div>

            <Link to="/admin">
                <button>Admin Panel</button>
            </Link>
        </div>
    );
};

export default HomePage;

