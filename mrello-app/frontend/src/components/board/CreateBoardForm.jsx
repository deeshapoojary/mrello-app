// frontend/src/components/board/CreateBoardForm.jsx
import React, { useState } from 'react';
import * as api from '../../api';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

function CreateBoardForm({ onBoardCreated, onCancel }) { // Added onCancel prop
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    console.log("CreateBoardForm handleSubmit triggered. Title:", title);
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Board title is required.'); return; }
    setLoading(true);
    try {
      const { data } = await api.createBoard({ title });
      console.log("API call successful, received data:", data); // <--- ADD THIS
      onBoardCreated(data); // Call the callback prop
      setTitle('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create board.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>Create New Board</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Board Title"
        variant="outlined"
        fullWidth
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
        autoFocus
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
         <Button onClick={onCancel} disabled={loading} color="inherit">
            Cancel
         </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !title.trim()}
        >
          {loading ? 'Creating...' : 'Create Board'}
        </Button>
      </Box>
    </Box>
  );
}
export default CreateBoardForm;