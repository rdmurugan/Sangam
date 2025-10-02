// Calendar Integration Service
// Handles Google Calendar, Outlook, and iCal integration

const { google } = require('googleapis');
const ical = require('ical-generator');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

class CalendarService {
  constructor() {
    // Google Calendar OAuth2 client
    this.googleOAuth2Client = null;

    // Microsoft Graph client (for Outlook)
    this.microsoftGraphClient = null;

    // Scheduled meetings storage (in production, use database)
    this.scheduledMeetings = new Map(); // meetingId -> meeting data
    this.recurringMeetings = new Map(); // meetingId -> recurrence config
    this.reminders = new Map(); // meetingId -> reminder jobs

    // Email transporter for reminders
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // =====================================
  // Google Calendar Integration
  // =====================================

  /**
   * Initialize Google OAuth2 client
   */
  initializeGoogleAuth(clientId, clientSecret, redirectUri) {
    this.googleOAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    return this.googleOAuth2Client;
  }

  /**
   * Get Google Calendar authorization URL
   */
  getGoogleAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getGoogleTokens(code) {
    const { tokens } = await this.googleOAuth2Client.getToken(code);
    this.googleOAuth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Create event in Google Calendar
   */
  async createGoogleCalendarEvent(userId, eventData) {
    const calendar = google.calendar({ version: 'v3', auth: this.googleOAuth2Client });

    const event = {
      summary: eventData.title || 'Sangam Meeting',
      description: eventData.description || `Join meeting: ${eventData.meetingUrl}`,
      start: {
        dateTime: eventData.startTime,
        timeZone: eventData.timeZone || 'UTC'
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: eventData.timeZone || 'UTC'
      },
      attendees: eventData.attendees || [],
      conferenceData: {
        createRequest: {
          requestId: eventData.roomId,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 30 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    if (eventData.recurring) {
      event.recurrence = [this.generateRecurrenceRule(eventData.recurring)];
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    return response.data;
  }

  /**
   * Get user's calendar events
   */
  async getGoogleCalendarEvents(timeMin, timeMax) {
    const calendar = google.calendar({ version: 'v3', auth: this.googleOAuth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.data.items;
  }

  /**
   * Check availability (find free slots)
   */
  async checkGoogleCalendarAvailability(timeMin, timeMax, attendees) {
    const calendar = google.calendar({ version: 'v3', auth: this.googleOAuth2Client });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin,
        timeMax: timeMax,
        items: attendees.map(email => ({ id: email }))
      }
    });

    return response.data;
  }

  // =====================================
  // Microsoft Outlook Integration
  // =====================================

  /**
   * Create event in Outlook Calendar
   * Requires Microsoft Graph API token
   */
  async createOutlookCalendarEvent(accessToken, eventData) {
    // This would use Microsoft Graph Client
    // Implementation requires @microsoft/microsoft-graph-client package

    const event = {
      subject: eventData.title || 'Sangam Meeting',
      body: {
        contentType: 'HTML',
        content: `Join meeting: <a href="${eventData.meetingUrl}">${eventData.meetingUrl}</a>`
      },
      start: {
        dateTime: eventData.startTime,
        timeZone: eventData.timeZone || 'UTC'
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: eventData.timeZone || 'UTC'
      },
      attendees: eventData.attendees?.map(email => ({
        emailAddress: { address: email },
        type: 'required'
      })),
      isOnlineMeeting: true,
      onlineMeetingProvider: 'unknown',
      location: {
        displayName: 'Sangam Virtual Meeting',
        uri: eventData.meetingUrl
      }
    };

    // Note: Actual implementation would use Microsoft Graph SDK
    return {
      success: true,
      message: 'Outlook integration placeholder - implement with MS Graph SDK',
      event: event
    };
  }

  // =====================================
  // Apple Calendar (iCal) Support
  // =====================================

  /**
   * Generate iCal file for Apple Calendar
   */
  generateICalEvent(eventData) {
    const calendar = ical({ name: 'Sangam Meetings', timezone: eventData.timeZone || 'UTC' });

    const event = calendar.createEvent({
      start: new Date(eventData.startTime),
      end: new Date(eventData.endTime),
      summary: eventData.title || 'Sangam Meeting',
      description: `Join meeting: ${eventData.meetingUrl}\n\n${eventData.description || ''}`,
      location: eventData.meetingUrl,
      url: eventData.meetingUrl,
      organizer: {
        name: eventData.organizerName || 'Sangam',
        email: eventData.organizerEmail || 'noreply@sangam.com'
      },
      attendees: eventData.attendees?.map(email => ({
        email: email,
        rsvp: true
      }))
    });

    // Add recurrence if specified
    if (eventData.recurring) {
      event.repeating(this.parseRecurrence(eventData.recurring));
    }

    // Add reminders
    event.createAlarm({
      type: 'display',
      trigger: 600 // 10 minutes before
    });

    return calendar.toString();
  }

  /**
   * Download iCal file
   */
  getICalDownloadUrl(eventData) {
    const icalContent = this.generateICalEvent(eventData);
    const blob = Buffer.from(icalContent, 'utf-8');

    return {
      content: icalContent,
      filename: `sangam-meeting-${eventData.roomId}.ics`,
      mimeType: 'text/calendar'
    };
  }

  // =====================================
  // Recurring Meetings
  // =====================================

  /**
   * Schedule recurring meeting
   */
  scheduleRecurringMeeting(meetingData) {
    const { roomId, recurring, startTime } = meetingData;

    // Parse recurrence pattern
    const cronExpression = this.convertToCronExpression(recurring);

    // Schedule cron job
    const job = cron.schedule(cronExpression, () => {
      this.createScheduledMeeting(meetingData);
      this.sendMeetingReminders(meetingData);
    });

    this.recurringMeetings.set(roomId, {
      job: job,
      config: recurring,
      meetingData: meetingData
    });

    return {
      success: true,
      roomId: roomId,
      nextOccurrence: this.getNextOccurrence(cronExpression)
    };
  }

  /**
   * Convert recurrence config to cron expression
   */
  convertToCronExpression(recurring) {
    const { frequency, interval, dayOfWeek, time } = recurring;
    const [hour, minute] = time.split(':');

    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} */${interval} * *`;
      case 'weekly':
        return `${minute} ${hour} * * ${dayOfWeek}`;
      case 'monthly':
        return `${minute} ${hour} ${recurring.dayOfMonth} * *`;
      default:
        return `${minute} ${hour} * * *`; // daily by default
    }
  }

  /**
   * Generate iCal recurrence rule
   */
  generateRecurrenceRule(recurring) {
    const { frequency, interval, until, count } = recurring;

    let rule = `RRULE:FREQ=${frequency.toUpperCase()}`;

    if (interval) rule += `;INTERVAL=${interval}`;
    if (count) rule += `;COUNT=${count}`;
    if (until) rule += `;UNTIL=${until}`;

    if (recurring.dayOfWeek) {
      rule += `;BYDAY=${recurring.dayOfWeek.toUpperCase().substring(0, 2)}`;
    }

    return rule;
  }

  /**
   * Parse recurrence for iCal
   */
  parseRecurrence(recurring) {
    return {
      freq: recurring.frequency.toUpperCase(),
      interval: recurring.interval || 1,
      until: recurring.until ? new Date(recurring.until) : undefined,
      count: recurring.count,
      byDay: recurring.dayOfWeek ? [recurring.dayOfWeek.substring(0, 2).toUpperCase()] : undefined
    };
  }

  // =====================================
  // Auto-Reminders
  // =====================================

  /**
   * Schedule email reminder
   */
  scheduleEmailReminder(meetingData, minutesBefore = 30) {
    const { roomId, startTime, title, attendees } = meetingData;
    const reminderTime = new Date(new Date(startTime).getTime() - minutesBefore * 60000);

    // Calculate time until reminder
    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    if (delay > 0) {
      const timeout = setTimeout(() => {
        this.sendEmailReminder(meetingData);
      }, delay);

      if (!this.reminders.has(roomId)) {
        this.reminders.set(roomId, []);
      }
      this.reminders.get(roomId).push(timeout);
    }

    return { scheduled: delay > 0, reminderTime: reminderTime };
  }

  /**
   * Send email reminder
   */
  async sendEmailReminder(meetingData) {
    const { title, startTime, meetingUrl, attendees, organizerName } = meetingData;

    const mailOptions = {
      from: `"Sangam Meetings" <${process.env.SMTP_USER}>`,
      to: attendees.join(', '),
      subject: `Reminder: ${title} starting soon`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4a90e2; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #4a90e2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4a90e2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Meeting Reminder</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>This is a reminder that your meeting is starting soon!</p>

              <div class="details">
                <h3>${title}</h3>
                <p><strong>When:</strong> ${new Date(startTime).toLocaleString()}</p>
                <p><strong>Organized by:</strong> ${organizerName || 'Sangam'}</p>
              </div>

              <a href="${meetingUrl}" class="button">Join Meeting</a>

              <p style="color: #666; font-size: 14px;">
                Click the button above or copy this link to your browser:<br>
                <a href="${meetingUrl}">${meetingUrl}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email reminder sent for meeting: ${meetingData.roomId}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending email reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send multiple reminders (30 min, 10 min, 1 min before)
   */
  scheduleMeetingReminders(meetingData) {
    this.scheduleEmailReminder(meetingData, 30); // 30 minutes
    this.scheduleEmailReminder(meetingData, 10); // 10 minutes
    this.scheduleEmailReminder(meetingData, 1);  // 1 minute
  }

  // =====================================
  // Timezone Detection & Conversion
  // =====================================

  /**
   * Detect user timezone from IP or browser
   */
  detectTimezone(req) {
    // Try to get from request header
    const browserTz = req.headers['x-timezone'];
    if (browserTz) return browserTz;

    // Default to UTC
    return 'UTC';
  }

  /**
   * Convert time between timezones
   */
  convertTimezone(dateTime, fromTz, toTz) {
    const moment = require('moment-timezone');
    return moment.tz(dateTime, fromTz).tz(toTz).format();
  }

  /**
   * Get user's local time from UTC
   */
  toLocalTime(utcTime, userTimezone) {
    const moment = require('moment-timezone');
    return moment.utc(utcTime).tz(userTimezone).format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * Get all participants' timezones
   */
  getParticipantTimezones(participants) {
    return participants.map(p => ({
      name: p.name,
      email: p.email,
      timezone: p.timezone || 'UTC'
    }));
  }

  // =====================================
  // Availability Checker
  // =====================================

  /**
   * Find common free time slots for all participants
   */
  async findCommonFreeSlots(participants, duration, dateRange) {
    const freeSlots = [];
    const busyPeriods = [];

    // Get busy times for each participant
    for (const participant of participants) {
      if (participant.calendarProvider === 'google') {
        const availability = await this.checkGoogleCalendarAvailability(
          dateRange.start,
          dateRange.end,
          [participant.email]
        );
        busyPeriods.push(availability.calendars[participant.email].busy);
      }
    }

    // Find gaps where everyone is free
    const allBusyPeriods = this.mergeBusyPeriods(busyPeriods);
    const allFreeSlots = this.findFreePeriods(allBusyPeriods, dateRange, duration);

    return allFreeSlots;
  }

  /**
   * Merge overlapping busy periods
   */
  mergeBusyPeriods(busyPeriods) {
    const merged = [];
    const flat = busyPeriods.flat().sort((a, b) =>
      new Date(a.start) - new Date(b.start)
    );

    for (const period of flat) {
      if (merged.length === 0 || new Date(merged[merged.length - 1].end) < new Date(period.start)) {
        merged.push(period);
      } else {
        merged[merged.length - 1].end = new Date(
          Math.max(new Date(merged[merged.length - 1].end), new Date(period.end))
        ).toISOString();
      }
    }

    return merged;
  }

  /**
   * Find free periods between busy times
   */
  findFreePeriods(busyPeriods, dateRange, durationMinutes) {
    const freeSlots = [];
    let currentTime = new Date(dateRange.start);
    const endTime = new Date(dateRange.end);

    for (const busy of busyPeriods) {
      const busyStart = new Date(busy.start);

      // If there's a gap before this busy period
      if (busyStart - currentTime >= durationMinutes * 60000) {
        freeSlots.push({
          start: currentTime.toISOString(),
          end: busyStart.toISOString(),
          duration: (busyStart - currentTime) / 60000 // in minutes
        });
      }

      currentTime = new Date(busy.end);
    }

    // Check for free time after last busy period
    if (endTime - currentTime >= durationMinutes * 60000) {
      freeSlots.push({
        start: currentTime.toISOString(),
        end: endTime.toISOString(),
        duration: (endTime - currentTime) / 60000
      });
    }

    return freeSlots;
  }

  /**
   * Suggest best meeting times based on participant timezones
   */
  suggestMeetingTimes(participants, duration) {
    const moment = require('moment-timezone');
    const suggestions = [];

    // Find working hours overlap
    const workingHoursStart = 9; // 9 AM
    const workingHoursEnd = 17; // 5 PM

    // Get current date
    const today = moment();

    // Check next 7 days
    for (let day = 0; day < 7; day++) {
      const checkDate = today.clone().add(day, 'days');

      // Try each hour in working hours
      for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
        const proposedTime = checkDate.clone().hour(hour).minute(0);

        // Check if this time works for all participants
        const worksForAll = participants.every(p => {
          const localTime = proposedTime.clone().tz(p.timezone);
          const localHour = localTime.hour();
          return localHour >= workingHoursStart && localHour < workingHoursEnd;
        });

        if (worksForAll) {
          suggestions.push({
            utcTime: proposedTime.utc().format(),
            localTimes: participants.map(p => ({
              participant: p.name,
              time: proposedTime.clone().tz(p.timezone).format('YYYY-MM-DD HH:mm z')
            }))
          });
        }
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  // =====================================
  // Meeting Scheduling
  // =====================================

  /**
   * Create scheduled meeting
   */
  createScheduledMeeting(meetingData) {
    const { roomId, title, startTime, duration, attendees, recurring } = meetingData;

    this.scheduledMeetings.set(roomId, {
      ...meetingData,
      createdAt: new Date(),
      status: 'scheduled'
    });

    // Set up reminders
    this.scheduleMeetingReminders(meetingData);

    // If recurring, set up recurrence
    if (recurring) {
      this.scheduleRecurringMeeting(meetingData);
    }

    return {
      success: true,
      roomId: roomId,
      scheduledFor: startTime
    };
  }

  /**
   * Get scheduled meetings
   */
  getScheduledMeetings(userId) {
    const userMeetings = [];

    for (const [roomId, meeting] of this.scheduledMeetings) {
      if (meeting.organizerId === userId || meeting.attendees.includes(userId)) {
        userMeetings.push(meeting);
      }
    }

    return userMeetings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  /**
   * Cancel scheduled meeting
   */
  cancelScheduledMeeting(roomId) {
    // Clear reminders
    if (this.reminders.has(roomId)) {
      this.reminders.get(roomId).forEach(timeout => clearTimeout(timeout));
      this.reminders.delete(roomId);
    }

    // Stop recurring job
    if (this.recurringMeetings.has(roomId)) {
      this.recurringMeetings.get(roomId).job.stop();
      this.recurringMeetings.delete(roomId);
    }

    // Delete meeting
    this.scheduledMeetings.delete(roomId);

    return { success: true };
  }

  // =====================================
  // Cleanup
  // =====================================

  /**
   * Clean up expired meetings
   */
  cleanupExpiredMeetings() {
    const now = new Date();

    for (const [roomId, meeting] of this.scheduledMeetings) {
      const meetingEnd = new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000);

      if (meetingEnd < now) {
        this.scheduledMeetings.delete(roomId);
      }
    }
  }
}

module.exports = new CalendarService();
