import React from 'react';

const Participants = ({ participants, isHost, onRemoveParticipant, localSocketId }) => {
  return (
    <div className="participants-container">
      <div className="participants-header">
        <h3>Participants ({participants.length})</h3>
      </div>
      <div className="participants-list">
        {participants.map((participant) => (
          <div key={participant.socketId} className="participant-item">
            <div className="participant-info">
              <span className="participant-name">
                {participant.userName}
                {participant.socketId === localSocketId && ' (You)'}
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
            {isHost && participant.socketId !== localSocketId && (
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