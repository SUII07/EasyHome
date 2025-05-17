import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    message_text: {
        type: String,
        required: true
    },
    response_text: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    responded_at: {
        type: Date,
        default: null
    },
    read: {
        type: Boolean,
        default: false
    }
});

const Message = mongoose.model('Message', messageSchema);

export default Message; 