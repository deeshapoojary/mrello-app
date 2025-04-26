// frontend/src/components/board/BoardCard.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea'; // Makes whole card clickable
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip'; // For hover text
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function BoardCard({ board, onDelete }) {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete board "${board.title}"?`)) {
      onDelete(board._id);
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CardActionArea component={RouterLink} to={`/board/${board._id}`} sx={{ flexGrow: 1 }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap title={board.title}>
            {board.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Owner: {board.owner?.name || 'N/A'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
             <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: 'action.active' }}/>
            <Typography variant="body2" color="text.secondary">
              {board.members?.length || 1} Member(s)
            </Typography>
          </Box>
          {board.githubRepo?.connected && (
             <Tooltip title={`Repo: ${board.githubRepo.owner}/${board.githubRepo.name}`} placement="top">
                 <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'success.main' }}>
                     <GitHubIcon fontSize="small" sx={{ mr: 0.5 }}/>
                     <Typography variant="caption" noWrap sx={{ maxWidth: '80%' }}> {/* Prevent long names pushing delete */}
                         {board.githubRepo.owner}/{board.githubRepo.name}
                     </Typography>
                     <CheckCircleIcon fontSize="inherit" sx={{ ml: 0.5 }}/>
                 </Box>
             </Tooltip>
          )}
        </CardContent>
      </CardActionArea>
      {/* Delete button positioned absolutely if owner */}
      {onDelete && (
         <Tooltip title="Delete Board">
            <IconButton
                aria-label="delete board"
                onClick={handleDelete}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'action.active',
                  '&:hover': { color: 'error.main', bgcolor: 'action.hover' }
                }}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
         </Tooltip>
      )}
    </Card>
  );
}

export default BoardCard;