import React, { useState } from 'react';

const JoinPrompt = ({ roomId, onJoin }) => {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (userName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (userName.trim().length > 50) {
      setError('Name must be less than 50 characters');
      return;
    }

    onJoin(userName.trim());
  };

  return (
    <div className="join-prompt-overlay">
      <div className="join-prompt-container">
        <h2>Join Meeting</h2>
        <p className="join-prompt-subtitle">Meeting ID: <strong>{roomId}</strong></p>

        <form onSubmit={handleSubmit} className="join-prompt-form">
          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setError('');
              }}
              className={`input-field ${error ? 'error' : ''}`}
              placeholder="Enter your name"
              autoFocus
              maxLength={50}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <button type="submit" className="btn btn-primary">
            Join Meeting
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinPrompt;
