import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
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

function LoadingScreen() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor={theme.palette.background.default}
        >
            <CircularProgress />
        </Box>
    );
}

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return user ? children : <Navigate to="/login" />;
}

function RoleBasedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) return <Navigate to="/login" />;
    return allowedRoles.includes(user.role) ? children : <Navigate to="/" />;
}

function DefaultRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) return <Navigate to="/login" />;
    return user.role === 'parent' ? <Navigate to="/parent-dashboard" /> : <Navigate to="/child-dashboard" />;
}

function AppRoutes() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
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
                <Route index element={<DefaultRoute />} />
                <Route path="parent-dashboard" element={
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
    );
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
