import React, { useState, useEffect } from 'react';
import '../styles/SecurityPanel.css';

// SVG Icons
const SecurityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

const UnlockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
  </svg>
);

const AuditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const CoHostIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    <path d="M20 10V7h-2v3h-3v2h3v3h2v-3h3v-2z"/>
  </svg>
);

const ComplianceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
  </svg>
);

const SecurityPanel = ({ socket, roomId, userName, isHost, participants, localSocketId, userRole }) => {
  const [activeTab, setActiveTab] = useState('controls');
  const [meetingLocked, setMeetingLocked] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [complianceMode, setComplianceMode] = useState('STANDARD');
  const [complianceSettings, setComplianceSettings] = useState(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  // Check if user has moderation permissions
  const canModerate = ['HOST', 'CO_HOST', 'MODERATOR'].includes(userRole);
  const isHostUser = userRole === 'HOST';

  useEffect(() => {
    if (!socket) return;

    // Listen for lock/unlock events
    socket.on('meeting-locked', () => {
      setMeetingLocked(true);
    });

    socket.on('meeting-unlocked', () => {
      setMeetingLocked(false);
    });

    // Listen for compliance mode changes
    socket.on('compliance-mode-changed', ({ mode, settings }) => {
      setComplianceMode(mode);
      setComplianceSettings(settings);
    });

    // Listen for watermark toggle
    socket.on('watermark-toggled', ({ enabled }) => {
      setWatermarkEnabled(enabled);
    });

    // Listen for audit logs
    socket.on('audit-logs', ({ logs }) => {
      setAuditLogs(logs);
    });

    // Listen for exported logs
    socket.on('audit-logs-exported', (exportedData) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${roomId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    return () => {
      socket.off('meeting-locked');
      socket.off('meeting-unlocked');
      socket.off('compliance-mode-changed');
      socket.off('watermark-toggled');
      socket.off('audit-logs');
      socket.off('audit-logs-exported');
    };
  }, [socket, roomId]);

  const handleLockMeeting = () => {
    if (!canModerate) return;
    socket?.emit('lock-meeting', { roomId });
  };

  const handleUnlockMeeting = () => {
    if (!canModerate) return;
    socket?.emit('unlock-meeting', { roomId });
  };

  const handleMuteAll = () => {
    if (!canModerate) return;
    if (window.confirm('Mute all participants (except co-hosts)?')) {
      socket?.emit('mute-all-participants', { roomId });
    }
  };

  const handleAssignCoHost = (targetSocketId, targetUserName) => {
    if (!isHostUser) return;
    socket?.emit('assign-cohost', { roomId, targetSocketId, targetUserName });
  };

  const handleRemoveCoHost = (targetSocketId) => {
    if (!isHostUser) return;
    socket?.emit('remove-cohost', { roomId, targetSocketId });
  };

  const handleRemoveParticipant = (targetSocketId, targetUserName) => {
    if (!canModerate) return;
    const reason = window.prompt(`Remove ${targetUserName}? Enter reason (optional):`);
    if (reason !== null) {
      socket?.emit('remove-participant', { roomId, targetSocketId, targetUserName, reason });
    }
  };

  const handleBlockUser = (targetSocketId, targetUserName) => {
    if (!canModerate) return;
    const reason = window.prompt(`Block ${targetUserName}? They will not be able to rejoin. Enter reason:`);
    if (reason) {
      socket?.emit('block-user', { roomId, targetSocketId, targetUserName, reason });
    }
  };

  const handleReportUser = (targetSocketId, targetUserName) => {
    setReportTarget({ socketId: targetSocketId, userName: targetUserName });
    setShowReportModal(true);
  };

  const submitReport = (reason, details) => {
    if (!reportTarget) return;
    socket?.emit('report-user', {
      roomId,
      reportedSocketId: reportTarget.socketId,
      reportedUserName: reportTarget.userName,
      reason,
      details
    });
    setShowReportModal(false);
    setReportTarget(null);
  };

  const handleLoadAuditLogs = () => {
    if (!canModerate) return;
    socket?.emit('get-audit-logs', { roomId, limit: 100 });
  };

  const handleExportAuditLogs = () => {
    if (!isHostUser) return;
    socket?.emit('export-audit-logs', { roomId });
  };

  const handleToggleWatermark = () => {
    if (!isHostUser) return;
    socket?.emit('toggle-watermark', { roomId, enabled: !watermarkEnabled });
  };

  const handleChangeComplianceMode = (mode) => {
    if (!isHostUser) return;
    socket?.emit('set-compliance-mode', { roomId, mode });
  };

  const renderControls = () => (
    <div className="security-controls">
      <div className="control-section">
        <h4>Meeting Controls</h4>

        <button
          className={`control-btn ${meetingLocked ? 'locked' : ''}`}
          onClick={meetingLocked ? handleUnlockMeeting : handleLockMeeting}
          disabled={!canModerate}
        >
          {meetingLocked ? <UnlockIcon /> : <LockIcon />}
          <span>{meetingLocked ? 'Unlock Meeting' : 'Lock Meeting'}</span>
        </button>

        <button
          className="control-btn"
          onClick={handleMuteAll}
          disabled={!canModerate}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
          </svg>
          <span>Mute All Participants</span>
        </button>

        {isHostUser && (
          <button
            className="control-btn"
            onClick={handleToggleWatermark}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>{watermarkEnabled ? 'Disable Watermark' : 'Enable Watermark'}</span>
          </button>
        )}
      </div>

      <div className="control-section">
        <h4>Tools ({participants.length + 1})</h4>
        <div className="participants-security-list">
          {participants.map((participant) => (
            <div key={participant.socketId} className="participant-security-item">
              <div className="participant-info">
                <span className="participant-name">{participant.userName}</span>
                {participant.role && participant.role !== 'PARTICIPANT' && (
                  <span className={`role-badge ${participant.role.toLowerCase()}`}>
                    {participant.role}
                  </span>
                )}
              </div>
              <div className="participant-actions">
                {isHostUser && participant.role === 'PARTICIPANT' && (
                  <button
                    className="action-btn small"
                    onClick={() => handleAssignCoHost(participant.socketId, participant.userName)}
                    title="Assign as Co-host"
                  >
                    <CoHostIcon />
                  </button>
                )}
                {isHostUser && participant.role === 'CO_HOST' && (
                  <button
                    className="action-btn small danger"
                    onClick={() => handleRemoveCoHost(participant.socketId)}
                    title="Remove Co-host"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                )}
                {canModerate && (
                  <>
                    <button
                      className="action-btn small warning"
                      onClick={() => handleRemoveParticipant(participant.socketId, participant.userName)}
                      title="Remove from meeting"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      </svg>
                    </button>
                    <button
                      className="action-btn small danger"
                      onClick={() => handleBlockUser(participant.socketId, participant.userName)}
                      title="Block user"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
                      </svg>
                    </button>
                  </>
                )}
                <button
                  className="action-btn small"
                  onClick={() => handleReportUser(participant.socketId, participant.userName)}
                  title="Report user"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="audit-logs">
      <div className="audit-header">
        <h4>Activity Audit Log</h4>
        <div className="audit-actions">
          <button className="control-btn small" onClick={handleLoadAuditLogs}>
            Refresh
          </button>
          {isHostUser && (
            <button className="control-btn small" onClick={handleExportAuditLogs}>
              <DownloadIcon />
              Export
            </button>
          )}
        </div>
      </div>

      <div className="audit-list">
        {auditLogs.length === 0 ? (
          <div className="audit-empty">
            <AuditIcon />
            <p>No audit logs loaded</p>
            <button className="control-btn" onClick={handleLoadAuditLogs}>
              Load Audit Logs
            </button>
          </div>
        ) : (
          auditLogs.map((log, index) => (
            <div key={index} className="audit-log-item">
              <div className="log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              <div className="log-action">{log.action.replace(/_/g, ' ')}</div>
              {log.userName && <div className="log-user">{log.userName}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="compliance-settings">
      <h4>Compliance Mode</h4>

      <div className="compliance-modes">
        {['STANDARD', 'HIPAA', 'GDPR', 'SOC2'].map((mode) => (
          <button
            key={mode}
            className={`compliance-mode-btn ${complianceMode === mode ? 'active' : ''}`}
            onClick={() => handleChangeComplianceMode(mode)}
            disabled={!isHostUser}
          >
            <ComplianceIcon />
            <span>{mode}</span>
          </button>
        ))}
      </div>

      {complianceSettings && (
        <div className="compliance-details">
          <h5>Current Settings ({complianceMode})</h5>
          <ul>
            {complianceSettings.requireE2EE && <li>✓ End-to-End Encryption Required</li>}
            {complianceSettings.requireAuditLogs && <li>✓ Audit Logging Enabled</li>}
            {complianceSettings.requireParticipantConsent && <li>✓ Participant Consent Required</li>}
            {complianceSettings.requireMFA && <li>✓ Multi-Factor Authentication</li>}
            <li>Recording Retention: {complianceSettings.maxRecordingRetention} days</li>
            {complianceSettings.dataResidency && <li>Data Residency: {complianceSettings.dataResidency}</li>}
          </ul>
        </div>
      )}
    </div>
  );

  if (!canModerate) {
    return (
      <div className="security-panel-container">
        <div className="security-header">
          <h3>
            <SecurityIcon />
            <span>Security</span>
          </h3>
        </div>
        <div className="security-no-access">
          <SecurityIcon />
          <p>Security controls are only available to hosts and moderators</p>
        </div>
      </div>
    );
  }

  return (
    <div className="security-panel-container">
      <div className="security-header">
        <h3>
          <SecurityIcon />
          <span>Security & Moderation</span>
        </h3>
      </div>

      <div className="security-tabs">
        <button
          className={`security-tab ${activeTab === 'controls' ? 'active' : ''}`}
          onClick={() => setActiveTab('controls')}
        >
          Controls
        </button>
        <button
          className={`security-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <AuditIcon />
          Audit Logs
        </button>
        {isHostUser && (
          <button
            className={`security-tab ${activeTab === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveTab('compliance')}
          >
            <ComplianceIcon />
            Compliance
          </button>
        )}
      </div>

      <div className="security-content">
        {activeTab === 'controls' && renderControls()}
        {activeTab === 'audit' && renderAuditLogs()}
        {activeTab === 'compliance' && renderCompliance()}
      </div>

      {showReportModal && reportTarget && (
        <ReportModal
          target={reportTarget}
          onSubmit={submitReport}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
        />
      )}
    </div>
  );
};

// Report Modal Component
const ReportModal = ({ target, onSubmit, onClose }) => {
  const [reason, setReason] = useState('inappropriate_behavior');
  const [details, setDetails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (details.trim()) {
      onSubmit(reason, details);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Report User</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reporting: <strong>{target.userName}</strong></label>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="inappropriate_behavior">Inappropriate Behavior</option>
              <option value="harassment">Harassment</option>
              <option value="spam">Spam</option>
              <option value="offensive_content">Offensive Content</option>
              <option value="disruption">Disrupting Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Details (required)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide details about the incident..."
              rows="4"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityPanel;
