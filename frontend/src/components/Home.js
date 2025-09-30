import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: userName, roomName })
      });

      const data = await response.json();
      sessionStorage.setItem('userName', userName);
      sessionStorage.setItem('isHost', 'true');
      navigate(`/room/${data.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  const joinRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      alert('Please enter room ID');
      return;
    }

    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('isHost', 'false');
    navigate(`/room/${roomId}`);
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
            onChange={(e) => setUserName(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="action-section">
          <h3>Create a new meeting</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Meeting name (optional)"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="input-field"
            />
          </div>
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