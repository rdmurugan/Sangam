import React, { useState } from 'react';

const MeetingInfo = ({ roomId, roomName, participantCount, onClose }) => {
  const [copied, setCopied] = useState(false);

  const meetingLink = `${window.location.origin}/room/${roomId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="meeting-info-container">
      <div className="meeting-info-header">
        <h3>Meeting Information</h3>
        <button className="close-panel-button" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      <div className="meeting-info-content">
        <div className="info-section">
          <label className="info-label">Meeting Name</label>
          <div className="info-value">{roomName || 'Sangam Meeting'}</div>
        </div>

        <div className="info-section">
          <label className="info-label">Meeting ID</label>
          <div className="info-value-with-action">
            <span className="info-value">{roomId}</span>
            <button className="copy-button-small" onClick={copyRoomId} title="Copy Meeting ID">
              📋
            </button>
          </div>
        </div>

        <div className="info-section">
          <label className="info-label">Participants</label>
          <div className="info-value">{participantCount}</div>
        </div>

        <div className="info-section">
          <label className="info-label">Meeting Link</label>
          <div className="meeting-link-box">
            <input
              type="text"
              value={meetingLink}
              readOnly
              className="meeting-link-input"
            />
          </div>
          <button
            className={`copy-button ${copied ? 'copied' : ''}`}
            onClick={copyToClipboard}
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        <div className="info-section telephonic-section">
          <label className="info-label">
            ☎️ Join by Phone (Beta)
          </label>
          <div className="telephonic-info">
            <p className="info-note">
              Telephonic dial-in feature coming soon!
              This will allow participants to join via phone call.
            </p>
            <div className="feature-list">
              <div className="feature-item">✓ International dial-in numbers</div>
              <div className="feature-item">✓ Audio-only participation</div>
              <div className="feature-item">✓ PIN-based authentication</div>
            </div>
          </div>
        </div>

        <div className="info-section security-section">
          <label className="info-label">🔒 Security</label>
          <div className="security-info">
            <div className="security-item">
              <span className="security-icon">🔐</span>
              <span>End-to-end encrypted</span>
            </div>
            <div className="security-item">
              <span className="security-icon">🚪</span>
              <span>Waiting room enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingInfo;
