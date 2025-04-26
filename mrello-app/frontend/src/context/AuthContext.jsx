// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';
import * as api from '../api'; // Assuming api functions are exported from api/index.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial check loading state
  const [error, setError] = useState(null);

  // Effect to load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
         // You might want to verify the token hasn't expired here using jwt-decode
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
    setLoading(false); // Finished initial loading
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.login({ email, password });
      localStorage.setItem('user', JSON.stringify(data)); // Store user info (including token)
      setUser(data);
      return data; // Return user data on success
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed');
      localStorage.removeItem('user'); // Ensure no stale data on failure
      setUser(null);
      throw err; // Re-throw error to be caught by calling component
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.register({ name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
       return data;
    } catch (err) {
      console.error('Signup failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Signup failed');
      localStorage.removeItem('user');
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Optionally redirect to login page
    // window.location.href = '/login'; // Or use useNavigate hook from router
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    login,
    signup,
    logout,
  }), [user, loading, error]); // Dependencies for useMemo

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;