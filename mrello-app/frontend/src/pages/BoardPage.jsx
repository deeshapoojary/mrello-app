// frontend/src/pages/BoardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import * as api from '../api'; // Assuming API functions are correctly set up
import ListColumn from '../components/list/ListColumn';
import CreateListForm from '../components/list/CreateListForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GithubConnectForm from '../components/board/GithubConnectForm';

// MUI Imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Stack from '@mui/material/Stack'; // Use Stack for horizontal list layout

function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null); // Holds the entire board data (lists, tasks)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For general loading errors
  const [moveError, setMoveError] = useState(null); // Specific error for DnD or updates
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [showGithubConnect, setShowGithubConnect] = useState(false);

  // --- Data Fetching ---
  const fetchBoardData = useCallback(async () => {
    console.log('Fetching board data...');
    setLoading(true);
    setError(null); // Clear previous errors on new fetch
    setMoveError(null);
    try {
      const { data } = await api.fetchBoardById(boardId);
      console.log('Board data received:', data);
      // Ensure lists and tasks within lists are sorted by their order property
      if (data && data.lists) {
        // Sort lists
        data.lists.sort((a, b) => a.order - b.order);
        // Sort tasks within each list
        data.lists.forEach(list => {
          if (list.tasks && Array.isArray(list.tasks)) {
            list.tasks.sort((a, b) => a.order - b.order);
          } else {
            list.tasks = []; // Ensure tasks is always an array
          }
        });
      } else if (data) {
        data.lists = []; // Ensure lists array exists even if empty
      }
      setBoard(data);
    } catch (err) {
      console.error("Failed to fetch board:", err);
      setError(err.response?.data?.message || 'Failed to load board data. Please check the ID or try again.');
      // Optional: Redirect if board not found or user forbidden
      if (err.response?.status === 404 || err.response?.status === 403) {
          // setError(`Error: ${err.response.data.message || 'Board not found or access denied.'}`);
          // Consider redirecting after a delay or based on error type
          // setTimeout(() => navigate('/dashboard'), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [boardId, navigate]); // Dependencies

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]); // Fetch data when component mounts or fetch function changes


  // --- Drag and Drop Handler ---
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    setMoveError(null); // Clear previous move errors

    // 1. Check if dropped outside a valid droppable or no movement
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // --- Optimistic UI Update ---
    // Create a deep copy to modify state immutably
    const newBoard = JSON.parse(JSON.stringify(board));
    let originalBoard = JSON.parse(JSON.stringify(board)); // Keep original for revert

    try {
      // --- LIST REORDERING ---
      if (type === 'COLUMN') {
        const movedList = newBoard.lists.splice(source.index, 1)[0];
        newBoard.lists.splice(destination.index, 0, movedList);

        // Update list order property locally
        newBoard.lists.forEach((list, index) => { list.order = index; });

        setBoard(newBoard); // Optimistic update

        // API Call: Update multiple list orders (ideally a bulk endpoint)
        await Promise.all(newBoard.lists.map(list =>
          api.updateList(list._id, { order: list.order })
        ));
        console.log('List order updated successfully via API');

      }
      // --- TASK MOVING ---
      else if (type === 'TASK') {
        const sourceListIndex = newBoard.lists.findIndex(l => l._id === source.droppableId);
        const destListIndex = newBoard.lists.findIndex(l => l._id === destination.droppableId);

        if (sourceListIndex === -1 || destListIndex === -1) throw new Error("Source or destination list not found in state");

        const sourceList = newBoard.lists[sourceListIndex];
        const destList = newBoard.lists[destListIndex];
        const movedTask = sourceList.tasks.splice(source.index, 1)[0]; // Remove from source

        if (!movedTask) throw new Error("Task not found in source list state");

        destList.tasks.splice(destination.index, 0, movedTask); // Add to destination

        // Update task order property locally within both affected lists
        sourceList.tasks.forEach((task, index) => { task.order = index; });
        // Update dest list only if it's different, otherwise sourceList already covered it
        if (sourceList._id !== destList._id) {
            destList.tasks.forEach((task, index) => { task.order = index; });
        }

        setBoard(newBoard); // Optimistic update

        // API Call: Use the dedicated moveTask endpoint
        const backendResponse = await api.moveTask(draggableId, {
          sourceListId: source.droppableId,
          targetListId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        });

        // Optional: Refresh state from backend response for guaranteed consistency
        // If moveTask returns the full updated board:
         if (backendResponse && backendResponse.data) {
             // Ensure backend data is also sorted correctly before setting
             const updatedBoardData = backendResponse.data;
              if (updatedBoardData && updatedBoardData.lists) {
                  updatedBoardData.lists.sort((a, b) => a.order - b.order);
                  updatedBoardData.lists.forEach(list => {
                      if (list.tasks && Array.isArray(list.tasks)) {
                          list.tasks.sort((a, b) => a.order - b.order);
                      } else { list.tasks = []; }
                  });
              }
             setBoard(updatedBoardData);
             console.log('Task move successful, state updated from API response');
         } else {
             console.log('Task move successful (optimistic update sufficient)');
         }
      }
    } catch (error) {
      console.error("Failed to persist move:", error);
      setMoveError(error.response?.data?.message || "Failed to save changes after move. Reverting.");
      // Revert UI state on failure
      setBoard(originalBoard);
    }
  };

  // --- CRUD Handlers ---
  const handleListCreated = useCallback((newList) => {
    setBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) return prevBoard; // Safety check
      const updatedLists = [...prevBoard.lists, newList].sort((a, b) => a.order - b.order);
      return { ...prevBoard, lists: updatedLists };
    });
    setShowCreateListForm(false); // Hide form
  }, []);

  const handleTaskCreated = useCallback((listId, newTask) => {
    setBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) return prevBoard;
      const newLists = prevBoard.lists.map(list => {
        if (list._id === listId) {
          const updatedTasks = list.tasks ? [...list.tasks, newTask] : [newTask];
          updatedTasks.sort((a, b) => a.order - b.order); // Ensure sorted
          return { ...list, tasks: updatedTasks };
        }
        return list;
      });
      return { ...prevBoard, lists: newLists };
    });
     // Optional: Keep CreateTaskForm open or close it based on UX preference
  }, []);

  const handleTaskUpdated = useCallback((updatedTask) => {
    setBoard(prevBoard => {
        if (!prevBoard || !prevBoard.lists) return prevBoard;

        let taskFoundAndUpdated = false;
        const newLists = prevBoard.lists.map(list => {
            // Find the list where the task currently resides (using updatedTask.list)
            if (list._id === updatedTask.list) {
                 // If the task is in this list, update it
                const taskIndex = list.tasks?.findIndex(t => t._id === updatedTask._id);
                if (taskIndex !== -1 && taskIndex !== undefined) {
                    const newTasks = [...list.tasks];
                    newTasks[taskIndex] = updatedTask;
                    newTasks.sort((a, b) => a.order - b.order); // Re-sort
                    taskFoundAndUpdated = true;
                    return { ...list, tasks: newTasks };
                }
            }
            // If task moved lists, it might not be found here, need to check other lists
             return list;
        });

        // If task wasn't updated (potentially moved lists implicitly via modal change - less ideal)
        // A more robust solution would involve detecting list changes during update/move
        // For now, we assume the update happens within the task's current list ID
        if (!taskFoundAndUpdated) {
            console.warn("Task update received, but task not found in its specified list ID. State might be stale if list changed.");
             // To handle implicit moves, you might need to remove from old list and add to new
             // This requires knowing the *previous* list ID. Better handled by specific move actions.
        }


        return { ...prevBoard, lists: newLists };
    });
  }, []);


  const handleTaskDeleted = useCallback((taskId, listId) => {
    setBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) return prevBoard;
      const newLists = prevBoard.lists.map(list => {
        if (list._id === listId) {
          const filteredTasks = list.tasks?.filter(t => t._id !== taskId) || [];
           // Re-calculate order for remaining tasks (optional but good practice for consistency)
           filteredTasks.forEach((task, index) => { task.order = index; });
          return { ...list, tasks: filteredTasks };
        }
        return list;
      });
      return { ...prevBoard, lists: newLists };
    });
  }, []);

  const handleListDeleted = useCallback((listId) => {
    setBoard(prevBoard => {
      if (!prevBoard || !prevBoard.lists) return prevBoard;
      const filteredLists = prevBoard.lists.filter(list => list._id !== listId);
      // Re-calculate order for remaining lists
      filteredLists.forEach((list, index) => { list.order = index; });
      return { ...prevBoard, lists: filteredLists.sort((a,b) => a.order - b.order) }; // Ensure sorted
    });
  }, []);

  const handleRepoConnected = useCallback((updatedBoardData) => {
    // Update just the githubRepo part of the state
    setBoard(prevBoard => {
        if (!prevBoard) return null;
        return {
            ...prevBoard,
            githubRepo: updatedBoardData.githubRepo // Assume API returns full board, extract repo info
        };
    });
    setShowGithubConnect(false); // Close the dialog
  }, []);


  // --- Render Logic ---
  if (loading) return <LoadingSpinner />;
  // Display general loading errors
  if (error && !board) return <Alert severity="error" sx={{ m: 3 }}>Error loading board: {error}</Alert>;
  // Handle case where board fetch succeeded but returned null/undefined (though API should ideally 404)
  if (!board) return <Typography sx={{ textAlign: 'center', mt: 5 }}>Board not found or data unavailable.</Typography>;

  return (
    <Box sx={{ px: {xs: 1, sm: 2}, py: 2, height: 'calc(100vh - 64px - 32px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}> {/* Adjust height based on Navbar/padding */}
      {/* Board Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0, px:1 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }} noWrap>
          {board.title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* GitHub Button/Status */}
          {!board.githubRepo?.connected ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<GitHubIcon />}
              onClick={() => setShowGithubConnect(true)}
              sx={{ textTransform: 'none', display: {xs: 'none', sm: 'inline-flex'} }} // Hide on extra small
            >
              Connect Repo
            </Button>
          ) : (
            <Button
                variant="outlined"
                size="small"
                startIcon={<CheckCircleIcon color="success"/>}
                disabled
                sx={{ textTransform: 'none', color: 'text.secondary', borderColor: 'action.disabledBackground', display: {xs: 'none', sm: 'inline-flex'} }}
             >
                {board.githubRepo.owner}/{board.githubRepo.name}
            </Button>
          )}
           {/* Add List Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateListForm(true)}
            sx={{ display: showCreateListForm ? 'none' : 'inline-flex', whiteSpace: 'nowrap' }} // Prevent wrap
          >
            Add List
          </Button>
        </Stack>
      </Box>

      {/* GitHub Connect Dialog (Modal) */}
      {showGithubConnect && (
        <GithubConnectForm
          boardId={boardId}
          onConnected={handleRepoConnected}
          onClose={() => setShowGithubConnect(false)}
        />
      )}

      {/* Alert for Move Errors */}
       {moveError && <Alert severity="error" sx={{ mb: 1, mx: 1 }} onClose={() => setMoveError(null)}>{moveError}</Alert>}


      {/* Drag and Drop Area */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="COLUMN">
          {(provided) => (
            <Stack
              direction="row"
              spacing={2}
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                 overflowX: 'auto', // Enable horizontal scroll
                 overflowY: 'hidden', // Prevent vertical scroll on the stack itself
                 flexGrow: 1,
                 alignItems: 'flex-start', // Align columns top
                 py: 1, // Padding top/bottom for scrollbar space etc.
                 px: 1, // Padding left/right
                  // Custom Scrollbar styling
                 '&::-webkit-scrollbar': { height: '8px' },
                 '&::-webkit-scrollbar-track': { bgcolor: 'action.hover' },
                 '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: '4px' }
                }}
            >
              {/* Render List Columns */}
              {board.lists && board.lists.map((list, index) => (
                <ListColumn
                  key={list._id}
                  list={list} // Pass the whole list object
                  index={index} // Pass index for DnD
                  // Pass handlers down
                  onTaskCreated={handleTaskCreated}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                  onListDeleted={handleListDeleted}
                />
              ))}
              {provided.placeholder} {/* Placeholder for react-beautiful-dnd */}

              {/* Add New List Section */}
              <Box sx={{ width: 288, flexShrink: 0, pt: '2px' }}> {/* Consistent width, slight top padding */}
                {showCreateListForm ? (
                   <CreateListForm
                     boardId={boardId}
                     onListCreated={handleListCreated}
                     onCancel={() => setShowCreateListForm(false)}
                   />
                 ) : (
                   <Button
                     fullWidth
                     onClick={() => setShowCreateListForm(true)}
                     sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        color: 'text.secondary',
                        justifyContent: 'flex-start',
                        p: 1.5,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' },
                        borderRadius: '8px' // Match list column radius
                     }}
                     startIcon={<AddIcon />}
                   >
                     Add another list
                   </Button>
                 )}
              </Box>
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
export default BoardPage;