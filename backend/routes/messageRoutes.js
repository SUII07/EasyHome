import express from 'express';
import messageController from '../controllers/messageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new message (authenticated users)
router.post('/', protect, messageController.createMessage);

// Get all messages (admin only)
router.get('/admin', protect, admin, messageController.getAllMessages);

// Get user's messages (authenticated users)
router.get('/user', protect, messageController.getUserMessages);

// Respond to a message (admin only)
router.post('/:messageId/respond', protect, admin, messageController.respondToMessage);

// Mark message as read (admin only)
router.patch('/:messageId/read', protect, admin, messageController.markMessageAsRead);

export default router; 