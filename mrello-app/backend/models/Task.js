// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: { // This status might be redundant if list represents status, but useful for other workflows
    type: String,
    enum: ['To Do', 'In Progress', 'Done', 'Archived'],
    default: 'To Do',
  },
  list: { // Reference to the List it belongs to
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'List',
  },
  board: { // Reference to the Board it belongs to (denormalized for easier querying)
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Board',
  },
  order: { // To maintain order within a list
    type: Number,
    required: true,
  },
  // Optional: Add assignee field if needed
  // assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  githubIssueId: { // Optional: For direct linking if needed, though we'll parse commits
    type: String,
    sparse: true, // Allows multiple nulls but unique if present
  }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;