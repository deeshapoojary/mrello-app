// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams needed if mounted under lists
const {
    createTask,
    updateTask,
    moveTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all task routes

// POST /api/lists/:listId/tasks (Handled by linking in server.js)
router.post('/', createTask);

// Routes operating on a specific task ID
// PUT /api/tasks/:taskId
// DELETE /api/tasks/:taskId
router.route('/:taskId')
    .put(updateTask)
    .delete(deleteTask);

// Route for moving tasks
// PUT /api/tasks/:taskId/move
router.put('/:taskId/move', moveTask);

module.exports = router;