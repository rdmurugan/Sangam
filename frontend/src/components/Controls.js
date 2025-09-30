import React, { useState } from 'react';

const Controls = ({
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  onLeave,
  onToggleChat,
  onToggleParticipants,
  isScreenSharing,
  isHost
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleAudioToggle = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    onToggleAudio(newState);
  };

  const handleVideoToggle = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    onToggleVideo(newState);
  };

  return (
    <div className="controls-container">
      <div className="controls-group">
        <button
          className={`control-button ${!audioEnabled ? 'disabled' : ''}`}
          onClick={handleAudioToggle}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? '🎤' : '🎤🚫'}
        </button>

        <button
          className={`control-button ${!videoEnabled ? 'disabled' : ''}`}
          onClick={handleVideoToggle}
          title={videoEnabled ? 'Stop Video' : 'Start Video'}
        >
          {videoEnabled ? '📹' : '📹🚫'}
        </button>

        <button
          className={`control-button ${isScreenSharing ? 'active' : ''}`}
          onClick={onScreenShare}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          🖥️
        </button>

        <button
          className="control-button"
          onClick={onToggleChat}
          title="Chat"
        >
          💬
        </button>

        <button
          className="control-button"
          onClick={onToggleParticipants}
          title="Participants"
        >
          👥
        </button>

        <button
          className="control-button leave-button"
          onClick={onLeave}
          title="Leave Meeting"
        >
          📞
        </button>
      </div>
    </div>
  );
};

export default Controls;