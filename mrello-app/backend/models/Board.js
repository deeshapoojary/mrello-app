// backend/models/Board.js
const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { // User who created the board
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  members: [{ // Users who have access to the board
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  lists: [{ // Array of List IDs belonging to this board
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
  }],
  githubRepo: { // Store connected GitHub repo details
    owner: String,
    name: String,
    webhookId: String, // Store the ID if you need to manage webhooks via API later
    connected: { type: Boolean, default: false }
  }
}, { timestamps: true });

const Board = mongoose.model('Board', boardSchema);
module.exports = Board;