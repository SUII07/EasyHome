import Message from '../models/Message.js';
import CustomerModel from '../models/Customer.js';
import ServiceProviderModel from '../models/ServiceProvider.js';
import AdminModel from '../models/admin.js';

// Create a new message
const createMessage = async (req, res) => {
    try {
        const { message_text } = req.body;
        const message = new Message({
            user_id: req.user._id,
            message_text,
            created_at: Date.now()
        });
        await message.save();
        res.status(201).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all messages (for admin)
const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ created_at: -1 }).lean();

        // For each message, find the user in all collections
        const messagesWithUser = await Promise.all(messages.map(async (msg) => {
            let user = await CustomerModel.findById(msg.user_id).select('FullName Email');
            if (!user) user = await ServiceProviderModel.findById(msg.user_id).select('fullName email');
            if (!user) user = await AdminModel.findById(msg.user_id).select('FullName Email');
            // Normalize user fields for frontend
            let userInfo = null;
            if (user) {
                userInfo = {
                    FullName: user.FullName || user.fullName,
                    Email: user.Email || user.email,
                };
            }
            return {
                ...msg,
                user_id: userInfo,
            };
        }));

        res.status(200).json({ success: true, messages: messagesWithUser });
    } catch (error) {
        console.error('Error in getAllMessages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get user's messages
const getUserMessages = async (req, res) => {
    try {
        let messages;
        if (req.user.role === 'admin') {
            messages = await Message.find().sort({ created_at: -1 });
        } else {
            messages = await Message.find({ user_id: req.user._id }).sort({ created_at: -1 });
        }
        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Respond to a message (admin only)
const respondToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { response_text } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        message.response_text = response_text;
        message.responded_at = Date.now();
        message.read = true;
        await message.save();

        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        message.read = true;
        await message.save();

        res.status(200).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export default {
    createMessage,
    getAllMessages,
    getUserMessages,
    respondToMessage,
    markMessageAsRead
}; 