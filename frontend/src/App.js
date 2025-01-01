import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ParentDashboard from './components/parent/ParentDashboard';
import ChildDashboard from './components/child/ChildDashboard';
import ChoreList from './components/chores/ChoreList';
import ChoreCalendar from './components/calendar/ChoreCalendar';
import ForumList from './components/forum/ForumList';
import ForumView from './components/forum/ForumView';
import TopicView from './components/forum/TopicView';
import Layout from './components/layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Protected Routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout>
                                    <ParentDashboard />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/child-dashboard" element={
                            <ProtectedRoute>
                                <Layout>
                                    <ChildDashboard />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/chores" element={
                            <ProtectedRoute>
                                <Layout>
                                    <ChoreList />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/calendar" element={
                            <ProtectedRoute>
                                <Layout>
                                    <ChoreCalendar />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/forums" element={
                            <ProtectedRoute>
                                <Layout>
                                    <ForumList />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/forums/:forumId" element={
                            <ProtectedRoute>
                                <Layout>
                                    <ForumView />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/forums/:forumId/topics/:topicId" element={
                            <ProtectedRoute>
                                <Layout>
                                    <TopicView />
                                </Layout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
