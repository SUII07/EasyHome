import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserFeedback.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';

const UserFeedback = () => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!user || !token) {
            toast.error('Please login to view your feedback');
            navigate('/login');
            return;
        }
        fetchMessages();
    }, [navigate]);

    const fetchMessages = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            if (!user || !token) {
                toast.error('Please login to view your feedback');
                navigate('/login');
                return;
            }

            // Use the correct endpoint (no user ID in the URL)
            const response = await axios.get(`http://localhost:4000/api/messages/user`, {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data.messages)) {
                // Sort messages by date, newest first
                const sortedMessages = response.data.messages.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setMessages(sortedMessages);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            if (error.response?.status === 401) {
                // If unauthorized, redirect to login
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                toast.error('Session expired. Please login again');
                navigate('/login');
            } else if (error.response?.status === 404) {
                setStatus({ type: 'error', message: 'No messages found.' });
                setMessages([]);
            } else {
                setStatus({ type: 'error', message: 'Failed to fetch messages. Please try again later.' });
                setMessages([]);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="user-feedback-container">
                <h2>My Feedback History</h2>
                
                {status.message && (
                    <div className={`status-message ${status.type}`}>
                        {status.message}
                    </div>
                )}

                <div className="feedback-list">
                    {messages.length === 0 ? (
                        <p className="no-messages">You haven't sent any messages yet.</p>
                    ) : (
                        messages.map((message) => (
                            <div key={message._id} className="feedback-item">
                                <div className="feedback-header">
                                    <span className="date">
                                        Sent on: {new Date(message.created_at).toLocaleDateString()}
                                    </span>
                                    {message.response_text && (
                                        <span className="response-status">Responded</span>
                                    )}
                                </div>
                                
                                <div className="feedback-content">
                                    <h3>Your Message</h3>
                                    <p>{message.message_text}</p>
                                </div>

                                {message.response_text && (
                                    <div className="admin-response">
                                        <h3>Admin Response</h3>
                                        <p>{message.response_text}</p>
                                        <span className="response-date">
                                            Responded on: {new Date(message.responded_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserFeedback; 