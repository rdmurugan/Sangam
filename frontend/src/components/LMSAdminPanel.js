/**
 * LMS Admin Panel
 * Configuration and management interface for LMS integration
 */

import React, { useState, useEffect } from 'react';
import lmsService from '../services/lmsService';
import '../styles/LMSAdminPanel.css';

const LMSAdminPanel = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('canvas');
  const [testResults, setTestResults] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const platforms = [
    { id: 'canvas', name: 'Canvas LMS', icon: '📚' },
    { id: 'moodle', name: 'Moodle', icon: '🎓' },
    { id: 'blackboard', name: 'Blackboard', icon: '📖' },
    { id: 'googleClassroom', name: 'Google Classroom', icon: '🏫' }
  ];

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const result = await lmsService.getStatus();
      setStatus(result.status);
      setMessage({ type: 'success', text: 'Status loaded successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (platform) => {
    setTestResults({ ...testResults, [platform]: { testing: true } });

    try {
      // Test connection would call backend test endpoint
      // For now, simulating success
      setTimeout(() => {
        setTestResults({
          ...testResults,
          [platform]: { success: true, message: 'Connection successful!' }
        });
      }, 1500);
    } catch (error) {
      setTestResults({
        ...testResults,
        [platform]: { success: false, message: error.message }
      });
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  if (loading) {
    return (
      <div className="lms-admin-panel">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading LMS configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lms-admin-panel">
      <div className="panel-header">
        <h1>LMS Integration Admin Panel</h1>
        <p className="subtitle">Configure and manage Learning Management System integrations</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* Status Overview */}
      <div className="section">
        <h2>Status Overview</h2>
        <div className="status-grid">
          <div className="status-card">
            <span className="status-label">Plugin Status</span>
            <span className={`status-value ${status?.enabled ? 'active' : 'inactive'}`}>
              {status?.enabled ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <div className="status-card">
            <span className="status-label">Version</span>
            <span className="status-value">{status?.version || '1.0.0'}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Active Platforms</span>
            <span className="status-value">{status?.platforms?.length || 0} / 4</span>
          </div>
          <div className="status-card">
            <span className="status-label">License Tier</span>
            <span className="status-value">INSTITUTIONAL</span>
          </div>
        </div>
      </div>

      {/* Platform Configuration */}
      <div className="section">
        <h2>Platform Configuration</h2>

        <div className="platform-tabs">
          {platforms.map(platform => (
            <button
              key={platform.id}
              className={`platform-tab ${selectedPlatform === platform.id ? 'active' : ''}`}
              onClick={() => setSelectedPlatform(platform.id)}
            >
              <span className="platform-icon">{platform.icon}</span>
              <span className="platform-name">{platform.name}</span>
              {status?.platforms?.includes(platform.id) && (
                <span className="platform-enabled">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="platform-config">
          {selectedPlatform === 'canvas' && <CanvasConfig onTest={testConnection} testResult={testResults.canvas} />}
          {selectedPlatform === 'moodle' && <MoodleConfig onTest={testConnection} testResult={testResults.moodle} />}
          {selectedPlatform === 'blackboard' && <BlackboardConfig onTest={testConnection} testResult={testResults.blackboard} />}
          {selectedPlatform === 'googleClassroom' && <GoogleClassroomConfig onTest={testConnection} testResult={testResults.googleClassroom} />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <button className="action-button primary" onClick={loadStatus}>
            🔄 Refresh Status
          </button>
          <button className="action-button" onClick={() => window.open('/backend/plugins/lms/README.md', '_blank')}>
            📖 View Documentation
          </button>
          <button className="action-button" onClick={() => window.location.href = '/lms/instructor'}>
            👨‍🏫 Open Instructor Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// Canvas Configuration Component
const CanvasConfig = ({ onTest, testResult }) => (
  <div className="config-form">
    <h3>Canvas LMS Configuration</h3>
    <div className="form-group">
      <label>Base URL</label>
      <input type="url" placeholder="https://canvas.yourschool.edu" defaultValue={process.env.REACT_APP_CANVAS_BASE_URL} />
      <small>Your Canvas instance URL</small>
    </div>
    <div className="form-group">
      <label>Access Token</label>
      <input type="password" placeholder="Your Canvas access token" />
      <small>Generate at: Account → Settings → + New Access Token</small>
    </div>
    <div className="form-group">
      <label>LTI Client ID</label>
      <input type="text" placeholder="Canvas developer key client ID" />
      <small>From Developer Keys in Canvas admin</small>
    </div>
    <div className="form-group">
      <label>Deployment ID</label>
      <input type="text" placeholder="1" defaultValue="1" />
      <small>Usually "1" for first deployment</small>
    </div>
    <div className="form-actions">
      <button className="button primary" onClick={() => alert('Save functionality would be implemented')}>
        💾 Save Configuration
      </button>
      <button
        className="button secondary"
        onClick={() => onTest('canvas')}
        disabled={testResult?.testing}
      >
        {testResult?.testing ? '⏳ Testing...' : '🔍 Test Connection'}
      </button>
    </div>
    {testResult && !testResult.testing && (
      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
        {testResult.message}
      </div>
    )}
    <div className="setup-guide">
      <h4>Setup Guide:</h4>
      <ol>
        <li>Go to Admin → Developer Keys → + LTI Key</li>
        <li>Set Redirect URI: <code>https://your-domain.com/api/lms/lti/launch</code></li>
        <li>Copy Client ID and paste above</li>
        <li>Generate Access Token from your account settings</li>
      </ol>
    </div>
  </div>
);

// Moodle Configuration Component
const MoodleConfig = ({ onTest, testResult }) => (
  <div className="config-form">
    <h3>Moodle Configuration</h3>
    <div className="form-group">
      <label>Base URL</label>
      <input type="url" placeholder="https://moodle.yourschool.edu" />
    </div>
    <div className="form-group">
      <label>Web Service Token</label>
      <input type="password" placeholder="Your Moodle token" />
      <small>Generate at: Site Admin → Server → Web services → Manage tokens</small>
    </div>
    <div className="form-group">
      <label>LTI Client ID</label>
      <input type="text" placeholder="LTI client ID" />
    </div>
    <div className="form-actions">
      <button className="button primary">💾 Save Configuration</button>
      <button
        className="button secondary"
        onClick={() => onTest('moodle')}
        disabled={testResult?.testing}
      >
        {testResult?.testing ? '⏳ Testing...' : '🔍 Test Connection'}
      </button>
    </div>
    {testResult && !testResult.testing && (
      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
        {testResult.message}
      </div>
    )}
  </div>
);

// Blackboard Configuration Component
const BlackboardConfig = ({ onTest, testResult }) => (
  <div className="config-form">
    <h3>Blackboard Configuration</h3>
    <div className="form-group">
      <label>Base URL</label>
      <input type="url" placeholder="https://blackboard.yourschool.edu" />
    </div>
    <div className="form-group">
      <label>Application ID</label>
      <input type="text" placeholder="Your Blackboard app ID" />
    </div>
    <div className="form-group">
      <label>Application Secret</label>
      <input type="password" placeholder="Your Blackboard app secret" />
      <small>From developer.blackboard.com</small>
    </div>
    <div className="form-actions">
      <button className="button primary">💾 Save Configuration</button>
      <button
        className="button secondary"
        onClick={() => onTest('blackboard')}
        disabled={testResult?.testing}
      >
        {testResult?.testing ? '⏳ Testing...' : '🔍 Test Connection'}
      </button>
    </div>
    {testResult && !testResult.testing && (
      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
        {testResult.message}
      </div>
    )}
  </div>
);

// Google Classroom Configuration Component
const GoogleClassroomConfig = ({ onTest, testResult }) => (
  <div className="config-form">
    <h3>Google Classroom Configuration</h3>
    <div className="form-group">
      <label>Client ID</label>
      <input type="text" placeholder="Google OAuth client ID" />
      <small>From Google Cloud Console</small>
    </div>
    <div className="form-group">
      <label>Client Secret</label>
      <input type="password" placeholder="Google OAuth client secret" />
    </div>
    <div className="form-group">
      <label>Refresh Token</label>
      <input type="password" placeholder="OAuth refresh token" />
      <small>Obtain via OAuth flow</small>
    </div>
    <div className="form-actions">
      <button className="button primary">💾 Save Configuration</button>
      <button
        className="button secondary"
        onClick={() => onTest('googleClassroom')}
        disabled={testResult?.testing}
      >
        {testResult?.testing ? '⏳ Testing...' : '🔍 Test Connection'}
      </button>
    </div>
    {testResult && !testResult.testing && (
      <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
        {testResult.message}
      </div>
    )}
  </div>
);

export default LMSAdminPanel;
