import React, { useState, useEffect } from 'react';

// SVG Icons
const RoomsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 14H7v-2h6v2zm4-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const TimerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
  </svg>
);

const JoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const BreakoutRooms = ({ socket, roomId, userName, isHost, localSocketId }) => {
  const [breakoutRooms, setBreakoutRooms] = useState([]);
  const [myAssignedRoom, setMyAssignedRoom] = useState(null);
  const [inBreakoutRoom, setInBreakoutRoom] = useState(false);
  const [currentBreakoutId, setCurrentBreakoutId] = useState(null);
  const [timer, setTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [numberOfRooms, setNumberOfRooms] = useState(3);
  const [duration, setDuration] = useState(10);
  const [assignmentType, setAssignmentType] = useState('auto');

  useEffect(() => {
    if (!socket) return;

    // Listen for breakout rooms created
    socket.on('breakout-rooms-created', ({ rooms, timer: timerConfig, assignmentType }) => {
      console.log('Breakout rooms created:', rooms);
      setBreakoutRooms(rooms);
      setTimer(timerConfig);

      // Find my assigned room
      if (!isHost) {
        const myRoom = rooms.find(room =>
          room.assignedParticipants.some(p => p.socketId === localSocketId)
        );
        if (myRoom) {
          setMyAssignedRoom(myRoom);
        }
      }
    });

    // Listen for joining breakout room
    socket.on('breakout-room-joined', ({ roomId, roomName, timer: timerConfig }) => {
      console.log('Joined breakout room:', roomName);
      setInBreakoutRoom(true);
      setCurrentBreakoutId(roomId);
      setTimer(timerConfig);
    });

    // Listen for returning to main room
    socket.on('returned-to-main-room', ({ roomId }) => {
      console.log('Returned to main room');
      setInBreakoutRoom(false);
      setCurrentBreakoutId(null);
    });

    // Listen for breakout rooms closed
    socket.on('breakout-rooms-closed', () => {
      console.log('Breakout rooms closed');
      setBreakoutRooms([]);
      setMyAssignedRoom(null);
      setInBreakoutRoom(false);
      setCurrentBreakoutId(null);
      setTimer(null);
      setShowCreateForm(false);
    });

    // Host joined breakout
    socket.on('host-joined-breakout', ({ roomId, roomName }) => {
      console.log('Host joined breakout room:', roomName);
      setInBreakoutRoom(true);
      setCurrentBreakoutId(roomId);
    });

    return () => {
      socket.off('breakout-rooms-created');
      socket.off('breakout-room-joined');
      socket.off('returned-to-main-room');
      socket.off('breakout-rooms-closed');
      socket.off('host-joined-breakout');
    };
  }, [socket, isHost, localSocketId]);

  // Timer countdown
  useEffect(() => {
    if (!timer) return;

    const interval = setInterval(() => {
      const remaining = timer.endsAt - Date.now();
      if (remaining <= 0) {
        setTimeRemaining(0);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleCreateBreakoutRooms = () => {
    if (numberOfRooms < 2 || numberOfRooms > 20) {
      alert('Number of rooms must be between 2 and 20');
      return;
    }

    socket?.emit('create-breakout-rooms', {
      mainRoomId: roomId,
      numberOfRooms: parseInt(numberOfRooms),
      duration: parseInt(duration) * 60 * 1000, // Convert to milliseconds
      assignmentType
    });

    setShowCreateForm(false);
  };

  const handleJoinBreakoutRoom = (breakoutRoomId) => {
    socket?.emit('join-breakout-room', {
      mainRoomId: roomId,
      breakoutRoomId,
      userName
    });
  };

  const handleReturnToMainRoom = () => {
    socket?.emit('return-to-main-room', {
      mainRoomId: roomId,
      breakoutRoomId: currentBreakoutId,
      userName
    });
  };

  const handleCloseBreakoutRooms = () => {
    if (window.confirm('Are you sure you want to close all breakout rooms? All participants will return to the main room.')) {
      socket?.emit('close-breakout-rooms', { mainRoomId: roomId });
    }
  };

  const handleHostJoinBreakout = (breakoutRoomId) => {
    socket?.emit('host-join-breakout', {
      mainRoomId: roomId,
      breakoutRoomId,
      userName
    });
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="breakout-container">
      <div className="breakout-header">
        <h3>
          <RoomsIcon />
          <span>Breakout Rooms</span>
        </h3>
        {isHost && !inBreakoutRoom && (
          <button
            className="create-breakout-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
            title="Create Breakout Rooms"
          >
            {showCreateForm ? '✕' : <JoinIcon />}
          </button>
        )}
      </div>

      {/* Timer Display */}
      {timer && timeRemaining > 0 && (
        <div className="breakout-timer">
          <TimerIcon />
          <span className="timer-text">Time Remaining: {formatTime(timeRemaining)}</span>
        </div>
      )}

      {/* Create Breakout Rooms Form (Host Only) */}
      {isHost && showCreateForm && !breakoutRooms.length && (
        <div className="breakout-create-form">
          <h4>Create Breakout Rooms</h4>

          <div className="form-group">
            <label>Number of Rooms</label>
            <input
              type="number"
              min="2"
              max="20"
              value={numberOfRooms}
              onChange={(e) => setNumberOfRooms(e.target.value)}
              className="breakout-input"
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="breakout-input"
            />
          </div>

          <div className="form-group">
            <label>Assignment Type</label>
            <select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="breakout-select"
            >
              <option value="auto">Automatically</option>
              <option value="manual">Manually</option>
            </select>
          </div>

          <button className="create-breakout-submit" onClick={handleCreateBreakoutRooms}>
            Create Rooms
          </button>
        </div>
      )}

      {/* Participant View - My Assigned Room */}
      {!isHost && myAssignedRoom && !inBreakoutRoom && (
        <div className="my-breakout-assignment">
          <h4>You've been assigned to:</h4>
          <div className="assigned-room-card">
            <div className="room-info">
              <span className="room-name">{myAssignedRoom.name}</span>
              <span className="participants-count">
                {myAssignedRoom.assignedParticipants.length} participant(s)
              </span>
            </div>
            <button
              className="join-breakout-btn"
              onClick={() => handleJoinBreakoutRoom(myAssignedRoom.id)}
            >
              Join Room
            </button>
          </div>
        </div>
      )}

      {/* Host View - All Breakout Rooms */}
      {isHost && breakoutRooms.length > 0 && !inBreakoutRoom && (
        <div className="breakout-list">
          <h4>Active Breakout Rooms</h4>
          {breakoutRooms.map((room) => (
            <div key={room.id} className="breakout-room-card">
              <div className="breakout-room-info">
                <span className="breakout-room-name">{room.name}</span>
                <span className="breakout-participants-count">
                  {room.assignedParticipants.length} participant(s)
                </span>
              </div>
              <button
                className="host-join-btn"
                onClick={() => handleHostJoinBreakout(room.id)}
              >
                Visit
              </button>
            </div>
          ))}

          <button className="close-breakout-btn" onClick={handleCloseBreakoutRooms}>
            Close All Breakout Rooms
          </button>
        </div>
      )}

      {/* In Breakout Room - Return Button */}
      {inBreakoutRoom && (
        <div className="in-breakout-room">
          <div className="breakout-status">
            <span className="status-indicator"></span>
            <span>You're in a breakout room</span>
          </div>
          <button className="return-main-btn" onClick={handleReturnToMainRoom}>
            Return to Main Room
          </button>
        </div>
      )}

      {/* Empty State */}
      {!showCreateForm && breakoutRooms.length === 0 && !myAssignedRoom && (
        <div className="breakout-empty">
          <RoomsIcon />
          <p>No active breakout rooms</p>
          {isHost && <p className="breakout-empty-hint">Create breakout rooms to start</p>}
        </div>
      )}
    </div>
  );
};

export default BreakoutRooms;
