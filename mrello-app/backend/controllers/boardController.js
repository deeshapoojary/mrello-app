// backend/controllers/boardController.js
const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');

// @desc    Get all boards for the logged-in user
// @route   GET /api/boards
// @access  Private
const getBoards = asyncHandler(async (req, res) => {
  // Find boards where the user is the owner OR a member
  const boards = await Board.find({
    $or: [{ owner: req.user.id }, { members: req.user.id }]
  }).populate('owner', 'name email').populate('members', 'name email'); // Populate owner and members info

  res.status(200).json(boards);
});

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Please add a title');
  }

  const board = await Board.create({
    title,
    owner: req.user.id,
    members: [req.user.id], // Initially, only the owner is a member
  });

  // Optionally create default lists (e.g., To Do, In Progress, Done)
  const defaultLists = ['To Do', 'In Progress', 'Done'];
  const createdLists = [];
  for (let i = 0; i < defaultLists.length; i++) {
      const list = await List.create({
          title: defaultLists[i],
          board: board._id,
          order: i
      });
      createdLists.push(list._id);
  }
  board.lists = createdLists;
  await board.save();

  // Populate owner before sending response
  const populatedBoard = await Board.findById(board._id).populate('owner', 'name email').populate('members', 'name email');

  res.status(201).json(populatedBoard);
});

// @desc    Get a single board by ID with its lists and tasks
// @route   GET /api/boards/:id
// @access  Private
const getBoardById = asyncHandler(async (req, res) => {
    const board = await Board.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .populate({
            path: 'lists', // Populate the lists array in the board
            model: 'List',
            options: { sort: { order: 1 } }, // Sort lists by order
            populate: {
                path: 'tasks', // Populate the tasks array in each list
                model: 'Task',
                 options: { sort: { order: 1 } } // Sort tasks by order
            }
        });

    if (!board) {
        res.status(404);
        throw new Error('Board not found');
    }

    // Check if user has access (is owner or member)
    const isMember = board.members.some(member => member._id.equals(req.user.id));
    const isOwner = board.owner._id.equals(req.user.id); // Ensure comparison with _id

    if (!isOwner && !isMember) {
        res.status(403); // Forbidden
        throw new Error('User not authorized to access this board');
    }

    res.status(200).json(board);
});


// @desc    Update a board
// @route   PUT /api/boards/:id
// @access  Private (Only owner should update certain fields like title)
const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Check if user is the owner
  if (board.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to update this board');
  }

  // Only allow updating title for now (add members logic separately if needed)
  const updatedBoard = await Board.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title }, // Only update title from body
    { new: true } // Return the updated document
  ).populate('owner', 'name email').populate('members', 'name email');

  res.status(200).json(updatedBoard);
});

// @desc    Delete a board
// @route   DELETE /api/boards/:id
// @access  Private (Only owner)
const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  // Check if user is the owner
  if (board.owner.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized to delete this board');
  }

  // Clean up: Delete associated lists and tasks first (important!)
  await Task.deleteMany({ board: board._id });
  await List.deleteMany({ board: board._id });
  await board.deleteOne(); // Use deleteOne() on the document

  res.status(200).json({ id: req.params.id, message: 'Board deleted successfully' });
});

// @desc    Connect GitHub Repository
// @route   POST /api/boards/:id/connect-repo
// @access  Private (Board Owner)
const connectRepo = asyncHandler(async (req, res) => {
    const { owner, name } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
        res.status(404); throw new Error('Board not found');
    }
    if (board.owner.toString() !== req.user.id) {
        res.status(403); throw new Error('Only the board owner can connect a repository');
    }
    if (!owner || !name) {
        res.status(400); throw new Error('Repository owner and name are required');
    }

    // TODO: Add logic here to actually set up a webhook on GitHub using their API
    // This is complex and requires GitHub API authentication (OAuth or Personal Access Token)
    // For now, we just store the details and assume webhook is set up manually.
    // You would typically make a POST request to:
    // https://api.github.com/repos/{owner}/{repo}/hooks
    // with appropriate headers and payload (config.url, config.secret, events: ['push'])

    board.githubRepo = {
        owner,
        name,
        connected: true,
        // webhookId: id_received_from_github_api, // Store the ID from GitHub response
    };
    await board.save();

    // Re-populate necessary fields before sending back
    const updatedBoard = await Board.findById(req.params.id)
                                    .populate('owner', 'name email')
                                    .populate('members', 'name email')
                                    .populate({ path: 'lists', populate: { path: 'tasks' } });

    res.status(200).json(updatedBoard);
});


module.exports = {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  connectRepo, // Export the new function
};