// backend/models/List.js
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  board: { // Reference to the Board it belongs to
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Board',
  },
  tasks: [{ // Array of Task IDs belonging to this list
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  order: { // To maintain order of lists within a board
    type: Number,
    required: true,
  },
}, { timestamps: true });

const List = mongoose.model('List', listSchema);
module.exports = List;