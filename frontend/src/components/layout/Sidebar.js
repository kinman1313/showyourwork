import React from 'react';
import { Link } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Box
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Event as CalendarIcon,
    EmojiEvents as LeaderboardIcon,
    Forum as ForumIcon,
    AutoAwesome as SmartIcon,
    Person as ProfileIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, onClose, width = 240 }) => {
    const { user } = useAuth();

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: user?.role === 'parent' ? '/parent-dashboard' : '/child-dashboard'
        },
        {
            text: 'Calendar',
            icon: <CalendarIcon />,
            path: '/calendar'
        },
        {
            text: 'Leaderboard',
            icon: <LeaderboardIcon />,
            path: '/leaderboard'
        },
        {
            text: 'Forums',
            icon: <ForumIcon />,
            path: '/forums'
        },
        {
            text: 'Smart Features',
            icon: <SmartIcon />,
            path: '/smart-features'
        }
    ];

    const secondaryMenuItems = [
        {
            text: 'Profile',
            icon: <ProfileIcon />,
            path: '/profile'
        },
        {
            text: 'Settings',
            icon: <SettingsIcon />,
            path: '/settings'
        }
    ];

    return (
        <Drawer
            variant="permanent"
            open={open}
            onClose={onClose}
            sx={{
                width: width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: width,
                    boxSizing: 'border-box',
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)'
                }
            }}
        >
            <Box sx={{ overflow: 'auto', height: '100%' }}>
                {/* Logo or Brand */}
                <Box
                    sx={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                    }}
                >
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{ height: 40 }}
                    />
                </Box>

                {/* Main Menu Items */}
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            component={Link}
                            to={item.path}
                            key={item.text}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'primary.main' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    '& .MuiTypography-root': {
                                        fontWeight: 500
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Secondary Menu Items */}
                <List>
                    {secondaryMenuItems.map((item) => (
                        <ListItem
                            button
                            component={Link}
                            to={item.path}
                            key={item.text}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'primary.main' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    '& .MuiTypography-root': {
                                        fontWeight: 500
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar; 