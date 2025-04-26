// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function LoadingSpinner({ size = 40 }) { // Allow size prop
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
      <CircularProgress size={size} />
    </Box>
  );
}

export default LoadingSpinner;