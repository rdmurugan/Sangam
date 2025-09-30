import React from 'react';

const Participants = ({ participants, isHost, onRemoveParticipant, localSocketId }) => {
  // Count participants including yourself
  const totalCount = participants.length + 1;

  return (
    <div className="participants-container">
      <div className="participants-header">
        <h3>Participants ({totalCount})</h3>
      </div>
      <div className="participants-list">
        {/* Show local user first */}
        <div key={localSocketId} className="participant-item">
          <div className="participant-info">
            <span className="participant-name">
              You {isHost && ' 👑'}
            </span>
            <div className="participant-status">
              <span className="status-active">🎤</span>
              <span className="status-active">📹</span>
            </div>
          </div>
        </div>

        {/* Show other participants */}
        {participants.map((participant) => (
          <div key={participant.socketId} className="participant-item">
            <div className="participant-info">
              <span className="participant-name">
                {participant.userName}
                {participant.isHost && ' 👑'}
              </span>
              <div className="participant-status">
                <span className={participant.audioEnabled ? 'status-active' : 'status-inactive'}>
                  {participant.audioEnabled ? '🎤' : '🎤🚫'}
                </span>
                <span className={participant.videoEnabled ? 'status-active' : 'status-inactive'}>
                  {participant.videoEnabled ? '📹' : '📹🚫'}
                </span>
                {participant.isScreenSharing && <span>🖥️</span>}
              </div>
            </div>
            {isHost && (
              <button
                className="remove-button"
                onClick={() => onRemoveParticipant(participant.socketId)}
                title="Remove participant"
              >
                ❌
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Participants;