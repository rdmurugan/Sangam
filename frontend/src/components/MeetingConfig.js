import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MeetingConfig = ({ userName, onClose }) => {
  const navigate = useNavigate();
  const [meetingName, setMeetingName] = useState('');
  const [password, setPassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(false);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [muteOnEntry, setMuteOnEntry] = useState(false);
  const [allowParticipantsToShare, setAllowParticipantsToShare] = useState(true);
  const [scheduleType, setScheduleType] = useState('instant'); // instant or scheduled
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createMeeting = async () => {
    if (!userName || !userName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (requirePassword && !password.trim()) {
      alert('Please enter a password for the meeting');
      return;
    }

    if (scheduleType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
      alert('Please select date and time for scheduled meeting');
      return;
    }

    setIsCreating(true);

    try {
      const API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

      const scheduledDateTime = scheduleType === 'scheduled'
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : null;

      const response = await fetch(`${API_URL}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName: userName,
          roomName: meetingName || 'Sangam Meeting',
          password: requirePassword ? password : null,
          waitingRoomEnabled,
          muteOnEntry,
          allowParticipantsToShare,
          scheduledTime: scheduledDateTime
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        const errorMessages = data.errors.map(e => e.msg).join('\n');
        alert(`Validation error:\n${errorMessages}`);
        return;
      }

      sessionStorage.setItem('userName', userName);
      sessionStorage.setItem('isHost', 'true');

      if (scheduleType === 'scheduled') {
        alert(`Meeting scheduled successfully! Room ID: ${data.roomId}\nScheduled for: ${new Date(scheduledDateTime).toLocaleString()}`);
        if (onClose) onClose();
      } else {
        navigate(`/room/${data.roomId}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert(`Failed to create meeting: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="meeting-config-overlay">
      <div className="meeting-config-modal">
        <div className="meeting-config-header">
          <h2>Configure Meeting</h2>
          <button className="close-button" onClick={onClose} title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="meeting-config-body">
          <div className="config-section">
            <h3>Meeting Details</h3>

            <div className="form-group">
              <label>Meeting Name</label>
              <input
                type="text"
                placeholder="e.g., Team Standup"
                value={meetingName}
                onChange={(e) => setMeetingName(e.target.value)}
                className="config-input"
              />
            </div>

            <div className="form-group">
              <label>When</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="instant"
                    checked={scheduleType === 'instant'}
                    onChange={(e) => setScheduleType(e.target.value)}
                  />
                  <span>Start Instantly</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="scheduleType"
                    value="scheduled"
                    checked={scheduleType === 'scheduled'}
                    onChange={(e) => setScheduleType(e.target.value)}
                  />
                  <span>Schedule for Later</span>
                </label>
              </div>
            </div>

            {scheduleType === 'scheduled' && (
              <div className="schedule-inputs">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="config-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="config-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="config-section">
            <h3>Security</h3>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={(e) => setRequirePassword(e.target.checked)}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Require password</span>
                  <span className="checkbox-description">Participants must enter password to join</span>
                </div>
              </label>
            </div>

            {requirePassword && (
              <div className="form-group password-input">
                <input
                  type="password"
                  placeholder="Enter meeting password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="config-input"
                />
              </div>
            )}

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={waitingRoomEnabled}
                  onChange={(e) => setWaitingRoomEnabled(e.target.checked)}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Enable waiting room</span>
                  <span className="checkbox-description">Host must admit participants before they can join</span>
                </div>
              </label>
            </div>
          </div>

          <div className="config-section">
            <h3>Participant Permissions</h3>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={muteOnEntry}
                  onChange={(e) => setMuteOnEntry(e.target.checked)}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Mute participants on entry</span>
                  <span className="checkbox-description">New participants join with microphone muted</span>
                </div>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={allowParticipantsToShare}
                  onChange={(e) => setAllowParticipantsToShare(e.target.checked)}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Allow screen sharing</span>
                  <span className="checkbox-description">Participants can share their screen</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="meeting-config-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={createMeeting}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : scheduleType === 'scheduled' ? 'Schedule Meeting' : 'Start Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingConfig;
