// frontend/src/components/task/CreateTaskForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import * as api from '../../api';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField'; // Can use TextField multiline
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card'; // Use Card for background
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';

function CreateTaskForm({ listId, onTaskCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (logic is same) ...
    setError('');
    if (!title.trim()) { onCancel(); return; }
    setLoading(true);
    try {
      const { data } = await api.createTask(listId, { title });
      onTaskCreated(data);
      setTitle(''); // Reset
      inputRef.current?.focus(); // Keep focus
    } catch (err) { setError(/*...*/); }
    // Don't set loading false here if keeping form open
    setLoading(false); // Set loading false on error or success completion if form closes
  };

   const handleKeyDown = (e) => {
       if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
       else if (e.key === 'Escape') { onCancel(); }
   };

  return (
    <Card sx={{ p: 1 }} variant="outlined"> {/* Subtle outline */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error" sx={{ mb: 1, fontSize: '0.75rem', p: '0 8px' }}>{error}</Alert>}
        <TextField
          inputRef={inputRef}
          placeholder="Enter a title for this card..."
          variant="outlined" // Standard outlined look
          size="small"
          fullWidth
          multiline // Allow multiple lines
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown} // Use keydown for submit/escape
          disabled={loading}
          sx={{ mb: 1, '& .MuiOutlinedInput-root': { p: '8px 10px' } }} // Adjust padding
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading || !title.trim()}
          >
            {loading ? 'Adding...' : 'Add Card'}
          </Button>
          <IconButton onClick={onCancel} size="small" disabled={loading} aria-label="cancel add card">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}

export default CreateTaskForm;