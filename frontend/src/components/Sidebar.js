import React, { useState } from 'react';
import Chat from './Chat';
import Participants from './Participants';
import Whiteboard from './Whiteboard';

// Professional SVG Icons for Sidebar
const ChatIconSidebar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
);

const ParticipantsIconSidebar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const WhiteboardIconSidebar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
    <path d="M3 5v14c0 1.1.9 2 2 2h6l2 2 2-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm8 13l-1-1H5V5h14v12h-5l-1 1-2-2z"/>
  </svg>
);

const CloseIconSidebar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const Sidebar = ({
  activeTab,
  onClose,
  socket,
  roomId,
  userName,
  participants,
  isHost,
  onRemoveParticipant,
  localSocketId,
  isCollapsed,
  onToggleCollapse
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab || 'chat');

  const renderContent = () => {
    switch (currentTab) {
      case 'chat':
        return (
          <Chat
            socket={socket}
            roomId={roomId}
            userName={userName}
          />
        );
      case 'participants':
        return (
          <Participants
            participants={participants}
            isHost={isHost}
            onRemoveParticipant={onRemoveParticipant}
            localSocketId={localSocketId}
          />
        );
      case 'whiteboard':
        return (
          <Whiteboard
            socket={socket}
            roomId={roomId}
            userName={userName}
          />
        );
      default:
        return null;
    }
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="sidebar-container">
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${currentTab === 'chat' ? 'active' : ''}`}
          onClick={() => setCurrentTab('chat')}
          title="Chat"
        >
          <ChatIconSidebar /> Chat
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'participants' ? 'active' : ''}`}
          onClick={() => setCurrentTab('participants')}
          title="Participants"
        >
          <ParticipantsIconSidebar /> Participants ({participants.length + 1})
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'whiteboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('whiteboard')}
          title="Whiteboard"
        >
          <WhiteboardIconSidebar /> Whiteboard
        </button>
        <button
          className="sidebar-close-button"
          onClick={onClose}
          title="Close Sidebar"
        >
          <CloseIconSidebar />
        </button>
      </div>

      <div className="sidebar-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Sidebar;
