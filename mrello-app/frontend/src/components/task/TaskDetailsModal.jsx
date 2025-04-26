// frontend/src/components/task/TaskDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import * as api from '../../api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'; // For layout
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

// Keep helper: formatDateForInput
const formatDateForInput = (isoDate) => { /* ... */ };

function TaskDetailsModal({ task, open, onClose, onTaskUpdate, onTaskDeleted }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(formatDateForInput(task.dueDate));
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [status, setStatus] = useState(task.status || 'To Do');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state if task prop changes (might happen if modal stays open but underlying task updates)
  useEffect(() => {
     setTitle(task.title);
     setDescription(task.description || '');
     setDueDate(formatDateForInput(task.dueDate));
     setPriority(task.priority || 'Medium');
     setStatus(task.status || 'To Do');
     setError(''); // Clear errors when task changes/modal opens
  }, [task, open]); // Depend on 'open' to reset when modal re-opens with same task


  const handleSaveChanges = async () => {
    // ... (validation and API call logic is the same) ...
     setError('');
     if (!title.trim()) { setError('Title cannot be empty.'); return; }
     setLoading(true);
     const updatedData = { title, description, dueDate: dueDate ? new Date(dueDate + 'T00:00:00Z') : null, priority, status };
     try {
       const { data: updatedTask } = await api.updateTask(task._id, updatedData);
       onTaskUpdate(updatedTask);
       onClose(); // Close modal on success
     } catch (err) {
       setError(err.response?.data?.message || 'Could not save changes.');
     } finally { setLoading(false); }
  };

  const handleDelete = async () => {
     // ... (confirmation and API call logic is the same) ...
     if (window.confirm(`Delete task "${task.title}"?`)) {
         setLoading(true);
         try {
             await api.deleteTask(task._id);
             onTaskDeleted(task._id, task.list); // Notify parent
             onClose(); // Close modal
         } catch (err) {
             setError(err.response?.data?.message || 'Could not delete task.');
             setLoading(false);
         }
     }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">Task Details</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers> {/* Adds dividers */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            variant="outlined"
            margin="dense"
            disabled={loading}
            error={!title.trim()} // Basic validation indication
            helperText={!title.trim() ? 'Title is required' : ''}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            margin="dense"
            disabled={loading}
            sx={{ mt: 2 }}
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                fullWidth
                variant="outlined"
                margin="dense"
                InputLabelProps={{ shrink: true }} // Keep label up for date type
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense" variant="outlined" disabled={loading}>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
             <Grid item xs={12} sm={6}>
               <FormControl fullWidth margin="dense" variant="outlined" disabled={loading}>
                 <InputLabel id="status-label">Status</InputLabel>
                 <Select
                   labelId="status-label"
                   label="Status"
                   value={status}
                   onChange={(e) => setStatus(e.target.value)}
                 >
                   <MenuItem value="To Do">To Do</MenuItem>
                   <MenuItem value="In Progress">In Progress</MenuItem>
                   <MenuItem value="Done">Done</MenuItem>
                   <MenuItem value="Archived">Archived</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '12px 24px', justifyContent: 'space-between' }}>
        <Button
          onClick={handleDelete}
          color="error"
          variant="outlined"
          startIcon={<DeleteIcon />}
          disabled={loading}
          size="small"
        >
          Delete Task
        </Button>
         <Box>
            <Button onClick={onClose} disabled={loading} color="inherit" sx={{ mr: 1 }}>
                Cancel
            </Button>
            <Button onClick={handleSaveChanges} variant="contained" disabled={loading || !title.trim()}>
                {loading ? 'Saving...' : 'Save Changes'}
            </Button>
         </Box>
      </DialogActions>
    </Dialog>
  );
}
export default TaskDetailsModal;