// backend/routes/listRoutes.js
const express = require('express');
// mergeParams: true allows accessing params from parent router (e.g., :boardId)
const router = express.Router({ mergeParams: true });
const { createList, updateList, deleteList } = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protect all list routes

// POST /api/boards/:boardId/lists (Handled by linking in server.js)
router.post('/', createList);

// These routes operate on a specific list ID
// PUT /api/lists/:listId
// DELETE /api/lists/:listId
router.route('/:listId')
    .put(updateList)
    .delete(deleteList);

module.exports = router;