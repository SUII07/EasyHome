import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import "./Admin.css";
import { toast } from "react-hot-toast";

const AdminFeedback = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await axios.get(
        "http://localhost:4000/api/messages/admin",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setMessages(response.data.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      toast.error("Failed to fetch messages");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await axios.post(
        `http://localhost:4000/api/messages/${messageId}/respond`,
        { response_text: responseText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        toast.success("Response sent successfully");
        setResponseText("");
        setSelectedMessage(null);
        fetchMessages();
      }
    } catch (error) {
      toast.error("Failed to send response");
    }
  };

  return (
    <div className="admin-feedback-container">
      <h2>Contact Messages</h2>
      <p className="subtitle">Manage and respond to user inquiries</p>
      <div className="feedback-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>User</th>
              <th>Message</th>
              <th>Response</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="loading-cell">Loading...</td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">No messages found</td>
              </tr>
            ) : (
              messages.map((msg, idx) => (
                <tr key={msg._id}>
                  <td>{idx + 1}</td>
                  <td>{new Date(msg.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="user-info">
                      <FaUserCircle className="user-icon" />
                      <div>
                        <p className="user-name">{msg.user_id?.FullName || "Unknown"}</p>
                        <p className="user-email">{msg.user_id?.Email || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td>{msg.message_text}</td>
                  <td>{msg.response_text ? msg.response_text : <span className="pending-status">No response yet</span>}</td>
                  <td>
                    {msg.response_text ? (
                      <span className="responded-status">Responded</span>
                    ) : (
                      <button
                        className="respond-btn"
                        onClick={() => setSelectedMessage(msg)}
                      >
                        Respond
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedMessage && !selectedMessage.response_text && (
        <div className="response-modal">
          <div className="modal-content">
            <h3>Respond to {selectedMessage.user_id?.FullName || "User"}</h3>
            <p><strong>Message:</strong> {selectedMessage.message_text}</p>
            <textarea
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder="Type your response here..."
              rows={4}
            />
            <div className="modal-actions">
              <button
                className="send-response-button"
                onClick={() => handleRespond(selectedMessage._id)}
                disabled={!responseText.trim()}
              >
                Send Response
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setSelectedMessage(null);
                  setResponseText("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback; 