// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../api'; // Ensure API functions are imported
import BoardCard from '../components/board/BoardCard';
import CreateBoardForm from '../components/board/CreateBoardForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuth from '../hooks/useAuth'; // To check board owner for delete action
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import Collapse from '@mui/material/Collapse';
import { FiTrello } from 'react-icons/fi'; // Example icon for empty state

function DashboardPage() {
  const { user } = useAuth(); // Get current user info
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null); // Specific error for delete actions
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Function to fetch boards from the API
  const fetchBoardsData = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    setDeleteError(null); // Clear delete errors
    try {
      const { data } = await api.fetchBoards(); // Call your API function
      setBoards(data || []); // Update state with fetched boards, default to empty array
    } catch (err) {
      console.error("Failed to fetch boards:", err);
      setError(err.response?.data?.message || 'Failed to load boards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed if api call doesn't change based on props/state here

  // Fetch boards when the component mounts
  useEffect(() => {
    if (user) { // Only fetch if user is logged in (though route is protected)
        fetchBoardsData();
    } else {
        setLoading(false); // Stop loading if somehow user is not available
    }
  }, [fetchBoardsData, user]); // Re-fetch if the fetch function instance or user changes

  // Handler called by CreateBoardForm upon successful creation
  const handleBoardCreated = (newBoard) => {
    console.log("DashboardPage: handleBoardCreated called with:", newBoard);
    // Add the new board to the beginning or end of the list
    setBoards(prevBoards => [newBoard, ...prevBoards]);
    setShowCreateForm(false); // Hide the form
    setError(null); // Clear any previous loading errors
  };

  // Handler called by BoardCard to delete a board
  const handleBoardDeleted = async (boardId) => {
    setDeleteError(null); // Clear previous delete errors
    const originalBoards = [...boards]; // Store original state for potential revert

    // Optimistic UI update: remove the board immediately
    setBoards(prevBoards => prevBoards.filter(board => board._id !== boardId));

    try {
        await api.deleteBoard(boardId); // Call the API to delete
        // If successful, the optimistic update stands
        console.log(`Board ${boardId} deleted successfully.`);
    } catch (err) {
         console.error("Failed to delete board:", err);
         setDeleteError(err.response?.data?.message || 'Failed to delete board. Please try again.');
         // Revert UI state on error
         setBoards(originalBoards);
    }
  };

  return (
    <Container maxWidth="lg"> {/* Adjust max width as needed */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Your Boards
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Board'}
        </Button>
      </Box>

      {/* Alert for delete errors */}
      {deleteError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setDeleteError(null)}>{deleteError}</Alert>}

      {/* Create Board Form Area */}
      <Collapse in={showCreateForm} timeout="auto" unmountOnExit>
         <Box sx={{ mb: 4, p: 2, border: '1px dashed', borderColor: 'grey.400', borderRadius: 1, bgcolor: 'background.paper' }}>
            <CreateBoardForm
                onBoardCreated={handleBoardCreated}
                onCancel={() => setShowCreateForm(false)} // Pass cancel handler
            />
         </Box>
      </Collapse>

      {/* Main Content Area: Loading / Error / Empty / Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : boards.length === 0 && !showCreateForm ? (
         <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
            <FiTrello style={{ fontSize: '4rem', color: '#bdbdbd', marginBottom: '1rem' }}/> {/* Example Icon */}
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              No boards found.
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Get started by creating a new board!
            </Typography>
         </Box>
      ) : (
        // Boards Grid
        <Grid container spacing={3}>
          {boards.map((board) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={board._id}>
              <BoardCard
                board={board}
                // Pass delete handler only if the current user is the owner
                onDelete={user && board.owner && board.owner._id === user._id ? handleBoardDeleted : null}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default DashboardPage;