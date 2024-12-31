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
                <nav className="nav-container glass-container tech-border">
                    <div className="nav-content">
                        <div className="nav-brand gradient-text" onClick={() => navigate('/forums')}>
                            ShowYourWork
                        </div>
                        <div className="nav-links">
                            <button onClick={() => navigate('/forums')} className="nav-link">
                                Forums
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="nav-link">
                                Dashboard
                            </button>
                            <button onClick={handleLogout} className="nav-link">
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>
            )}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout; 