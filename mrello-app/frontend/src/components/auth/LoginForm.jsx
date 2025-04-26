// frontend/src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link'; // MUI Link
import Alert from '@mui/material/Alert'; // For displaying errors
import CircularProgress from '@mui/material/CircularProgress'; // Loading indicator

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard'); // Redirect on success
    } catch (err) {
      // Error is handled and displayed via the error state from useAuth
      console.error('Login failed in component:', err);
    }
  };

  return (
    // Use Box as the form container
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus // Focus on first field
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        InputLabelProps={{ shrink: true }} // Keep label floated
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        InputLabelProps={{ shrink: true }} // Keep label floated
      />
      {/* Optional: Add Remember me Checkbox here if needed */}
      <Box sx={{ position: 'relative' }}> {/* Wrapper for button and loader */}
        <Button
          type="submit"
          fullWidth
          variant="contained" // Primary button style
          sx={{ mt: 3, mb: 2, py: 1.5 }} // Margin top/bottom, more padding
          disabled={loading}
        >
          Sign In
        </Button>
        {loading && ( // Show loader centered over button
          <CircularProgress
            size={24}
            sx={{
              color: 'primary.main',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-8px', // Adjust based on button padding and loader size
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
      <Box sx={{ textAlign: 'right' }}> {/* Align link to the right */}
        <Link component={RouterLink} to="/signup" variant="body2">
          {"Don't have an account? Sign Up"}
        </Link>
      </Box>
    </Box>
  );
}

export default LoginForm;