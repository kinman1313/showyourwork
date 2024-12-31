import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ForumList from './components/forum/ForumList';
import ForumView from './components/forum/ForumView';
import TopicView from './components/forum/TopicView';
import Layout from './components/layout/Layout';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Layout>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Protected routes */}
                        <Route
                            path="/forums"
                            element={
                                <ProtectedRoute>
                                    <ForumList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/forum/:id"
                            element={
                                <ProtectedRoute>
                                    <ForumView />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/topic/:id"
                            element={
                                <ProtectedRoute>
                                    <TopicView />
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirect root to forums if logged in, otherwise to login */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/forums" replace />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </AuthProvider>
        </Router>
    );
};

export default App;
