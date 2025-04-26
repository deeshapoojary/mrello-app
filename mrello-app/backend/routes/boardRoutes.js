// backend/routes/boardRoutes.js
const express = require('express');
const router = express.Router();
const {
    getBoards,
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    connectRepo, // Import connectRepo
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

// All board routes are protected
router.use(protect);

router.route('/')
    .get(getBoards)
    .post(createBoard);

router.route('/:id')
    .get(getBoardById)
    .put(updateBoard) // Consider more granular permissions later
    .delete(deleteBoard); // Only owner should delete

// Route for connecting GitHub repo
router.post('/:id/connect-repo', connectRepo);

module.exports = router;