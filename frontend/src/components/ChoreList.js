import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { choreService } from '../services/chore';

const ChoreList = ({ chores, fetchChores }) => {
    const [loading, setLoading] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedChore, setSelectedChore] = useState(null);

    const handleToggleComplete = async (chore) => {
        setLoading(true);
        try {
            await choreService.updateChore(chore._id, { completed: !chore.completed });
            fetchChores();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleDeleteConfirm = (chore) => {
        setSelectedChore(chore);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteChore = async () => {
        setLoading(true);
        try {
            await choreService.deleteChore(selectedChore._id);
            fetchChores();
        } catch (err) {
            console.error(err);
        }
        setDeleteConfirmOpen(false);
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <List>
                {chores.map((chore) => (
                    <ListItem key={chore._id}>
                        <ListItemText
                            primary={chore.name}
                            secondary={`Assigned to: ${chore.assignedTo}`}
                            style={{ textDecoration: chore.completed ? 'line-through' : 'none' }}
                        />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => handleToggleComplete(chore)}>
                                <CheckIcon color={chore.completed ? 'success' : 'disabled'} />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteConfirm(chore)}>
                                <DeleteIcon color="error" />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete Chore</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this chore?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteChore} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ChoreList;