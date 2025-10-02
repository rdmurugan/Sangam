import React, { useState, useEffect } from 'react';
import '../styles/MeetingScheduler.css';

// SVG Icons
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
  </svg>
);

const RepeatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
  </svg>
);

const Google CalendarAddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10z"/>
    <path d="M12 12h5v2h-5zm0 4h3v2h-3z"/>
  </svg>
);

const MeetingScheduler = ({ socket, roomId, onClose }) => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    duration: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    attendees: [],
    recurring: null,
    reminders: [30, 10]
  });

  const [attendeeInput, setAttendeeInput] = useState('');
  const [calendarConnections, setCalendarConnections] = useState({
    google: false,
    outlook: false
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [scheduledMeetings, setScheduledMeetings] = useState([]);

  // Recurring meeting options
  const [recurringConfig, setRecurringConfig] = useState({
    enabled: false,
    frequency: 'weekly',
    interval: 1,
    dayOfWeek: 'monday',
    endType: 'never', // never, after, on
    occurrences: 10,
    endDate: ''
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for scheduled meetings
    socket.on('scheduled-meetings', ({ meetings }) => {
      setScheduledMeetings(meetings);
    });

    // Listen for available slots
    socket.on('available-slots', ({ slots }) => {
      setAvailableSlots(slots);
    });

    // Check calendar connection status
    socket.emit('check-calendar-connections', {});
    socket.on('calendar-connections', ({ connections }) => {
      setCalendarConnections(connections);
    });

    return () => {
      socket.off('scheduled-meetings');
      socket.off('available-slots');
      socket.off('calendar-connections');
    };
  }, [socket]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecurringChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecurringConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addAttendee = () => {
    if (attendeeInput && attendeeInput.includes('@')) {
      setMeetingData(prev => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput]
      }));
      setAttendeeInput('');
    }
  };

  const removeAttendee = (email) => {
    setMeetingData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== email)
    }));
  };

  const scheduleMeeting = () => {
    const meeting = {
      ...meetingData,
      roomId,
      recurring: recurringConfig.enabled ? recurringConfig : null,
      startTime: `${meetingData.startDate}T${meetingData.startTime}:00`
    };

    socket?.emit('schedule-meeting', meeting);
  };

  const addToGoogleCalendar = () => {
    socket?.emit('add-to-google-calendar', {
      ...meetingData,
      roomId,
      startTime: `${meetingData.startDate}T${meetingData.startTime}:00`
    });
  };

  const addToOutlook = () => {
    socket?.emit('add-to-outlook', {
      ...meetingData,
      roomId,
      startTime: `${meetingData.startDate}T${meetingData.startTime}:00`
    });
  };

  const downloadICalFile = () => {
    socket?.emit('download-ical', {
      ...meetingData,
      roomId,
      startTime: `${meetingData.startDate}T${meetingData.startTime}:00`
    });

    socket.once('ical-file', ({ content, filename }) => {
      const blob = new Blob([content], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const findAvailableSlots = () => {
    if (meetingData.attendees.length > 0) {
      socket?.emit('find-available-slots', {
        attendees: meetingData.attendees,
        duration: meetingData.duration,
        dateRange: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    }
  };

  const renderScheduleTab = () => (
    <div className="schedule-form">
      <div className="form-section">
        <h4>Meeting Details</h4>

        <div className="form-group">
          <label>Meeting Title *</label>
          <input
            type="text"
            name="title"
            value={meetingData.title}
            onChange={handleInputChange}
            placeholder="e.g., Team Standup"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={meetingData.description}
            onChange={handleInputChange}
            placeholder="Meeting agenda or notes..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Date & Time</h4>

        <div className="form-row">
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              name="startDate"
              value={meetingData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Time *</label>
            <input
              type="time"
              name="startTime"
              value={meetingData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (minutes)</label>
            <select name="duration" value={meetingData.duration} onChange={handleInputChange}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select name="timezone" value={meetingData.timezone} onChange={handleInputChange}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Attendees</h4>

        <div className="attendee-input-group">
          <input
            type="email"
            value={attendeeInput}
            onChange={(e) => setAttendeeInput(e.target.value)}
            placeholder="Enter email address"
            onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
          />
          <button type="button" onClick={addAttendee} className="btn-add">
            Add
          </button>
        </div>

        {meetingData.attendees.length > 0 && (
          <div className="attendee-list">
            {meetingData.attendees.map((email, index) => (
              <div key={index} className="attendee-chip">
                <span>{email}</span>
                <button onClick={() => removeAttendee(email)}>&times;</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <h4>
          <RepeatIcon />
          Recurring Meeting
        </h4>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="enabled"
              checked={recurringConfig.enabled}
              onChange={handleRecurringChange}
            />
            <span>Repeat this meeting</span>
          </label>
        </div>

        {recurringConfig.enabled && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>
                <select name="frequency" value={recurringConfig.frequency} onChange={handleRecurringChange}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {recurringConfig.frequency === 'weekly' && (
                <div className="form-group">
                  <label>Day of Week</label>
                  <select name="dayOfWeek" value={recurringConfig.dayOfWeek} onChange={handleRecurringChange}>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Repeat every</label>
              <input
                type="number"
                name="interval"
                value={recurringConfig.interval}
                onChange={handleRecurringChange}
                min="1"
              />
              <span className="form-hint">
                {recurringConfig.frequency === 'daily' && 'day(s)'}
                {recurringConfig.frequency === 'weekly' && 'week(s)'}
                {recurringConfig.frequency === 'monthly' && 'month(s)'}
              </span>
            </div>

            <div className="form-group">
              <label>Ends</label>
              <select name="endType" value={recurringConfig.endType} onChange={handleRecurringChange}>
                <option value="never">Never</option>
                <option value="after">After number of occurrences</option>
                <option value="on">On specific date</option>
              </select>
            </div>

            {recurringConfig.endType === 'after' && (
              <div className="form-group">
                <input
                  type="number"
                  name="occurrences"
                  value={recurringConfig.occurrences}
                  onChange={handleRecurringChange}
                  min="1"
                />
                <span className="form-hint">occurrences</span>
              </div>
            )}

            {recurringConfig.endType === 'on' && (
              <div className="form-group">
                <input
                  type="date"
                  name="endDate"
                  value={recurringConfig.endDate}
                  onChange={handleRecurringChange}
                  min={meetingData.startDate}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={scheduleMeeting}>
          <CalendarIcon />
          Schedule Meeting
        </button>
      </div>
    </div>
  );

  const renderCalendarTab = () => (
    <div className="calendar-integrations">
      <h4>Add to Calendar</h4>

      <div className="calendar-options">
        <button
          className={`calendar-btn google ${calendarConnections.google ? 'connected' : ''}`}
          onClick={addToGoogleCalendar}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" />
          <span>Google Calendar</span>
          {calendarConnections.google && <span className="status">✓ Connected</span>}
        </button>

        <button
          className={`calendar-btn outlook ${calendarConnections.outlook ? 'connected' : ''}`}
          onClick={addToOutlook}
        >
          <img src="https://www.microsoft.com/favicon.ico" alt="Outlook" />
          <span>Outlook Calendar</span>
          {calendarConnections.outlook && <span className="status">✓ Connected</span>}
        </button>

        <button className="calendar-btn apple" onClick={downloadICalFile}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span>Apple Calendar (.ics)</span>
        </button>
      </div>

      <div className="calendar-info">
        <p>Add this meeting to your preferred calendar app with one click. Reminders will be set automatically.</p>
      </div>
    </div>
  );

  const renderAvailabilityTab = () => (
    <div className="availability-checker">
      <h4>Find Available Times</h4>

      <p className="helper-text">
        Add attendees' email addresses to find common free time slots.
      </p>

      <button
        className="btn-find-slots"
        onClick={findAvailableSlots}
        disabled={meetingData.attendees.length === 0}
      >
        Find Available Slots
      </button>

      {availableSlots.length > 0 && (
        <div className="available-slots">
          <h5>Suggested Times (Next 7 Days)</h5>
          {availableSlots.map((slot, index) => (
            <div key={index} className="time-slot">
              <div className="slot-time">
                <ClockIcon />
                <span>{new Date(slot.start).toLocaleString()}</span>
              </div>
              <div className="slot-duration">{slot.duration} minutes available</div>
              <button
                className="btn-select-slot"
                onClick={() => {
                  const start = new Date(slot.start);
                  setMeetingData(prev => ({
                    ...prev,
                    startDate: start.toISOString().split('T')[0],
                    startTime: start.toTimeString().substring(0, 5)
                  }));
                  setActiveTab('schedule');
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}

      {meetingData.attendees.length === 0 && (
        <div className="empty-state">
          <CalendarIcon />
          <p>Add attendees in the Schedule tab to find common free time slots</p>
        </div>
      )}
    </div>
  );

  const renderScheduledTab = () => (
    <div className="scheduled-meetings">
      <h4>Scheduled Meetings</h4>

      {scheduledMeetings.length === 0 ? (
        <div className="empty-state">
          <CalendarIcon />
          <p>No scheduled meetings yet</p>
        </div>
      ) : (
        <div className="meetings-list">
          {scheduledMeetings.map((meeting) => (
            <div key={meeting.roomId} className="meeting-card">
              <div className="meeting-header">
                <h5>{meeting.title}</h5>
                {meeting.recurring && (
                  <span className="recurring-badge">
                    <RepeatIcon />
                    Recurring
                  </span>
                )}
              </div>
              <div className="meeting-time">
                <ClockIcon />
                <span>{new Date(meeting.startTime).toLocaleString()}</span>
                <span className="duration">({meeting.duration} min)</span>
              </div>
              {meeting.attendees.length > 0 && (
                <div className="meeting-attendees">
                  {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}
                </div>
              )}
              <div className="meeting-actions">
                <button className="btn-join">Join</button>
                <button className="btn-cancel" onClick={() => {
                  socket?.emit('cancel-meeting', { roomId: meeting.roomId });
                }}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="meeting-scheduler-overlay" onClick={onClose}>
      <div className="meeting-scheduler" onClick={(e) => e.stopPropagation()}>
        <div className="scheduler-header">
          <h3>
            <CalendarIcon />
            Schedule Meeting
          </h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="scheduler-tabs">
          <button
            className={`scheduler-tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
          <button
            className={`scheduler-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Add to Calendar
          </button>
          <button
            className={`scheduler-tab ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            Find Time
          </button>
          <button
            className={`scheduler-tab ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            Scheduled
          </button>
        </div>

        <div className="scheduler-content">
          {activeTab === 'schedule' && renderScheduleTab()}
          {activeTab === 'calendar' && renderCalendarTab()}
          {activeTab === 'availability' && renderAvailabilityTab()}
          {activeTab === 'scheduled' && renderScheduledTab()}
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;
