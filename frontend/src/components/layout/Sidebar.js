import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    CalendarToday as CalendarIcon,
    EmojiEvents as LeaderboardIcon,
    Forum as ForumIcon,
    AutoAwesome as SmartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    const isParent = user?.role === 'parent';

    return (
        <Box sx={{ width: 240, flexShrink: 0 }}>
            <List>
                <ListItem button component={Link} to={isParent ? '/parent-dashboard' : '/child-dashboard'}>
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>

                <ListItem button component={Link} to="/calendar">
                    <ListItemIcon>
                        <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText primary="Calendar" />
                </ListItem>

                <ListItem button component={Link} to="/leaderboard">
                    <ListItemIcon>
                        <LeaderboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Leaderboard" />
                </ListItem>

                <ListItem button component={Link} to="/forums">
                    <ListItemIcon>
                        <ForumIcon />
                    </ListItemIcon>
                    <ListItemText primary="Forums" />
                </ListItem>

                <ListItem button component={Link} to="/smart-features">
                    <ListItemIcon>
                        <SmartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Smart Features" />
                </ListItem>
            </List>
            <Divider />
        </Box>
    );
};

export default Sidebar; 