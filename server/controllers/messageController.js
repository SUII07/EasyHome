const Message = require('../models/Message');
const User = require('../models/User');

// Get all messages for admin
exports.getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('user_id', 'FullName Email')
      .sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message
    });
  }
};

// Respond to message
exports.respondToMessage = async (req, res) => {
  try {
    const { response_text } = req.body;
    
    if (!response_text) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      {
        response_text,
        responded_at: Date.now(),
        read: true
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Response sent successfully'
    });
  } catch (error) {
    console.error('Error responding to message:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to message',
      error: error.message
    });
  }
}; 