import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <div className="main-container">
            <nav className="nav-container tech-border shimmer">
                <div className="nav-content">
                    {currentUser ? (
                        <div className="nav-links">
                            <button onClick={() => navigate('/forums')} className="nav-link ripple">
                                Forums
                            </button>
                            <button onClick={handleLogout} className="nav-link ripple">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="nav-link ripple">
                            Login
                        </button>
                    )}
                </div>
            </nav>
            <main className="content-container">
                {children}
            </main>
        </div>
    );
};

export default Layout; 