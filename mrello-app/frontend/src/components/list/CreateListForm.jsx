// frontend/src/components/list/CreateListForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import * as api from '../../api';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper'; // Use Paper for background
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';

function CreateListForm({ boardId, onListCreated, onCancel }) {
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
      const { data } = await api.createList(boardId, { title });
      onListCreated(data);
      setTitle(''); // Reset after successful creation
      // Keep focus if needed: inputRef.current?.focus();
    } catch (err) { setError(/*...*/); } finally { setLoading(false); }
  };

  return (
    <Paper sx={{ p: 1.5 }} elevation={1}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error" sx={{ mb: 1, fontSize: '0.75rem', p: '0 8px' }}>{error}</Alert>}
        <TextField
          inputRef={inputRef}
          placeholder="Enter list title..."
          variant="outlined"
          size="small" // Make input smaller
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading || !title.trim()}
          >
            {loading ? 'Adding...' : 'Add List'}
          </Button>
          <IconButton onClick={onCancel} size="small" disabled={loading} aria-label="cancel add list">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
export default CreateListForm;