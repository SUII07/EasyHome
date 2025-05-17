const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all messages for admin
router.get('/admin', verifyToken, isAdmin, messageController.getAdminMessages);

// Mark message as read
router.patch('/:messageId/read', verifyToken, isAdmin, messageController.markMessageAsRead);

// Respond to message
router.post('/:messageId/respond', verifyToken, isAdmin, messageController.respondToMessage);

module.exports = router; 