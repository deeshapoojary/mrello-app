// frontend/src/components/list/ListColumn.jsx
import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from '../task/TaskCard'; // Assuming TaskCard component exists and is correct
import CreateTaskForm from '../task/CreateTaskForm'; // Assuming CreateTaskForm component exists
import * as api from '../../api'; // Assuming API functions are set up

// MUI Imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit'; // For potential rename action

// --- ListColumn Component ---
function ListColumn({
  list,                   // The list object ({ _id, title, tasks: [...], order })
  index,                  // Index of the list within the board.lists array (for list DnD)
  onTaskCreated,          // Function to call when a new task is created in this list
  onTaskUpdated,          // Function to call when a task within this list is updated
  onTaskDeleted,          // Function to call when a task within this list is deleted
  onListDeleted,          // Function to call when this entire list is deleted
  // Add onListRenamed prop if implementing renaming
}) {
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For list actions menu
  const openMenu = Boolean(anchorEl);

  // --- Menu Handlers ---
  const handleClickMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // --- List Action Handlers ---
  const handleDeleteList = async () => {
    handleCloseMenu(); // Close menu first
    if (window.confirm(`Are you sure you want to delete the list "${list.title}" and all its tasks? This cannot be undone.`)) {
      try {
        // Call the backend API to delete the list
        await api.deleteList(list._id);
        // Notify the parent component (BoardPage) to update the state
        onListDeleted(list._id);
      } catch (error) {
        console.error("Failed to delete list:", error);
        // Show user feedback (could use a Snackbar/Toast in BoardPage)
        alert(`Error deleting list: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Placeholder for future rename functionality
  const handleRenameList = () => {
    handleCloseMenu();
    // TODO: Implement list renaming logic
    // - Show an input field (maybe inline or in a modal)
    // - Call api.updateList(list._id, { title: newTitle })
    // - Call an onListUpdated prop passed from BoardPage
    alert('Rename functionality not yet implemented.');
  };


  // --- Task Action Handlers (Passed down from BoardPage) ---
  // These functions are just wrappers to ensure the correct arguments are passed
  // to the props received from BoardPage. BoardPage contains the actual state update logic.

  const handleCreateTask = (newTask) => {
    onTaskCreated(list._id, newTask);
     // Keep the form open for potentially adding more tasks quickly
     // setShowCreateTaskForm(false); // Uncomment this to close form after adding
  };

  const handleUpdateTask = (updatedTask) => {
    onTaskUpdated(updatedTask); // BoardPage needs to handle finding the task and updating state
  };

  const handleDeleteTask = (taskId) => {
     // Pass both taskId and listId up so BoardPage knows which list to update
    onTaskDeleted(taskId, list._id);
  };


  return (
    // Draggable container for the entire list column
    <Draggable draggableId={list._id} index={index}>
      {(provided, snapshot) => (
        // Use MUI Paper for the column background and styling
        <Paper
          elevation={snapshot.isDragging ? 4 : 1} // Increase shadow when dragging list
          {...provided.draggableProps} // Props for react-beautiful-dnd
          ref={provided.innerRef}      // Ref for react-beautiful-dnd
          sx={{
            width: 288, // Standard Kanban column width
            flexShrink: 0, // Prevent column from shrinking
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 64px - 48px - 40px)', // Adjust based on parent layout (Navbar height, BoardPage padding, Stack padding)
            bgcolor: 'grey.100', // Background color for the column
            borderRadius: '8px', // Rounded corners
            transition: 'box-shadow 0.2s ease-in-out',
            border: snapshot.isDragging ? '1px solid' : 'none',
            borderColor: snapshot.isDragging ? 'primary.main' : 'transparent',
          }}
        >
          {/* --- List Header --- */}
          <Box
            {...provided.dragHandleProps} // Make the header the drag handle for the list
            sx={{
              p: '10px 12px', // Padding
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'grab', // Indicate draggable
              borderBottom: '1px solid',
              borderColor: 'grey.300',
              bgcolor: 'grey.200', // Slightly different background for header
              borderTopLeftRadius: '8px', // Match paper radius
              borderTopRightRadius: '8px'
            }}
          >
            {/* List Title */}
            <Typography
                variant="subtitle1"
                sx={{ fontWeight: 'medium', flexGrow: 1, mr: 1 }}
                noWrap // Prevent long titles from wrapping
                title={list.title} // Show full title on hover
            >
              {list.title}
            </Typography>

            {/* List Actions Menu Button */}
            <IconButton
              size="small"
              onClick={handleClickMenu}
              aria-controls={openMenu ? 'list-actions-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openMenu ? 'true' : undefined}
              aria-label={`Actions for list ${list.title}`}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>

            {/* List Actions Menu */}
            <Menu
              id="list-actions-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              MenuListProps={{ 'aria-labelledby': 'list-actions-button' }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleRenameList}>
                <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Rename List
              </MenuItem>
              <MenuItem onClick={handleDeleteList} sx={{ color: 'error.main' }}>
                <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete List
              </MenuItem>
            </Menu>
          </Box>

          {/* --- Task Area (Droppable) --- */}
          {/* This is where TaskCards can be dropped */}
          <Droppable
            droppableId={list._id} // ID must match the list's _id
            type="TASK"             // Type must match the Draggable type (TaskCard)
          >
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}      // Ref for react-beautiful-dnd
                {...provided.droppableProps} // Props for react-beautiful-dnd
                sx={{
                  p: 1, // Padding around tasks
                  flexGrow: 1, // Allow this area to grow and fill space
                  overflowY: 'auto', // Enable vertical scroll if tasks exceed height
                  transition: 'background-color 0.2s ease',
                  // Change background color when dragging over this list
                  bgcolor: snapshot.isDraggingOver ? 'primary.light' : 'grey.100',
                   minHeight: '60px', // Ensure drop area is always present even if empty
                   // Custom scrollbar styling (optional, for aesthetics)
                   '&::-webkit-scrollbar': { width: '6px' },
                   '&::-webkit-scrollbar-track': { bgcolor: 'grey.200' },
                   '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: '3px' }
                }}
              >
                {/* Render Task Cards */}
                {/* Ensure list.tasks exists and is an array before mapping */}
                {list.tasks && list.tasks.map((task, taskIndex) => (
                  <TaskCard
                    key={task._id} // Unique key for each task
                    task={task}     // Pass the task data to the card
                    index={taskIndex} // Pass the task's index within the list for DnD
                    // Pass down handlers received from BoardPage
                    onTaskUpdated={handleUpdateTask}
                    // Wrap deleteTask to pass the specific taskId
                    onTaskDeleted={() => handleDeleteTask(task._id)}
                  />
                ))}
                {provided.placeholder} {/* Placeholder required by react-beautiful-dnd */}
              </Box>
            )}
          </Droppable>

          {/* --- Add Task Footer --- */}
          <Box sx={{ p: 1, mt: 'auto', borderTop: '1px solid', borderColor: 'grey.300' }}>
            {showCreateTaskForm ? (
              // Render the form to create a new task
              <CreateTaskForm
                listId={list._id} // Pass the current list ID
                onTaskCreated={handleCreateTask} // Handler from BoardPage (via this component)
                onCancel={() => setShowCreateTaskForm(false)} // Handler to close the form
              />
            ) : (
              // Render the button to show the create task form
              <Button
                fullWidth
                onClick={() => setShowCreateTaskForm(true)}
                startIcon={<AddIcon />}
                sx={{
                   justifyContent: 'flex-start', // Align text left
                   color: 'text.secondary',
                   textTransform: 'none', // Prevent uppercase text
                   '&:hover': { bgcolor: 'action.hover' } // Subtle hover background
                }}
              >
                Add a card
              </Button>
            )}
          </Box>
        </Paper>
      )}
    </Draggable>
  );
}

export default ListColumn;