import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Button,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Assignment,
    ExitToApp,
    Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

export default function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = user?.role === 'parent'
        ? [
            { text: 'Dashboard', icon: <Dashboard />, path: '/parent-dashboard' },
            { text: 'Manage Chores', icon: <Assignment />, path: '/parent-dashboard/chores' },
        ]
        : [
            { text: 'Dashboard', icon: <Dashboard />, path: '/child-dashboard' },
            { text: 'My Chores', icon: <Assignment />, path: '/child-dashboard/chores' },
        ];

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    {process.env.REACT_APP_NAME}
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    if (!user) {
        return <Box component="main">{children}</Box>;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {user?.role === 'parent' ? 'Parent Dashboard' : 'Child Dashboard'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1 }} />
                        <Typography variant="body1" sx={{ mr: 2 }}>
                            {user?.name}
                        </Typography>
                        <Button color="inherit" onClick={handleLogout} startIcon={<ExitToApp />}>
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                }}
            >
                {children}
            </Box>
        </Box>
    );
} 