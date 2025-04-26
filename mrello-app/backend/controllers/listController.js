// backend/controllers/listController.js
const asyncHandler = require('express-async-handler');
const List = require('../models/List');
const Board = require('../models/Board');
const Task = require('../models/Task');

// @desc    Create a new list within a board
// @route   POST /api/boards/:boardId/lists
// @access  Private (Board members)
const createList = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const boardId = req.params.boardId;

  if (!title) {
    res.status(400); throw new Error('List title is required');
  }

  const board = await Board.findById(boardId);
  if (!board) {
    res.status(404); throw new Error('Board not found');
  }

  // Check if user is a member of the board
  const isMember = board.members.some(memberId => memberId.equals(req.user.id));
   if (!isMember && !board.owner.equals(req.user.id)) {
     res.status(403); throw new Error('User not authorized to add lists to this board');
   }

   // Determine the order for the new list (append to the end)
   const listCount = await List.countDocuments({ board: boardId });

  const list = await List.create({
    title,
    board: boardId,
    order: listCount, // Simple append order
  });

  // Add list reference to the board
  board.lists.push(list._id);
  await board.save();

  res.status(201).json(list);
});

// @desc    Update a list's title or order
// @route   PUT /api/lists/:listId
// @access  Private (Board members)
const updateList = asyncHandler(async (req, res) => {
    const { title, order } = req.body; // Allow updating title or order
    const list = await List.findById(req.params.listId).populate('board'); // Populate board to check membership

    if (!list) {
        res.status(404); throw new Error('List not found');
    }

    const board = list.board;
    if (!board) {
        res.status(404); throw new Error('Associated board not found'); // Should not happen normally
    }

    // Authorization check
    const isMember = board.members.some(memberId => memberId.equals(req.user.id));
    if (!isMember && !board.owner.equals(req.user.id)) {
        res.status(403); throw new Error('User not authorized to modify this list');
    }

    // Update fields if provided
    if (title !== undefined) list.title = title;
    if (order !== undefined) list.order = order; // Note: Frontend needs to handle reordering logic carefully

    const updatedList = await list.save();
    res.status(200).json(updatedList);
});

// @desc    Delete a list
// @route   DELETE /api/lists/:listId
// @access  Private (Board members)
const deleteList = asyncHandler(async (req, res) => {
    const list = await List.findById(req.params.listId).populate('board');

    if (!list) {
        res.status(404); throw new Error('List not found');
    }

    const board = list.board;
    if (!board) {
         res.status(404); throw new Error('Associated board not found');
    }

    // Authorization check
    const isMember = board.members.some(memberId => memberId.equals(req.user.id));
    if (!isMember && !board.owner.equals(req.user.id)) {
        res.status(403); throw new Error('User not authorized to delete this list');
    }

    const listId = list._id;
    const boardId = board._id;

    // 1. Delete all tasks within the list
    await Task.deleteMany({ list: listId });

    // 2. Remove the list reference from the board
    await Board.findByIdAndUpdate(boardId, { $pull: { lists: listId } });

    // 3. Delete the list itself
    await list.deleteOne();

    res.status(200).json({ id: listId, message: 'List and its tasks deleted successfully' });
});

module.exports = {
  createList,
  updateList,
  deleteList,
  // We don't need getLists separately as they are fetched with the board
};