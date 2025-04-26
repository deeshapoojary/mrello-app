// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // Example icon

function NotFoundPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 150px)', // Adjust based on layout
        textAlign: 'center',
        p: 3,
      }}
    >
      <ReportProblemIcon sx={{ fontSize: 80, color: 'warning.light', mb: 2 }} />
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Sorry, the page you are looking for could not be found.
      </Typography>
      <Button
        variant="contained"
        component={RouterLink}
        to="/dashboard" // Link to dashboard
      >
        Go Back Home
      </Button>
    </Box>
  );
}

export default NotFoundPage;