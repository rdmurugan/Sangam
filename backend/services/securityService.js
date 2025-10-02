// Security Service for Enhanced Security & Moderation
// Handles role-based access, permissions, audit logging, and compliance

class SecurityService {
  constructor() {
    // Role hierarchy
    this.roles = {
      HOST: { level: 3, permissions: ['all'] },
      CO_HOST: { level: 2, permissions: ['manage_participants', 'moderate_chat', 'manage_breakout', 'manage_polls', 'share_screen', 'record'] },
      MODERATOR: { level: 1, permissions: ['moderate_chat', 'mute_participants', 'remove_participants'] },
      PARTICIPANT: { level: 0, permissions: ['send_chat', 'share_screen', 'react', 'vote'] }
    };

    // Profanity filter - expandable list
    this.profanityList = [
      'badword1', 'badword2', 'offensive', 'inappropriate',
      // Add more words as needed
    ];

    // Audit log storage (in production, use database)
    this.auditLogs = new Map(); // roomId -> logs array

    // Blocked users per room
    this.blockedUsers = new Map(); // roomId -> Set of socketIds

    // Meeting locks
    this.lockedMeetings = new Set(); // Set of locked roomIds
  }

  // Role Management
  hasPermission(userRole, permission) {
    const role = this.roles[userRole];
    if (!role) return false;

    // HOST has all permissions
    if (userRole === 'HOST') return true;

    return role.permissions.includes(permission);
  }

  canModerate(userRole) {
    return ['HOST', 'CO_HOST', 'MODERATOR'].includes(userRole);
  }

  isHost(userRole) {
    return userRole === 'HOST';
  }

  isCoHost(userRole) {
    return userRole === 'CO_HOST';
  }

  // Meeting Lock
  lockMeeting(roomId) {
    this.lockedMeetings.add(roomId);
    this.logAction(roomId, 'MEETING_LOCKED', { timestamp: Date.now() });
    return true;
  }

  unlockMeeting(roomId) {
    this.lockedMeetings.delete(roomId);
    this.logAction(roomId, 'MEETING_UNLOCKED', { timestamp: Date.now() });
    return true;
  }

  isMeetingLocked(roomId) {
    return this.lockedMeetings.has(roomId);
  }

  // User Blocking
  blockUser(roomId, socketId, userName, reason, blockedBy) {
    if (!this.blockedUsers.has(roomId)) {
      this.blockedUsers.set(roomId, new Set());
    }
    this.blockedUsers.get(roomId).add(socketId);

    this.logAction(roomId, 'USER_BLOCKED', {
      socketId,
      userName,
      reason,
      blockedBy,
      timestamp: Date.now()
    });

    return true;
  }

  unblockUser(roomId, socketId) {
    if (this.blockedUsers.has(roomId)) {
      this.blockedUsers.get(roomId).delete(socketId);
      this.logAction(roomId, 'USER_UNBLOCKED', {
        socketId,
        timestamp: Date.now()
      });
    }
    return true;
  }

  isUserBlocked(roomId, socketId) {
    if (!this.blockedUsers.has(roomId)) return false;
    return this.blockedUsers.get(roomId).has(socketId);
  }

  // Profanity Filter
  containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return this.profanityList.some(word => lowerText.includes(word));
  }

  filterProfanity(text) {
    let filtered = text;
    this.profanityList.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
  }

  // Audit Logging
  logAction(roomId, action, details) {
    if (!this.auditLogs.has(roomId)) {
      this.auditLogs.set(roomId, []);
    }

    const log = {
      action,
      timestamp: Date.now(),
      ...details
    };

    this.auditLogs.get(roomId).push(log);

    // In production, persist to database
    // console.log(`[AUDIT] Room ${roomId}: ${action}`, details);

    return log;
  }

  getAuditLogs(roomId, limit = 100) {
    const logs = this.auditLogs.get(roomId) || [];
    return logs.slice(-limit);
  }

  exportAuditLogs(roomId) {
    const logs = this.auditLogs.get(roomId) || [];
    return {
      roomId,
      exportedAt: new Date().toISOString(),
      totalEvents: logs.length,
      logs: logs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp).toISOString()
      }))
    };
  }

  // Reporting
  createReport(roomId, reportedBy, reportedUser, reason, details) {
    const report = {
      id: `report-${Date.now()}`,
      roomId,
      reportedBy,
      reportedUser,
      reason,
      details,
      timestamp: Date.now(),
      status: 'PENDING'
    };

    this.logAction(roomId, 'USER_REPORTED', {
      reportId: report.id,
      reportedBy,
      reportedUser,
      reason
    });

    // In production, store in database and notify admins
    return report;
  }

  // Watermarking
  generateWatermark(userName, socketId, roomId) {
    return {
      text: `${userName} • ${roomId} • ${new Date().toLocaleString()}`,
      userId: socketId,
      timestamp: Date.now()
    };
  }

  // Screenshot Prevention (client-side detection)
  detectScreenshot() {
    // This is a detection mechanism, not prevention
    // Client-side will implement actual prevention
    this.logAction('global', 'SCREENSHOT_DETECTED', {
      timestamp: Date.now()
    });
  }

  // Compliance Modes
  getComplianceSettings(mode) {
    const complianceModes = {
      HIPAA: {
        requireE2EE: true,
        requireAuditLogs: true,
        maxRecordingRetention: 6 * 365, // 6 years in days
        requireParticipantConsent: true,
        allowRecording: true,
        allowScreenshot: false,
        dataResidency: 'US',
        requireBusinessAssociate: true
      },
      GDPR: {
        requireE2EE: false,
        requireAuditLogs: true,
        maxRecordingRetention: 30, // 30 days
        requireParticipantConsent: true,
        allowRecording: true,
        allowScreenshot: true,
        dataResidency: 'EU',
        rightToErasure: true,
        dataPortability: true
      },
      SOC2: {
        requireE2EE: true,
        requireAuditLogs: true,
        maxRecordingRetention: 90, // 90 days
        requireParticipantConsent: false,
        allowRecording: true,
        allowScreenshot: true,
        requireMFA: true,
        requireAccessControls: true
      },
      STANDARD: {
        requireE2EE: false,
        requireAuditLogs: false,
        maxRecordingRetention: 365,
        requireParticipantConsent: false,
        allowRecording: true,
        allowScreenshot: true
      }
    };

    return complianceModes[mode] || complianceModes.STANDARD;
  }

  // Session Security
  validateSession(sessionId, roomId) {
    // In production, validate JWT tokens, session expiry, etc.
    return true;
  }

  generateSecureRoomId() {
    // Generate cryptographically secure room ID
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('hex');
  }

  // Rate Limiting (basic implementation)
  checkRateLimit(socketId, action, limit = 10, window = 60000) {
    // In production, use Redis for distributed rate limiting
    // This is a simplified version
    return true; // Allow for now
  }

  // Data Sanitization
  sanitizeInput(input) {
    // Remove potential XSS, SQL injection, etc.
    if (typeof input !== 'string') return input;

    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Clean up room data
  cleanupRoom(roomId) {
    this.blockedUsers.delete(roomId);
    this.lockedMeetings.delete(roomId);

    // Archive audit logs before cleanup
    const logs = this.auditLogs.get(roomId);
    if (logs && logs.length > 0) {
      this.logAction(roomId, 'ROOM_CLEANUP', {
        totalLogs: logs.length,
        timestamp: Date.now()
      });
      // In production, move to long-term storage
    }

    // Keep audit logs for compliance, don't delete
    // this.auditLogs.delete(roomId);
  }
}

module.exports = new SecurityService();
