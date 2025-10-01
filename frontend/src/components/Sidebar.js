import React, { useState } from 'react';
import Chat from './Chat';
import Participants from './Participants';
import Whiteboard from './Whiteboard';

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
          💬 Chat
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'participants' ? 'active' : ''}`}
          onClick={() => setCurrentTab('participants')}
          title="Participants"
        >
          👥 Participants ({participants.length + 1})
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'whiteboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('whiteboard')}
          title="Whiteboard"
        >
          📝 Whiteboard
        </button>
        <button
          className="sidebar-close-button"
          onClick={onClose}
          title="Close Sidebar"
        >
          ✕
        </button>
      </div>

      <div className="sidebar-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Sidebar;
