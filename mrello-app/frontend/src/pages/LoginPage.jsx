// frontend/src/pages/LoginPage.jsx
import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginForm from '../components/auth/LoginForm'; // Import the form

function LoginPage() {
  return (
    <Container
      component="main"
      maxWidth="xs" // Keeps the form nicely centered and not too wide
      sx={{
        display: 'flex',
        alignItems: 'center', // Vertically center the paper
        minHeight: 'calc(100vh - 64px - 48px)', // Adjust height based on Navbar and App padding
        py: 4, // Add some vertical padding
      }}
    >
      <Paper
        elevation={6} // Add shadow
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: (theme) => theme.spacing(4, 5), // Use theme spacing (top/bottom, left/right)
          borderRadius: 2, // Slightly more rounded
          width: '100%', // Ensure paper takes container width
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sign In
        </Typography>
        {/* Render the Login Form Component */}
        <LoginForm />
      </Paper>
    </Container>
  );
}

export default LoginPage;