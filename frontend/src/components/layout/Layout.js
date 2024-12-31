import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="app-container">
            {!isAuthPage && currentUser && (
                <nav className="nav-container glass-card tech-border">
                    <div className="nav-content">
                        <div className="nav-brand" onClick={() => navigate('/forums')}>
                            <h1 className="gradient-text">ShowYourWork</h1>
                        </div>
                        <div className="nav-links">
                            <button
                                className="nav-button tech-border interactive-card"
                                onClick={() => navigate('/forums')}
                            >
                                Forums
                            </button>
                            <button
                                className="nav-button tech-border interactive-card"
                                onClick={() => navigate('/dashboard')}
                            >
                                Dashboard
                            </button>
                            <button
                                className="nav-button tech-border interactive-card"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>
            )}
            <main className="main-content glass-card tech-border">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
            <div className="background-effects">
                <div className="glow-effect top-right"></div>
                <div className="glow-effect bottom-left"></div>
            </div>
        </div>
    );
};

export default Layout; 