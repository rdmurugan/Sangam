import React, { useState } from 'react';
import Reactions from './Reactions';

// Professional SVG Icons
const MicIcon = ({ enabled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    {enabled ? (
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    ) : (
      <>
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" opacity="0.3"/>
        <path d="M19 11h-2c0 .91-.26 1.75-.69 2.48l1.46 1.46A6.921 6.921 0 0019 11zM14.85 16.85l1.46 1.46A8.832 8.832 0 0012 19c-3.87 0-7-3.13-7-7h2c0 2.76 2.24 5 5 5 .81 0 1.58-.2 2.27-.54l-1.42-1.42zM3.27 3L2 4.27l5.73 5.73V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c.57-.08 1.12-.24 1.64-.46l5.09 5.09L21 21.27 3.27 3zM11.98 5L9 8.98V5c0-.55.45-1 1-1 .27 0 .52.11.71.29L11.98 5z"/>
      </>
    )}
  </svg>
);

const VideoIcon = ({ enabled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    {enabled ? (
      <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-10c0-.55-.45-1-1-1zm4 4l-2 1.5V8l2 1.5V18l-2-1.5v-1.5l2 1.5V9.5z"/>
    ) : (
      <>
        <path d="M3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2zM5 16V8h1.73l8 8H5zm10-8v2.61l6-3.46V18l-1.39-.8L21 18.61V6.5l-6 3.5V7c0-.55-.45-1-1-1h-2.61l2 2H15z"/>
      </>
    )}
  </svg>
);

const ScreenShareIcon = ({ sharing }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    {sharing ? (
      <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-2-7h-3v-2h3v2zm-4 0h-3V7h3v5zm-4 0H8V9h3v3z"/>
    ) : (
      <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
    )}
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
);

const ParticipantsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const WhiteboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

const WaitingRoomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
  </svg>
);

const EndCallIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

const Controls = ({
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  onLeave,
  onToggleChat,
  onToggleParticipants,
  onToggleWhiteboard,
  onToggleWaitingRoom,
  onToggleMeetingInfo,
  onToggleSettings,
  onReact,
  isScreenSharing,
  isSidebarOpen,
  sidebarTab,
  isHost,
  waitingCount = 0
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showReactions, setShowReactions] = useState(false);

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
          <MicIcon enabled={audioEnabled} />
          <span className="control-label">{audioEnabled ? 'Mute' : 'Unmute'}</span>
        </button>

        <button
          className={`control-button ${!videoEnabled ? 'disabled' : ''}`}
          onClick={handleVideoToggle}
          title={videoEnabled ? 'Stop Video' : 'Start Video'}
        >
          <VideoIcon enabled={videoEnabled} />
          <span className="control-label">{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
        </button>

        <button
          className={`control-button ${isScreenSharing ? 'active' : ''}`}
          onClick={onScreenShare}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <ScreenShareIcon sharing={isScreenSharing} />
          <span className="control-label">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
        </button>

        <Reactions
          onReact={onReact}
          isOpen={showReactions}
          onToggle={() => setShowReactions(!showReactions)}
        />

        <div className="control-divider"></div>

        <button
          className={`control-button ${isSidebarOpen && sidebarTab === 'chat' ? 'active' : ''}`}
          onClick={onToggleChat}
          title="Chat"
        >
          <ChatIcon />
          <span className="control-label">Chat</span>
        </button>

        <button
          className={`control-button ${isSidebarOpen && sidebarTab === 'participants' ? 'active' : ''}`}
          onClick={onToggleParticipants}
          title="Participants"
        >
          <ParticipantsIcon />
          <span className="control-label">Participants</span>
        </button>

        <button
          className={`control-button ${isSidebarOpen && sidebarTab === 'whiteboard' ? 'active' : ''}`}
          onClick={onToggleWhiteboard}
          title="Whiteboard"
        >
          <WhiteboardIcon />
          <span className="control-label">Whiteboard</span>
        </button>

        <button
          className="control-button"
          onClick={onToggleMeetingInfo}
          title="Meeting Info"
        >
          <InfoIcon />
          <span className="control-label">Info</span>
        </button>

        <button
          className="control-button"
          onClick={onToggleSettings}
          title="Settings"
        >
          <SettingsIcon />
          <span className="control-label">Settings</span>
        </button>

        {isHost && (
          <button
            className={`control-button ${waitingCount > 0 ? 'notification' : ''}`}
            onClick={onToggleWaitingRoom}
            title="Waiting Room"
          >
            <WaitingRoomIcon />
            <span className="control-label">Waiting</span>
            {waitingCount > 0 && <span className="badge">{waitingCount}</span>}
          </button>
        )}

        <div className="control-divider"></div>

        <button
          className="control-button leave-button"
          onClick={onLeave}
          title="Leave Meeting"
        >
          <EndCallIcon />
          <span className="control-label">End</span>
        </button>
      </div>
    </div>
  );
};

export default Controls;