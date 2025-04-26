// frontend/src/pages/SignupPage.jsx
import React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SignupForm from '../components/auth/SignupForm'; // Import the form

function SignupPage() {
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px - 48px)',
        py: 4,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: (theme) => theme.spacing(4, 5),
          borderRadius: 2,
          width: '100%',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}> {/* Different color for visual distinction */}
          <PersonAddAlt1Icon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sign Up
        </Typography>
        {/* Render the Signup Form Component */}
        <SignupForm />
      </Paper>
    </Container>
  );
}

export default SignupPage;