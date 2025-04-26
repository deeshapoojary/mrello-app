// backend/controllers/taskController.js
const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board'); // Needed for auth checks

// @desc    Create a new task within a list
// @route   POST /api/lists/:listId/tasks
// @access  Private (Board members)
const createTask = asyncHandler(async (req, res) => {
    const { title, description, dueDate, priority } = req.body;
    const listId = req.params.listId;

    if (!title) {
        res.status(400); throw new Error('Task title is required');
    }

    const list = await List.findById(listId).populate('board'); // Populate board for auth check
    if (!list) {
        res.status(404); throw new Error('List not found');
    }

    const board = list.board;
    if (!board) {
        res.status(404); throw new Error('Associated board not found');
    }

    // Authorization Check: User must be a member of the board
    const isMember = board.members.some(memberId => memberId.equals(req.user.id));
    if (!isMember && !board.owner.equals(req.user.id)) {
        res.status(403); throw new Error('User not authorized to add tasks to this list');
    }

    // Determine order (append to end of list)
    const taskCount = await Task.countDocuments({ list: listId });

    const task = await Task.create({
        title,
        description: description || '',
        dueDate: dueDate || null,
        priority: priority || 'Medium',
        status: 'To Do', // Initial status
        list: listId,
        board: board._id,
        order: taskCount,
    });

    // Add task reference to the list
    list.tasks.push(task._id);
    await list.save();

    res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:taskId
// @access  Private (Board members)
const updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.taskId;
    const updates = req.body; // { title, description, dueDate, priority, status, order, listId }

    const task = await Task.findById(taskId).populate({ // Populate board for auth check
        path: 'board',
        select: 'owner members' // Only select necessary fields
    });

    if (!task) {
        res.status(404); throw new Error('Task not found');
    }

    const board = task.board;
    if (!board) {
        res.status(404); throw new Error('Associated board not found');
    }

    // Authorization Check
    const isMember = board.members.some(memberId => memberId.equals(req.user.id));
     if (!isMember && !board.owner.equals(req.user.id)) {
        res.status(403); throw new Error('User not authorized to modify this task');
    }

    // Handle potential list change
    if (updates.listId && updates.listId !== task.list.toString()) {
        const oldListId = task.list;
        const newListId = updates.listId;

        // Verify the new list exists and belongs to the same board
        const newList = await List.findById(newListId);
        if (!newList || !newList.board.equals(board._id)) {
            res.status(400); throw new Error('Invalid target list');
        }

        // Atomically update task and list references (using transactions is more robust)
        // Simple approach:
        await List.findByIdAndUpdate(oldListId, { $pull: { tasks: taskId } });
        await List.findByIdAndUpdate(newListId, { $push: { tasks: taskId } });

        task.list = newListId; // Update task's list reference

        // Note: Order needs careful handling during moves. The frontend should send the new order.
    }

    // Update other fields
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.dueDate !== undefined) task.dueDate = updates.dueDate; // Allow null
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.order !== undefined) task.order = updates.order; // Frontend must calculate correct order

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
});


// @desc    Move a task between lists (and potentially reorder)
// @route   PUT /api/tasks/:taskId/move
// @access  Private (Board Members)
const moveTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { targetListId, sourceListId, sourceIndex, destinationIndex } = req.body;

    if (!targetListId || !sourceListId || sourceIndex === undefined || destinationIndex === undefined) {
        res.status(400);
        throw new Error('Missing required fields for moving task (targetListId, sourceListId, sourceIndex, destinationIndex)');
    }

    const task = await Task.findById(taskId).populate('board', 'owner members'); // Need board for auth
    if (!task) {
        res.status(404); throw new Error('Task not found');
    }

    // --- Authorization Check ---
     const board = task.board;
     if (!board) {
         res.status(500); throw new Error('Task is not associated with a board');
     }
     const isMember = board.members.some(memberId => memberId.equals(req.user.id));
     if (!isMember && !board.owner.equals(req.user.id)) {
         res.status(403); throw new Error('User not authorized to move this task');
     }
     // --- End Authorization Check ---


    const sourceList = await List.findById(sourceListId);
    const targetList = await List.findById(targetListId);

    if (!sourceList || !targetList) {
        res.status(404); throw new Error('Source or target list not found');
    }

    // Ensure lists belong to the same board
    if (!sourceList.board.equals(targetList.board) || !sourceList.board.equals(task.board._id)) {
         res.status(400); throw new Error('Cannot move tasks between different boards');
    }

    // --- Update Logic ---
    // 1. Remove task ID from source list's tasks array
    sourceList.tasks.splice(sourceIndex, 1);

    // 2. Add task ID to target list's tasks array at the destination index
    targetList.tasks.splice(destinationIndex, 0, taskId);

    // 3. Update the task's list reference and potentially order property
    task.list = targetListId;
    // The `order` property on the Task itself might need adjustment based on how you query/sort.
    // Often, the order *within the list's tasks array* is sufficient.
    // If you rely heavily on task.order, you need to update orders for affected tasks.
    // For simplicity here, we rely on the list's task array order. Frontend uses this array.

    // 4. Update the order property for all tasks in both affected lists
    // This ensures consistency if you rely on the 'order' field on Task model
    const updateTaskOrders = async (list, listId) => {
        const updates = list.tasks.map((tid, index) => ({
            updateOne: {
                filter: { _id: tid, list: listId }, // Ensure we only update tasks still in this list
                update: { $set: { order: index } },
            },
        }));
        if (updates.length > 0) {
            await Task.bulkWrite(updates);
        }
    };


    // Save changes (consider transactions for atomicity)
    try {
        await sourceList.save();
        // Only save target list if it's different from source
        if (sourceListId !== targetListId) {
            await targetList.save();
        }
        await task.save(); // Save the updated list reference on the task

        // Re-calculate and update 'order' field on tasks in both lists
        await updateTaskOrders(sourceList, sourceListId);
        if (sourceListId !== targetListId) {
             await updateTaskOrders(targetList, targetListId);
        }


        // Return the updated board data (or just success)
        // Fetching the whole board again ensures frontend has latest state
        const updatedBoard = await Board.findById(board._id)
            .populate({ path: 'lists', options: { sort: { order: 1 } }, populate: { path: 'tasks', options: { sort: { order: 1 } } } })
            .populate('owner members', 'name email');

        res.status(200).json(updatedBoard);

    } catch (error) {
        console.error("Error moving task:", error);
        // If using transactions, you'd abort here
        res.status(500); throw new Error('Failed to move task');
    }
});



// @desc    Delete a task
// @route   DELETE /api/tasks/:taskId
// @access  Private (Board members)
const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId).populate('board', 'owner members'); // Need board for auth

    if (!task) {
        res.status(404); throw new Error('Task not found');
    }

    const board = task.board;
     if (!board) {
        res.status(500); throw new Error('Task is not associated with a board'); // Data integrity issue
     }

    // Authorization Check
    const isMember = board.members.some(memberId => memberId.equals(req.user.id));
    if (!isMember && !board.owner.equals(req.user.id)) {
        res.status(403); throw new Error('User not authorized to delete this task');
    }

    const listId = task.list;

    // Remove task reference from its list
    await List.findByIdAndUpdate(listId, { $pull: { tasks: taskId } });

    // Delete the task
    await task.deleteOne();

    res.status(200).json({ id: taskId, message: 'Task deleted successfully' });
});

module.exports = {
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    // Get task by ID might be useful, but often tasks are fetched with the board/list
};