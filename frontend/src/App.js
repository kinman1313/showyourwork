import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Dashboard Components
import ParentDashboard from './components/dashboard/ParentDashboard';
import ChildDashboard from './components/dashboard/ChildDashboard';

// Layout Components
import Layout from './components/layout/Layout';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    return children;
};

const RoleBasedRoute = ({ children, allowedRole }) => {
    const { user } = useAuth();
    if (!user || user.role !== allowedRole) {
        return <Navigate to="/" />;
    }
    return children;
};

const DefaultRoute = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <Navigate to={user.role === 'parent' ? '/parent-dashboard' : '/child-dashboard'} />;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Layout>
                        <Routes>
                            {/* Auth Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />

                            {/* Protected Routes */}
                            <Route
                                path="/parent-dashboard"
                                element={
                                    <PrivateRoute>
                                        <RoleBasedRoute allowedRole="parent">
                                            <ParentDashboard />
                                        </RoleBasedRoute>
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/child-dashboard"
                                element={
                                    <PrivateRoute>
                                        <RoleBasedRoute allowedRole="child">
                                            <ChildDashboard />
                                        </RoleBasedRoute>
                                    </PrivateRoute>
                                }
                            />

                            {/* Default Route */}
                            <Route path="/" element={<DefaultRoute />} />

                            {/* Catch-all Route */}
                            <Route path="*" element={<DefaultRoute />} />
                        </Routes>
                    </Layout>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
