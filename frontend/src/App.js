import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ParentDashboard from './components/dashboard/ParentDashboard';
import ChildDashboard from './components/dashboard/ChildDashboard';
import Leaderboard from './components/dashboard/Leaderboard';
import ChoreCalendar from './components/dashboard/ChoreCalendar';
import Layout from './components/layout/Layout';
import ForumList from './components/forum/ForumList';
import ForumView from './components/forum/ForumView';
import TopicView from './components/forum/TopicView';

function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

function RoleBasedRoute({ children, allowedRoles }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return allowedRoles.includes(user.role) ? children : <Navigate to="/" />;
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        <Route path="/" element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }>
                            <Route index element={
                                <RoleBasedRoute allowedRoles={['parent']}>
                                    <ParentDashboard />
                                </RoleBasedRoute>
                            } />
                            <Route path="child-dashboard" element={
                                <RoleBasedRoute allowedRoles={['child']}>
                                    <ChildDashboard />
                                </RoleBasedRoute>
                            } />
                            <Route path="calendar" element={
                                <PrivateRoute>
                                    <ChoreCalendar />
                                </PrivateRoute>
                            } />
                            <Route path="leaderboard" element={
                                <PrivateRoute>
                                    <Leaderboard />
                                </PrivateRoute>
                            } />
                            <Route path="forums" element={
                                <PrivateRoute>
                                    <ForumList />
                                </PrivateRoute>
                            } />
                            <Route path="forums/:forumId" element={
                                <PrivateRoute>
                                    <ForumView />
                                </PrivateRoute>
                            } />
                            <Route path="topics/:topicId" element={
                                <PrivateRoute>
                                    <TopicView />
                                </PrivateRoute>
                            } />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
