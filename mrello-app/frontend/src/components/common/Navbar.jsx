// frontend/src/components/common/Navbar.jsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'; // Icon for App

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky"> {/* sticky or static */}
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo/Brand */}
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to={user ? "/dashboard" : "/login"}
          sx={{
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            letterSpacing: '.1rem',
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { color: 'rgba(255,255,255,0.8)' }
          }}
        >
          <ViewKanbanIcon sx={{ mr: 1 }} />
          TaskFlow
        </Typography>

        {/* Navigation Links/Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/dashboard"
                startIcon={<DashboardIcon />}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }} // Hide on small screens
              >
                Dashboard
              </Button>
               <Typography sx={{ display: { xs: 'none', md: 'inline' }, mx: 1 }} >
                  |
               </Typography>
               <AccountCircle sx={{ display: { xs: 'none', md: 'inline' }, mr: 0.5, verticalAlign: 'middle' }} />
              <Typography sx={{ display: { xs: 'none', md: 'inline' }, mr: 2 }} >
                {user.name || user.email}
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                size="small"
                sx ={{ borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
              <Button
                variant="contained"
                color="secondary" // Or another contrasting color
                component={RouterLink}
                to="/signup"
                startIcon={<PersonAddIcon />}
                 sx={{ bgcolor: 'success.light', '&:hover': { bgcolor: 'success.main' } }} // Example override
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;