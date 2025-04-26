// frontend/src/components/task/TaskCard.jsx
import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip'; // For priority
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TaskDetailsModal from './TaskDetailsModal'; // Assuming this is now a Dialog

// Keep helper functions: formatDate, getPriorityColor (adjust colors if needed)
const formatDate = (dateString) => { /* ... */ };
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'error'; // MUI color prop
    case 'Medium': return 'warning';
    case 'Low': return 'success';
    default: return 'default';
  }
};

function TaskCard({ task, index, onTaskUpdated, onTaskDeleted }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (e) => {
     // Allow clicking button without opening modal twice
     // if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'svg' && e.target.tagName !== 'path') {
          setIsModalOpen(true);
     // }
  };

  const handleOpenModalFromButton = (e) => {
     e.stopPropagation(); // Prevent card's onClick
     setIsModalOpen(true);
  }

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            sx={{
              mb: 1, // Margin bottom between cards
              cursor: 'pointer',
              transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              border: '1px solid transparent',
              '&:hover': { boxShadow: 3, borderColor: 'action.selected' }, // Shadow on hover
              ...(snapshot.isDragging && { boxShadow: 6, bgcolor: 'action.selected' }), // Styles when dragging
            }}
            style={provided.draggableProps.style} // Required by react-beautiful-dnd
            onClick={handleOpenModal} // Open modal on click
          >
            <CardContent sx={{ p: '10px 12px', '&:last-child': { pb: '10px' } }}> {/* Reduced padding */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, wordBreak: 'break-word', mr: 1 }}>
                    {task.title}
                 </Typography>
                 {/* Edit button subtle */}
                 <IconButton size="small" sx={{ p: 0.2, mt: '-4px', mr: '-4px' }} onClick={handleOpenModalFromButton} aria-label="edit task">
                     <EditIcon sx={{ fontSize: '1rem', color: 'action.active' }} />
                 </IconButton>
              </Box>

              {/* Optional: Description Snippet */}
              {/* {task.description && ( <Typography variant="caption" color="text.secondary" display="block" noWrap>{task.description}</Typography> )} */}

              {/* Due Date & Priority */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: task.dueDate || task.priority ? 1 : 0 }}>
                {task.dueDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }} title={`Due: ${formatDate(task.dueDate)}`}>
                    <CalendarTodayIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{formatDate(task.dueDate)}</Typography>
                  </Box>
                )}
                {task.priority && (
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                    sx={{ height: '18px', fontSize: '0.65rem', fontWeight: 'medium' }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Draggable>

      {/* Task Details Modal/Dialog */}
      {isModalOpen && (
        <TaskDetailsModal
          task={task}
          open={isModalOpen} // Pass open state
          onClose={() => setIsModalOpen(false)}
          onTaskUpdate={(updatedTaskData) => {
            onTaskUpdated(updatedTaskData);
            // Optionally close modal here or let the parent handle it
            // setIsModalOpen(false);
          }}
          onTaskDeleted={onTaskDeleted} // Pass delete handler
        />
      )}
    </>
  );
}

export default TaskCard;