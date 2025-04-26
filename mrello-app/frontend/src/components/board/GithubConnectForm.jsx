// frontend/src/components/board/GithubConnectForm.jsx
import React, { useState } from 'react';
import * as api from '../../api';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub'; // Icon for title
import CircularProgress from '@mui/material/CircularProgress';

function GithubConnectForm({ boardId, onConnected, onClose }) {
  const [owner, setOwner] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!owner.trim() || !name.trim()) {
      setError('Repository owner and name are required.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.connectGithubRepo(boardId, { owner, name });
      onConnected(data); // Notify parent
      onClose(); // Close the dialog on success
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect repository. Please check details and ensure webhook is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="github-connect-dialog-title">
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }} id="github-connect-dialog-title">
         <GitHubIcon sx={{ mr: 1 }}/> Connect GitHub Repository
         {/* Close button */}
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {/* Use form directly inside Dialog for easier submission */}
      <Box component="form" onSubmit={handleSubmit} noValidate id="github-connect-form">
        <DialogContent dividers> {/* dividers adds top/bottom borders */}
          <DialogContentText sx={{ mb: 2 }}>
            Enter the repository details. Remember to manually create a webhook in your GitHub repository settings pointing to this application's webhook endpoint.
          </DialogContentText>
          {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>} {/* Use warning for user errors */}
          <TextField
            autoFocus
            margin="dense"
            id="repoOwner"
            label="Repository Owner (User/Org)"
            type="text"
            fullWidth
            variant="outlined"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            disabled={loading}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            id="repoName"
            label="Repository Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions sx={{ p: '12px 24px' }}> {/* Standard padding */}
          <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
          <Box sx={{ position: 'relative' }}> {/* Wrapper for loader */}
            <Button
              type="submit" // Submit the form
              variant="contained"
              disabled={loading || !owner.trim() || !name.trim()}
            >
              Connect Repository
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  color: 'primary.main',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default GithubConnectForm;