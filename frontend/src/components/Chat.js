import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, roomId, userName, participants, isHost, localSocketId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [recipient, setRecipient] = useState('everyone'); // 'everyone', 'host', or socketId
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleChatMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };

    const handlePrivateMessage = (data) => {
      setMessages(prev => [...prev, { ...data, isPrivate: true }]);
    };

    socket.on('chat-message', handleChatMessage);
    socket.on('private-message', handlePrivateMessage);

    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('private-message', handlePrivateMessage);
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      if (recipient === 'everyone') {
        // Broadcast to everyone
        socket.emit('chat-message', {
          roomId,
          message: inputMessage,
          userName
        });
      } else {
        // Send private message
        const recipientData = recipient === 'host'
          ? participants.find(p => p.isHost)
          : participants.find(p => p.socketId === recipient);

        if (recipientData) {
          socket.emit('private-message', {
            roomId,
            to: recipientData.socketId,
            message: inputMessage,
            userName,
            recipientName: recipientData.userName
          });

          // Add to own messages list immediately
          setMessages(prev => [...prev, {
            userName,
            message: inputMessage,
            timestamp: Date.now(),
            isPrivate: true,
            recipientName: recipientData.userName
          }]);
        }
      }
      setInputMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get recipient name for display
  const getRecipientName = () => {
    if (recipient === 'everyone') return 'Everyone';
    if (recipient === 'host') return 'Host';
    const p = participants.find(p => p.socketId === recipient);
    return p ? p.userName : 'Unknown';
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="chat-recipient-select"
          title="Send to"
        >
          <option value="everyone">Everyone</option>
          {!isHost && (
            <option value="host">Host Only</option>
          )}
          {participants.filter(p => p.socketId !== localSocketId).map(p => (
            <option key={p.socketId} value={p.socketId}>
              {p.userName} (Private)
            </option>
          ))}
        </select>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.isPrivate ? 'private-message' : ''}`}>
            <div className="message-header">
              <span className="message-user">{msg.userName}</span>
              {msg.isPrivate && (
                <span className="private-badge">
                  Private {msg.recipientName ? `to ${msg.recipientName}` : ''}
                </span>
              )}
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message to ${getRecipientName()}...`}
          className="chat-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default Chat;