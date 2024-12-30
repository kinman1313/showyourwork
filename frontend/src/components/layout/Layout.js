import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    // Don't show nav bar on login page
    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';
    const hideNav = isLoginPage || isRegisterPage;

    return (
        <div className="main-container">
            {!hideNav && (
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
                        ) : null}
                    </div>
                </nav>
            )}
            <main className="content-container">
                {children}
            </main>
        </div>
    );
};

export default Layout; 