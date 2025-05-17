import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminMessages.css';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get('/api/messages/admin');
            setMessages(response.data.messages);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to fetch messages' });
        }
    };

    const handleRespond = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/messages/${selectedMessage._id}/respond`, {
                response_text: response
            });
            setStatus({ type: 'success', message: 'Response sent successfully!' });
            setResponse('');
            setSelectedMessage(null);
            fetchMessages();
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send response' });
        }
    };

    return (
        <div className="admin-messages-container">
            <h2>Customer Messages</h2>
            
            {status.message && (
                <div className={`status-message ${status.type}`}>
                    {status.message}
                </div>
            )}

            <div className="messages-grid">
                <div className="messages-list">
                    {messages.map((message) => (
                        <div
                            key={message._id}
                            className={`message-item ${selectedMessage?._id === message._id ? 'selected' : ''}`}
                            onClick={() => setSelectedMessage(message)}
                        >
                            <div className="message-header">
                                <span className="user-name">{message.user_id.name}</span>
                                <span className="date">
                                    {new Date(message.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="message-preview">{message.message_text.substring(0, 100)}...</p>
                            {message.response_text && (
                                <div className="response-indicator">Responded</div>
                            )}
                        </div>
                    ))}
                </div>

                {selectedMessage && (
                    <div className="message-detail">
                        <div className="message-content">
                            <h3>Message from {selectedMessage.user_id.name}</h3>
                            <p className="date">
                                {new Date(selectedMessage.created_at).toLocaleDateString()}
                            </p>
                            <div className="message-text">{selectedMessage.message_text}</div>
                            
                            {selectedMessage.response_text && (
                                <div className="admin-response">
                                    <h4>Your Response</h4>
                                    <p>{selectedMessage.response_text}</p>
                                    <p className="response-date">
                                        Responded on: {new Date(selectedMessage.responded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {!selectedMessage.response_text && (
                                <form onSubmit={handleRespond} className="response-form">
                                    <textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Type your response..."
                                        required
                                    />
                                    <button type="submit">Send Response</button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages; 