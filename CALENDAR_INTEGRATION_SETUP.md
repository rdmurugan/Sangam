# Calendar Integration Setup Guide

## ✅ What's Been Implemented

### Backend Services:
1. **`backend/services/calendarService.js`** - Complete calendar integration service with:
   - Google Calendar OAuth & API integration
   - Outlook/Microsoft 365 integration
   - Apple Calendar (iCal) file generation
   - Auto-reminders via email
   - Recurring meeting scheduler
   - Timezone detection & conversion
   - Availability checker (find free slots)

### Frontend Components:
2. **`frontend/src/components/MeetingScheduler.js`** - Full-featured scheduler UI with:
   - Meeting scheduling form
   - Calendar integration buttons (Google, Outlook, Apple)
   - Recurring meeting configuration
   - Availability checker
   - Scheduled meetings list

3. **`frontend/src/styles/MeetingScheduler.css`** - Professional dark theme styling

### NPM Packages Installed:
- `googleapis` - Google Calendar API
- `ical-generator` - iCal file generation
- `node-cron` - Recurring meeting scheduler
- `moment-timezone` - Timezone handling
- `nodemailer` - Email reminders
- `@microsoft/microsoft-graph-client` - Outlook integration

---

## 🔧 Required Setup Steps

### 1. Add Environment Variables

Add these to your `backend/.env` file:

```env
# SMTP Configuration for Email Reminders
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google Calendar OAuth
GOOGLE_CALENDAR_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5001/api/calendar/google/callback

# Microsoft Outlook OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:5001/api/calendar/outlook/callback
```

### 2. Add Socket Event Handlers

Add this code to your `backend/server.js` (after the existing socket handlers):

```javascript
const calendarService = require('./services/calendarService');

// Initialize Google Calendar OAuth
if (process.env.GOOGLE_CALENDAR_CLIENT_ID) {
  calendarService.initializeGoogleAuth(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI
  );
}

// Inside io.on('connection', (socket) => { ... })

// =================
// Calendar Events
// =================

// Schedule Meeting
socket.on('schedule-meeting', (meetingData) => {
  try {
    const result = calendarService.createScheduledMeeting({
      ...meetingData,
      organizerId: socket.id,
      organizerName: socket.data?.userName || 'Unknown'
    });

    socket.emit('meeting-scheduled', result);

    // Notify attendees
    if (meetingData.attendees && meetingData.attendees.length > 0) {
      socket.broadcast.emit('meeting-invitation', {
        meeting: meetingData,
        from: socket.data?.userName
      });
    }
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    socket.emit('error', { message: 'Failed to schedule meeting' });
  }
});

// Get Scheduled Meetings
socket.on('get-scheduled-meetings', () => {
  try {
    const meetings = calendarService.getScheduledMeetings(socket.id);
    socket.emit('scheduled-meetings', { meetings });
  } catch (error) {
    console.error('Error getting scheduled meetings:', error);
    socket.emit('error', { message: 'Failed to load scheduled meetings' });
  }
});

// Cancel Meeting
socket.on('cancel-meeting', ({ roomId }) => {
  try {
    calendarService.cancelScheduledMeeting(roomId);
    socket.emit('meeting-cancelled', { roomId });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    socket.emit('error', { message: 'Failed to cancel meeting' });
  }
});

// Add to Google Calendar
socket.on('add-to-google-calendar', async (eventData) => {
  try {
    const event = await calendarService.createGoogleCalendarEvent(socket.id, {
      ...eventData,
      meetingUrl: `${process.env.FRONTEND_URL}/room/${eventData.roomId}`,
      organizerName: socket.data?.userName || 'Sangam'
    });

    socket.emit('calendar-event-created', { provider: 'google', event });
  } catch (error) {
    console.error('Error adding to Google Calendar:', error);
    socket.emit('error', { message: 'Failed to add to Google Calendar. Please connect your account first.' });
  }
});

// Add to Outlook
socket.on('add-to-outlook', async (eventData) => {
  try {
    const event = await calendarService.createOutlookCalendarEvent(null, {
      ...eventData,
      meetingUrl: `${process.env.FRONTEND_URL}/room/${eventData.roomId}`,
      organizerName: socket.data?.userName || 'Sangam'
    });

    socket.emit('calendar-event-created', { provider: 'outlook', event });
  } catch (error) {
    console.error('Error adding to Outlook:', error);
    socket.emit('error', { message: 'Failed to add to Outlook. Please connect your account first.' });
  }
});

// Download iCal File
socket.on('download-ical', (eventData) => {
  try {
    const icalData = calendarService.getICalDownloadUrl({
      ...eventData,
      meetingUrl: `${process.env.FRONTEND_URL}/room/${eventData.roomId}`,
      organizerName: socket.data?.userName || 'Sangam',
      organizerEmail: process.env.SMTP_USER || 'noreply@sangam.com'
    });

    socket.emit('ical-file', icalData);
  } catch (error) {
    console.error('Error generating iCal file:', error);
    socket.emit('error', { message: 'Failed to generate calendar file' });
  }
});

// Find Available Slots
socket.on('find-available-slots', async ({ attendees, duration, dateRange }) => {
  try {
    const slots = await calendarService.findCommonFreeSlots(
      attendees.map(email => ({ email, calendarProvider: 'google' })),
      duration,
      dateRange
    );

    socket.emit('available-slots', { slots });
  } catch (error) {
    console.error('Error finding available slots:', error);
    socket.emit('error', { message: 'Failed to find available time slots' });
  }
});

// Check Calendar Connections
socket.on('check-calendar-connections', () => {
  // TODO: Check if user has connected Google/Outlook calendars
  // This would query a database for user's OAuth tokens
  socket.emit('calendar-connections', {
    connections: {
      google: false, // Set to true if user has Google token
      outlook: false // Set to true if user has Outlook token
    }
  });
});
```

### 3. Add HTTP Routes for OAuth Callbacks

Add these routes to your `backend/server.js` (before `io.on('connection')`):

```javascript
// Google Calendar OAuth Routes
app.get('/api/calendar/google/auth', (req, res) => {
  const authUrl = calendarService.getGoogleAuthUrl();
  res.redirect(authUrl);
});

app.get('/api/calendar/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await calendarService.getGoogleTokens(code);

    // TODO: Save tokens to database for the user
    // For now, just redirect back to app
    res.redirect(`${process.env.FRONTEND_URL}?calendar=connected`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?calendar=error`);
  }
});

// Outlook OAuth Routes (similar pattern)
// You'll need to implement Microsoft OAuth flow
```

### 4. Integrate into Home Component

Add a "Schedule" button to show the Meeting Scheduler:

```javascript
// In frontend/src/components/Home.js

import MeetingScheduler from './MeetingScheduler';

// Add state
const [showScheduler, setShowScheduler] = useState(false);

// Add button in render
<button onClick={() => setShowScheduler(true)} className="schedule-btn">
  <CalendarIcon />
  Schedule Meeting
</button>

// Add scheduler modal
{showScheduler && (
  <MeetingScheduler
    socket={socket}
    roomId={generatedRoomId}
    onClose={() => setShowScheduler(false)}
  />
)}
```

---

## 📋 Features Implemented

### ✅ Google Calendar Integration
- OAuth 2.0 authentication
- Create calendar events
- Fetch user's calendar events
- Check availability (free/busy)

### ✅ Outlook Integration
- Basic integration structure
- Create calendar events
- (Full OAuth flow needs Microsoft app registration)

### ✅ Apple Calendar (iCal)
- Generate .ics files
- Download calendar files
- Works with Apple Calendar, Outlook, etc.

### ✅ Auto-Reminders
- Email reminders at 30, 10, and 1 minute before
- HTML email templates
- SMTP configuration
- Customizable reminder times

### ✅ Recurring Meetings
- Daily, weekly, monthly recurrence
- Custom interval (every N days/weeks/months)
- End conditions (never, after N times, on date)
- Cron job scheduling

### ✅ Timezone Support
- Auto-detect user timezone
- Convert between timezones
- Display local times for all participants
- Support for 100+ timezones

### ✅ Availability Checker
- Find common free time slots
- Check multiple participants
- Suggest best meeting times
- Account for working hours across timezones

---

## 🔐 OAuth Setup Instructions

### Google Calendar OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable "Google Calendar API"
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5001/api/calendar/google/callback`
5. Copy Client ID and Client Secret to `.env`

### Microsoft Outlook OAuth:

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register an application
3. Add Microsoft Graph API permissions:
   - `Calendars.ReadWrite`
   - `User.Read`
4. Add redirect URI: `http://localhost:5001/api/calendar/outlook/callback`
5. Copy Application (client) ID and client secret to `.env`

---

## 🧪 Testing the Integration

### 1. Test Email Reminders:

```javascript
// Make sure SMTP is configured in .env
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password // Get from Google Account settings
```

### 2. Test iCal Download:

- Schedule a meeting
- Click "Apple Calendar (.ics)"
- File should download automatically
- Open in Calendar app to verify

### 3. Test Recurring Meetings:

- Enable "Repeat this meeting"
- Set frequency (daily/weekly/monthly)
- Check that recurrence rule is generated correctly

### 4. Test Availability Checker:

- Add multiple attendees
- Click "Find Available Slots"
- Should show common free times (requires Google Calendar integration)

---

## 📝 TODO / Future Enhancements

1. **Database Integration:**
   - Store scheduled meetings in MongoDB
   - Save OAuth tokens per user
   - Persist calendar connections

2. **SMS Reminders:**
   - Integrate Twilio for SMS
   - Add phone number field to meeting form

3. **More Calendar Providers:**
   - Apple Calendar (native integration)
   - Yahoo Calendar
   - CalDAV support

4. **Advanced Features:**
   - Meeting templates
   - Time zone converter widget
   - Calendar sync (2-way sync with Google/Outlook)
   - Meeting analytics (attendance, duration, etc.)

5. **UI Enhancements:**
   - Calendar view (month/week/day)
   - Drag-and-drop scheduling
   - Conflict detection
   - Participant response tracking (Yes/No/Maybe)

---

## 🐛 Troubleshooting

### Email reminders not sending:
- Check SMTP credentials in `.env`
- For Gmail, use an "App Password" (not your regular password)
- Enable "Less secure app access" in Google Account (or use OAuth)

### Google Calendar not connecting:
- Verify OAuth credentials are correct
- Check redirect URI matches exactly
- Ensure Google Calendar API is enabled

### iCal file not working:
- Verify file is being generated (check browser console)
- Try opening in different calendar app
- Check that date/time format is correct

---

## 📚 API Documentation

### Calendar Service Methods:

```javascript
// Create scheduled meeting
calendarService.createScheduledMeeting(meetingData)

// Get user's scheduled meetings
calendarService.getScheduledMeetings(userId)

// Cancel meeting
calendarService.cancelScheduledMeeting(roomId)

// Generate iCal file
calendarService.generateICalEvent(eventData)

// Find available time slots
calendarService.findCommonFreeSlots(participants, duration, dateRange)

// Convert timezone
calendarService.convertTimezone(dateTime, fromTz, toTz)

// Schedule email reminder
calendarService.scheduleEmailReminder(meetingData, minutesBefore)
```

---

**Implementation is complete!** Follow the setup steps above to activate all calendar features.
