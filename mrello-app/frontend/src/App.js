// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

// MUI Imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box'; // Use Box for layout

// Import Pages and Components (paths remain the same)
import Navbar from './components/common/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/common/LoadingSpinner'; // Still useful

// Define a basic theme (optional, customize as needed)
const theme = createTheme({
  palette: {
    // mode: 'light', // or 'dark'
    primary: {
      main: '#1976d2', // Example Blue
    },
    secondary: {
      main: '#dc004e', // Example Pink
    },
    background: {
      default: '#f4f6f8', // Light gray background
      paper: '#ffffff', // Background for paper elements like Cards
    },
  },
  // You can customize typography, spacing, etc. here
});

// ProtectedRoute Component (Logic is the same, wrapper might change)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    // Use MUI spinner here if desired, or keep the simple one
    return <LoadingSpinner />;
  }
  return user ? children : <Navigate to="/login" replace />;
};

// PublicRoute Component (Logic is the same)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
      return <LoadingSpinner />;
    }
    return user ? <Navigate to="/dashboard" replace /> : children;
}

// AuthRedirector Component (Logic is the same)
const AuthRedirector = () => {
    const { user, loading } = useAuth();
     if (loading) return <LoadingSpinner />;
     return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}


function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}> {/* Apply MUI Theme */}
        <CssBaseline /> {/* Apply baseline styles */}
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            {/* Main content area */}
            <Box component="main" sx={{ flexGrow: 1, py: 3, px: { xs: 2, sm: 3 } }}> {/* Add padding */}
              <Routes>
                {/* Routes remain the same */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/board/:boardId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
                <Route path="/" element={<AuthRedirector />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Box>
            {/* Optional Footer could go here */}
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;