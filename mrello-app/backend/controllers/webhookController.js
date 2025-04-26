// backend/controllers/webhookController.js
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Board = require('../models/Board');
const Task = require('../models/Task');
require('dotenv').config();

// Helper function to verify GitHub signature
const verifyGitHubSignature = (req) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
        console.warn('GITHUB_WEBHOOK_SECRET not set. Skipping verification.');
        return true;
    }

    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        console.error('Webhook Error: No X-Hub-Signature-256 found on request');
        return false;
    }

    // --- MODIFICATION START ---
    // Check for req.rawBody first, but fall back to req.body if needed
    // Assumes req.body contains the raw Buffer if express.raw ran alone
    const rawBody = req.rawBody || req.body;

    if (!rawBody || typeof rawBody.toString !== 'function') { // Check if we have something usable
        console.error('Webhook Error: Could not get raw request body (checked req.rawBody and req.body).');
        // Log headers to see content-type received by the server
        console.error('Request Headers:', JSON.stringify(req.headers, null, 2));
        return false; // Indicate failure
    }
    // --- MODIFICATION END ---


    // Use the determined rawBody for HMAC calculation
    const hash = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;

    try {
        // Ensure both buffers have the same length for timingSafeEqual
         const sigBuffer = Buffer.from(signature);
         const hashBuffer = Buffer.from(hash);
         if (sigBuffer.length !== hashBuffer.length) {
             console.error('Webhook Error: Signature length mismatch.');
             return false;
         }
        if (!crypto.timingSafeEqual(sigBuffer, hashBuffer)) {
            console.error('Webhook Error: Invalid signature.');
            return false;
        }
    } catch (error) {
         console.error('Webhook Error: Error during signature comparison:', error);
         return false;
    }


    return true;
};

const handleGitHubWebhook = asyncHandler(async (req, res) => {
    console.log('Received GitHub Webhook...');

    // --- Signature Verification ---
    // The verify function now handles checking req.rawBody/req.body
    if (!verifyGitHubSignature(req)) {
        // verifyGitHubSignature now logs the specific error
        return res.status(401).send('Unauthorized: Invalid Signature or Body Issue');
    }
    // --- End Signature Verification ---


    // --- Process Payload ---
    // If verification passed, assume req.body is now the parsed JSON object
    // because express.raw() doesn't parse, but if it fell back to req.body
    // and a later json parser ran (which shouldn't happen with correct middleware),
    // we might have an object. We NEED the parsed object here.
    // Let's parse explicitly if needed, assuming verifyGitHubSignature used the raw buffer.

    let payload;
    try {
         // Check if req.body is already parsed (object) or still a buffer/string
         if (Buffer.isBuffer(req.body) || typeof req.body === 'string') {
             payload = JSON.parse(req.body.toString());
         } else if (typeof req.body === 'object' && req.body !== null) {
             payload = req.body; // Assume already parsed
         } else {
             throw new Error("Request body is not in an expected format (Buffer, string, or object).");
         }
    } catch (e) {
        console.error('Webhook Error: Failed to parse JSON payload:', e);
        return res.status(400).send('Bad Request: Invalid JSON payload');
    }

    // ... (rest of your payload processing logic using the 'payload' variable) ...
    const event = req.headers['x-github-event'];

    if (event === 'ping') {
         console.log('GitHub Webhook Ping received. Payload:', payload);
         return res.status(200).send('Ping OK');
    }
    if (event === 'push') {
        // ... process payload.repository, payload.commits ...
    }

    // ... etc ...

    res.status(200).send('Webhook processed.'); // Adjust response as needed
});

module.exports = {
    handleGitHubWebhook,
};