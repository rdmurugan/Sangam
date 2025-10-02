import React, { useState } from 'react';
import Chat from './Chat';
import Participants from './Participants';
import Whiteboard from './Whiteboard';
import Polls from './Polls';
import BreakoutRooms from './BreakoutRooms';
import LiveTranslation from './LiveTranslation';
import AIAssistant from './AIAssistant';
import SecurityPanel from './SecurityPanel';
import '../styles/BreakoutRooms.css';

// Professional SVG Icons for Sidebar
const ChatIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
);

const ParticipantsIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const WhiteboardIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M3 5v14c0 1.1.9 2 2 2h6l2 2 2-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm8 13l-1-1H5V5h14v12h-5l-1 1-2-2z"/>
  </svg>
);

const PollsIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

const BreakoutIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 14H7v-2h6v2zm4-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const TranslateIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
  </svg>
);

const AIIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M21 11.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5zm-2 5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5zM17.5 17c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2zm-2-11c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2zM19 8.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5zM11 4.07V3c0-.55-.45-1-1-1s-1 .45-1 1v1.07C7.61 4.56 7 5.79 7 7.13v5.74c0 1.34.61 2.57 2 3.06V17c0 .55.45 1 1 1s1-.45 1-1v-1.07c1.39-.49 2-1.72 2-3.06V7.13c0-1.34-.61-2.57-2-3.06zm0 9.06c0 1.1-.9 2-2 2s-2-.9-2-2V7.13c0-1.1.9-2 2-2s2 .9 2 2v5.99z"/>
  </svg>
);

const SecurityIconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
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
  onToggleCollapse,
  userRole
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
            participants={participants}
            isHost={isHost}
            localSocketId={localSocketId}
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
      case 'polls':
        return (
          <Polls
            socket={socket}
            roomId={roomId}
            userName={userName}
            isHost={isHost}
          />
        );
      case 'breakout':
        return (
          <BreakoutRooms
            socket={socket}
            roomId={roomId}
            userName={userName}
            isHost={isHost}
            localSocketId={localSocketId}
          />
        );
      case 'translate':
        return (
          <LiveTranslation
            socket={socket}
            roomId={roomId}
            userName={userName}
          />
        );
      case 'ai':
        return (
          <AIAssistant
            socket={socket}
            roomId={roomId}
            userName={userName}
            isHost={isHost}
          />
        );
      case 'security':
        return (
          <SecurityPanel
            socket={socket}
            roomId={roomId}
            userName={userName}
            isHost={isHost}
            participants={participants}
            localSocketId={localSocketId}
            userRole={userRole || (isHost ? 'HOST' : 'PARTICIPANT')}
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
          <ChatIconSidebar />
          <span>Chat</span>
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'participants' ? 'active' : ''}`}
          onClick={() => setCurrentTab('participants')}
          title="Participants"
        >
          <ParticipantsIconSidebar />
          <span>Participants ({participants.length + 1})</span>
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'whiteboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('whiteboard')}
          title="Whiteboard"
        >
          <WhiteboardIconSidebar />
          <span>Whiteboard</span>
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'polls' ? 'active' : ''}`}
          onClick={() => setCurrentTab('polls')}
          title="Polls"
        >
          <PollsIconSidebar />
          <span>Polls</span>
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'breakout' ? 'active' : ''}`}
          onClick={() => setCurrentTab('breakout')}
          title="Breakout Rooms"
        >
          <BreakoutIconSidebar />
          <span>Rooms</span>
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'translate' ? 'active' : ''}`}
          onClick={() => setCurrentTab('translate')}
          title="Live Translation"
        >
          <TranslateIconSidebar />
          <span>Translate</span>
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'ai' ? 'active' : ''}`}
          onClick={() => setCurrentTab('ai')}
          title="AI Assistant"
        >
          <AIIconSidebar />
          <span>AI Assistant</span>
        </button>
        <button
          className={`sidebar-tab ${currentTab === 'security' ? 'active' : ''}`}
          onClick={() => setCurrentTab('security')}
          title="Security & Moderation"
        >
          <SecurityIconSidebar />
          <span>Security</span>
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
