import React from 'react';

// Professional SVG Icons
const HostIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700" style={{ marginLeft: '6px', verticalAlign: 'middle' }}>
    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
  </svg>
);

const MicOnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

const MicOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 11h-2c0 .91-.26 1.75-.69 2.48l1.46 1.46A6.921 6.921 0 0019 11zM14.85 16.85l1.46 1.46A8.832 8.832 0 0012 19c-3.87 0-7-3.13-7-7h2c0 2.76 2.24 5 5 5 .81 0 1.58-.2 2.27-.54l-1.42-1.42zM3.27 3L2 4.27l6.18 6.18V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c.57-.08 1.12-.24 1.64-.46l5.09 5.09L21 21.27 3.27 3zM11.98 5L9 8.98V5c0-.55.45-1 1-1 .27 0 .52.11.71.29L11.98 5z"/>
  </svg>
);

const VideoOnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-10c0-.55-.45-1-1-1zm4 4l-2 1.5V8l2 1.5V18l-2-1.5v-1.5l2 1.5V9.5z"/>
  </svg>
);

const VideoOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2zM5 16V8h1.73l8 8H5zm10-8v2.61l6-3.46V18l-1.39-.8L21 18.61V6.5l-6 3.5V7c0-.55-.45-1-1-1h-2.61l2 2H15z"/>
  </svg>
);

const ScreenShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
  </svg>
);

const RemoveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

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
              You {isHost && <HostIcon />}
            </span>
            <div className="participant-status">
              <span className="status-active"><MicOnIcon /></span>
              <span className="status-active"><VideoOnIcon /></span>
            </div>
          </div>
        </div>

        {/* Show other participants */}
        {participants.map((participant) => (
          <div key={participant.socketId} className="participant-item">
            <div className="participant-info">
              <span className="participant-name">
                {participant.userName}
                {participant.isHost && <HostIcon />}
              </span>
              <div className="participant-status">
                <span className={participant.audioEnabled ? 'status-active' : 'status-inactive'}>
                  {participant.audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
                </span>
                <span className={participant.videoEnabled ? 'status-active' : 'status-inactive'}>
                  {participant.videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
                </span>
                {participant.isScreenSharing && <span className="status-active"><ScreenShareIcon /></span>}
              </div>
            </div>
            {isHost && (
              <button
                className="remove-button"
                onClick={() => onRemoveParticipant(participant.socketId)}
                title="Remove participant"
              >
                <RemoveIcon />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Participants;