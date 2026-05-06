import React, { useState, useEffect, useRef } from 'react';
import './ChatModal.css';

const ChatModal = ({ isOpen, onClose, contractId, currentUserId, chatTitle }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && contractId) {
      fetchMessages();
      // Optional: Set up polling to check for new messages every few seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, contractId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${contractId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${contractId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h2>{chatTitle || 'Chat'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="chat-messages">
          {loading && messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>No messages yet. Say hi!</p>
          ) : (
            messages.map((msg) => {
              const isSentByMe = msg.senderId?._id === currentUserId || msg.senderId === currentUserId;
              return (
                <div 
                  key={msg._id} 
                  className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}
                >
                  {!isSentByMe && (
                    <div className="message-sender">{msg.senderId?.name}</div>
                  )}
                  <p className="message-text">{msg.text}</p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" disabled={!newMessage.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
