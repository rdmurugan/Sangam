/**
 * LMS Plugin for Sangam
 * Provides Learning Management System integration capabilities
 * Supports: Canvas, Moodle, Blackboard, Google Classroom
 *
 * Features:
 * - LTI 1.3 Integration
 * - SSO Authentication
 * - Roster Sync
 * - Grade Book Integration
 * - Assignment Submission
 * - Deep Linking
 */

const ltiService = require('./services/ltiService');
const canvasConnector = require('./connectors/canvasConnector');
const moodleConnector = require('./connectors/moodleConnector');
const blackboardConnector = require('./connectors/blackboardConnector');
const googleClassroomConnector = require('./connectors/googleClassroomConnector');
const rosterService = require('./services/rosterService');
const gradeBookService = require('./services/gradeBookService');
const assignmentService = require('./services/assignmentService');

class LMSPlugin {
  constructor() {
    this.name = 'LMS Integration';
    this.version = '1.0.0';
    this.enabled = false;
    this.connectors = {
      canvas: canvasConnector,
      moodle: moodleConnector,
      blackboard: blackboardConnector,
      googleClassroom: googleClassroomConnector
    };
    this.config = {};
  }

  /**
   * Initialize the LMS plugin
   */
  async initialize(config) {
    console.log('Initializing LMS Plugin...');
    this.config = config;
    this.enabled = true;

    // Initialize LTI service
    await ltiService.initialize(config.lti);

    // Initialize connectors
    for (const [name, connector] of Object.entries(this.connectors)) {
      if (config.platforms && config.platforms[name]?.enabled) {
        await connector.initialize(config.platforms[name]);
        console.log(`✓ ${name} connector initialized`);
      }
    }

    console.log('✓ LMS Plugin initialized successfully');
  }

  /**
   * Check if user has LMS license
   */
  async checkLicense(userId, organizationId) {
    const licenseConfig = require('../../config/licenseConfig');
    const licenseService = require('../../services/licenseService');
    const license = await licenseService.getLicenseByOrganization(organizationId);

    if (!license) {
      throw new Error('No license found for this organization');
    }

    // Get the tier configuration
    const tier = licenseConfig.getLicenseTier(license.tier);

    if (!tier) {
      throw new Error('Invalid license tier');
    }

    // Check if license includes LMS integration (INSTITUTIONAL tier feature)
    const hasLMSIntegration = tier.institutionalFeatures?.lmsIntegration === true;

    if (!hasLMSIntegration) {
      throw new Error(
        `LMS integration requires Institutional plan. Current plan: ${tier.displayName}. ` +
        'Please upgrade to access LMS features.'
      );
    }

    return true;
  }

  /**
   * LTI Launch (Deep Linking from LMS)
   */
  async handleLTILaunch(req, res) {
    try {
      const { id_token } = req.body;
      const ltiData = await ltiService.validateLaunch(id_token);

      // Create or find user based on LTI data
      const user = await this.findOrCreateUser(ltiData);

      // Create meeting based on context
      const meeting = await this.createMeetingFromLTI(ltiData);

      // Return launch URL
      res.json({
        success: true,
        redirectUrl: `/meeting/${meeting.id}`,
        user,
        context: ltiData.context
      });
    } catch (error) {
      console.error('LTI Launch Error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Sync roster from LMS
   */
  async syncRoster(organizationId, courseId, platform) {
    const connector = this.connectors[platform];
    if (!connector) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const roster = await connector.getRoster(courseId);
    await rosterService.updateRoster(organizationId, courseId, roster);

    return {
      success: true,
      studentsCount: roster.students.length,
      instructorsCount: roster.instructors.length
    };
  }

  /**
   * Send grades to LMS
   */
  async sendGrade(assignmentId, studentId, grade, platform) {
    const connector = this.connectors[platform];
    if (!connector) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const result = await connector.sendGrade(assignmentId, studentId, grade);
    await gradeBookService.recordGrade(assignmentId, studentId, grade, result);

    return result;
  }

  /**
   * Sync attendance to grade book
   */
  async syncAttendanceToGrades(meetingId, platform) {
    const analyticsService = require('../../services/analyticsService');
    const attendance = await analyticsService.getAttendanceReport(meetingId);

    const connector = this.connectors[platform];
    if (!connector) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    // Send attendance as grades
    const results = [];
    for (const participant of attendance.participants) {
      const grade = this.calculateAttendanceGrade(participant);
      const result = await connector.sendGrade(
        attendance.assignmentId,
        participant.userId,
        grade
      );
      results.push(result);
    }

    return {
      success: true,
      gradesSent: results.length,
      results
    };
  }

  /**
   * Create assignment in LMS
   */
  async createAssignment(courseId, assignmentData, platform) {
    const connector = this.connectors[platform];
    if (!connector) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const assignment = await connector.createAssignment(courseId, assignmentData);
    await assignmentService.saveAssignment(assignment);

    return assignment;
  }

  /**
   * Submit assignment to LMS
   */
  async submitAssignment(assignmentId, studentId, submission, platform) {
    const connector = this.connectors[platform];
    if (!connector) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const result = await connector.submitAssignment(assignmentId, studentId, submission);
    await assignmentService.recordSubmission(assignmentId, studentId, submission);

    return result;
  }

  /**
   * Get LMS course details
   */
  async getCourse(courseId, platform) {
    const connector = this.connectors[platform];
    if (!connector) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    return await connector.getCourse(courseId);
  }

  /**
   * Helper: Find or create user from LTI data
   */
  async findOrCreateUser(ltiData) {
    const User = require('../../models/User');

    let user = await User.findOne({ lmsId: ltiData.sub });

    if (!user) {
      user = await User.create({
        name: ltiData.name || ltiData.given_name + ' ' + ltiData.family_name,
        email: ltiData.email,
        lmsId: ltiData.sub,
        lmsPlatform: ltiData.platform,
        roles: ltiData.roles || []
      });
    }

    return user;
  }

  /**
   * Helper: Create meeting from LTI context
   */
  async createMeetingFromLTI(ltiData) {
    const Room = require('../../models/Room');

    const meeting = await Room.create({
      name: ltiData.context?.label || 'LMS Meeting',
      hostId: ltiData.sub,
      lmsContext: {
        platform: ltiData.platform,
        courseId: ltiData.context?.id,
        courseName: ltiData.context?.title,
        resourceLinkId: ltiData.resource_link?.id
      },
      settings: {
        waitingRoomEnabled: true,
        recordingEnabled: true
      }
    });

    return meeting;
  }

  /**
   * Helper: Calculate attendance grade
   */
  calculateAttendanceGrade(participant) {
    const { duration, wasLate, leftEarly } = participant;

    let grade = 100;

    if (wasLate) {
      grade -= 10;
    }

    if (leftEarly) {
      grade -= 15;
    }

    // Deduct points for low duration (less than 80% of expected)
    const expectedDuration = 3600; // 60 minutes
    if (duration < expectedDuration * 0.8) {
      grade -= 20;
    }

    return Math.max(grade, 0);
  }

  /**
   * Get plugin status
   */
  getStatus() {
    return {
      name: this.name,
      version: this.version,
      enabled: this.enabled,
      platforms: Object.keys(this.connectors).filter(
        name => this.config.platforms?.[name]?.enabled
      )
    };
  }

  /**
   * Disable plugin
   */
  async disable() {
    this.enabled = false;
    console.log('LMS Plugin disabled');
  }
}

module.exports = new LMSPlugin();
