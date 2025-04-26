// backend/routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const { handleGitHubWebhook } = require('../controllers/webhookController');

// This route should NOT be protected by JWT auth as it's called by GitHub
router.post('/github', handleGitHubWebhook);

module.exports = router;