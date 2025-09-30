import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [nameError, setNameError] = useState('');
  const navigate = useNavigate();

  const validateName = (name) => {
    if (!name.trim()) {
      setNameError('Please enter your name');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (name.trim().length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const createRoom = async () => {
    if (!validateName(userName)) {
      return;
    }

    try{
      const API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

      const response = await fetch(`${API_URL}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: userName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        const errorMessages = data.errors.map(e => e.msg).join('\n');
        alert(`Validation error:\n${errorMessages}`);
        return;
      }

      sessionStorage.setItem('userName', userName);
      sessionStorage.setItem('isHost', 'true');
      navigate(`/room/${data.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert(`Failed to create room: ${error.message}`);
    }
  };

  const joinRoom = async () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      alert('Please enter room ID');
      return;
    }

    try {
      // Validate that the room exists before joining
      const API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/room/${roomId.trim()}`);

      if (!response.ok) {
        if (response.status === 404) {
          alert('Room not found. Please check the room ID and try again.');
        } else {
          alert('Error validating room. Please try again.');
        }
        return;
      }

      const roomData = await response.json();

      sessionStorage.setItem('userName', userName);
      sessionStorage.setItem('isHost', 'false');
      navigate(`/room/${roomId.trim()}`);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please check your connection and try again.');
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Sangam</h1>
        <p className="subtitle">High-quality video conferencing for everyone</p>

        <div className="form-group">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              if (e.target.value) validateName(e.target.value);
            }}
            onBlur={() => validateName(userName)}
            className={`input-field ${nameError ? 'error' : ''}`}
          />
          {nameError && <div className="error-message">{nameError}</div>}
        </div>

        <div className="action-section">
          <h3>Create a new meeting</h3>
          <button onClick={createRoom} className="btn btn-primary">
            Create Meeting
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="action-section">
          <h3>Join an existing meeting</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={joinRoom} className="btn btn-secondary">
            Join Meeting
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;