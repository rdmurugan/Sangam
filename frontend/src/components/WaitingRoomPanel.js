import React from 'react';
import '../styles/WaitingRoomPanel.css';

const WaitingRoomPanel = ({ waitingUsers, onAdmitUser, onRejectUser }) => {
  if (waitingUsers.length === 0) {
    return (
      <div className="waiting-room-panel">
        <div className="waiting-room-header">
          <h3>Waiting Room</h3>
        </div>
        <div className="waiting-room-empty">
          <p>No users waiting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="waiting-room-panel">
      <div className="waiting-room-header">
        <h3>Waiting Room ({waitingUsers.length})</h3>
      </div>
      <div className="waiting-users-list">
        {waitingUsers.map((user) => (
          <div key={user.socketId} className="waiting-user-item">
            <div className="waiting-user-info">
              <span className="waiting-user-name">{user.userName}</span>
            </div>
            <div className="waiting-user-actions">
              <button
                className="admit-button"
                onClick={() => onAdmitUser(user.socketId)}
              >
                Admit
              </button>
              <button
                className="reject-button"
                onClick={() => onRejectUser(user.socketId)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaitingRoomPanel;
