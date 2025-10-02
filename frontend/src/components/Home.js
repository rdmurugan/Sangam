import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MeetingConfig from './MeetingConfig';

const Home = () => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [showMeetingConfig, setShowMeetingConfig] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load saved user data on mount
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedToken = localStorage.getItem('authToken');

    if (savedName && savedToken) {
      setUserName(savedName);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const error = searchParams.get('error');

    if (error) {
      alert(`Authentication failed: ${error}`);
      return;
    }

    if (token && name) {
      // Store token and user info
      localStorage.setItem('authToken', token);
      localStorage.setItem('userName', name);
      setUserName(name);

      // Clear URL parameters
      window.history.replaceState({}, '', '/');

      console.log('✅ Logged in as:', name);
      alert(`Welcome, ${name}! You are now logged in.`);
    }
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    setUserName('');
    alert('Logged out successfully');
  };

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

  const createRoom = () => {
    if (!validateName(userName)) {
      return;
    }
    setShowMeetingConfig(true);
  };

  const handleGoogleLogin = () => {
    const API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
    window.location.href = `${API_URL}/api/auth/google`;
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

      // Check if room requires password
      if (roomData.requiresPassword) {
        const enteredPassword = roomPassword || prompt('This room is password protected. Please enter the password:');
        if (!enteredPassword) {
          return;
        }

        // Validate password
        const validateResponse = await fetch(`${API_URL}/api/room/${roomId.trim()}/validate-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: enteredPassword })
        });

        const validateData = await validateResponse.json();

        if (!validateData.valid) {
          alert('Incorrect password. Please try again.');
          setRoomPassword('');
          return;
        }

        sessionStorage.setItem('roomPassword', enteredPassword);
      }

      sessionStorage.setItem('userName', userName);
      sessionStorage.setItem('isHost', 'false');
      navigate(`/room/${roomId.trim()}`);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please check your connection and try again.');
    }
  };

  const isLoggedIn = localStorage.getItem('authToken');

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Sangam</h1>
        <p className="subtitle">High-quality video conferencing for everyone</p>

        {isLoggedIn && (
          <div className="logged-in-status">
            <p>✅ Logged in as: <strong>{userName}</strong></p>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        )}

        {!isLoggedIn && (
          <div className="google-auth-section">
            <button onClick={handleGoogleLogin} className="btn btn-google">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Sign in with Google
            </button>
          </div>
        )}

        {!isLoggedIn && (
          <div className="divider">
            <span>OR</span>
          </div>
        )}

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

        {showMeetingConfig && (
          <MeetingConfig
            userName={userName}
            onClose={() => setShowMeetingConfig(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Home;