// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const boardRoutes = require('./routes/boardRoutes');
const listRoutes = require('./routes/listRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const webhookRoutes = require('./routes/webhookRoutes'); // Import webhook routes
const { protect } = require('./middleware/authMiddleware'); // If needed for other routes

dotenv.config(); // Load .env variables

connectDB(); // Connect to MongoDB

const app = express();

// CORS Middleware - Configure appropriately for your frontend URL in production
app.use(cors()); // Allows all origins for now

// Middleware to get raw body for webhook verification
// IMPORTANT: This needs to be BEFORE express.json() for routes that need the raw body
app.use('/api/webhooks/github', express.raw({ type: 'application/json' })); // Apply raw parser ONLY to webhook route

// Body Parsing Middleware (for other routes)
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: false })); // Parses URL-encoded data


// --- API Routes ---
app.use('/api/users', authRoutes);
app.use('/api/boards', boardRoutes); // Note: boardRoutes already applies 'protect' internally

// Mount list routes under boards (access boardId via req.params.boardId)
// We don't apply 'protect' here again, it's handled inside listRoutes/Controller using board membership
app.use('/api/boards/:boardId/lists', listRoutes);

// Mount task routes under lists (access listId via req.params.listId)
// We don't apply 'protect' here again, it's handled inside taskRoutes/Controller using board membership
app.use('/api/lists/:listId/tasks', taskRoutes);

// Mount task routes directly for updates/deletes using taskId
// protect is applied inside taskRoutes
app.use('/api/tasks', taskRoutes);

// Mount webhook routes (NO JWT protection needed here)
app.use('/api/webhooks', webhookRoutes);

// --- Basic Error Handling Middleware ---
// (Add a more robust error handler later)
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Provide stack trace only in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));