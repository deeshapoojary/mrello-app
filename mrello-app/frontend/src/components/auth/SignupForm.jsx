// frontend/src/components/auth/SignupForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link'; // MUI Link
import Alert from '@mui/material/Alert'; // For errors
import CircularProgress from '@mui/material/CircularProgress';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const { signup, loading, error } = useAuth();
  const navigate = useNavigate();

  // Check password match on change
  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword === '');
  }, [password, confirmPassword]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    setPasswordsMatch(true); // Ensure it's true if they match now
    try {
      await signup(name, email, password);
      navigate('/dashboard'); // Redirect on success
    } catch (err) {
      // Error handled by useAuth hook and displayed via Alert
      console.error('Signup failed in component:', err);
    }
  };

  return (
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
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email-signup"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password-signup"
        autoComplete="new-password" // Important for password managers
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
        error={!passwordsMatch && confirmPassword !== ''} // Show error state if mismatch
        helperText={!passwordsMatch && confirmPassword !== '' ? 'Passwords do not match!' : ''} // Helper text for error
        InputLabelProps={{ shrink: true }}
      />
      <Box sx={{ position: 'relative' }}> {/* Wrapper for button and loader */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={loading || !passwordsMatch || !password || !confirmPassword} // Disable if passwords don't match
        >
          Sign Up
        </Button>
         {loading && ( // Show loader centered over button
          <CircularProgress
            size={24}
            sx={{
              color: 'primary.main',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-8px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
      <Box sx={{ textAlign: 'right' }}> {/* Align link */}
        <Link component={RouterLink} to="/login" variant="body2">
          {"Already have an account? Sign In"}
        </Link>
      </Box>
    </Box>
  );
}

export default SignupForm;