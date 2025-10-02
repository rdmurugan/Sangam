/**
 * LMS Integration API Routes
 * Handles all LMS-related API endpoints
 */

const express = require('express');
const router = express.Router();
const lmsPlugin = require('../lmsPlugin');
const rosterService = require('../services/rosterService');
const gradeBookService = require('../services/gradeBookService');
const assignmentService = require('../services/assignmentService');

/**
 * Middleware: Check LMS license
 */
async function checkLMSLicense(req, res, next) {
  try {
    const { organizationId } = req.body;
    await lmsPlugin.checkLicense(req.user?.id, organizationId);
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: error.message,
      upgradeRequired: true
    });
  }
}

/**
 * LTI Launch Endpoint
 * POST /api/lms/lti/launch
 */
router.post('/lti/launch', async (req, res) => {
  await lmsPlugin.handleLTILaunch(req, res);
});

/**
 * Get plugin status
 * GET /api/lms/status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: lmsPlugin.getStatus()
  });
});

// ==================== ROSTER MANAGEMENT ====================

/**
 * Sync roster from LMS
 * POST /api/lms/roster/sync
 * Body: { organizationId, courseId, platform }
 */
router.post('/roster/sync', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, platform } = req.body;

    const result = await lmsPlugin.syncRoster(organizationId, courseId, platform);

    res.json({
      success: true,
      message: 'Roster synced successfully',
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get roster for a course
 * GET /api/lms/roster/:organizationId/:courseId
 */
router.get('/roster/:organizationId/:courseId', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId } = req.params;

    const roster = rosterService.getRoster(organizationId, courseId);

    if (!roster) {
      return res.status(404).json({ success: false, error: 'Roster not found' });
    }

    res.json({
      success: true,
      roster
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get roster statistics
 * GET /api/lms/roster/:organizationId/:courseId/statistics
 */
router.get('/roster/:organizationId/:courseId/statistics', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId } = req.params;

    const statistics = rosterService.getStatistics(organizationId, courseId);

    if (!statistics) {
      return res.status(404).json({ success: false, error: 'Roster not found' });
    }

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Export roster to CSV
 * GET /api/lms/roster/:organizationId/:courseId/export
 */
router.get('/roster/:organizationId/:courseId/export', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId } = req.params;

    const csv = rosterService.exportToCSV(organizationId, courseId);

    if (!csv) {
      return res.status(404).json({ success: false, error: 'Roster not found' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="roster-${courseId}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== GRADE BOOK ====================

/**
 * Create grade column
 * POST /api/lms/grades/column
 * Body: { organizationId, courseId, name, description, pointsPossible }
 */
router.post('/grades/column', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, ...columnData } = req.body;

    const column = await gradeBookService.createGradeColumn(organizationId, courseId, columnData);

    res.json({
      success: true,
      message: 'Grade column created',
      column
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Record grade
 * POST /api/lms/grades/record
 * Body: { organizationId, courseId, assignmentId, studentId, score, scoreMaximum, gradedBy }
 */
router.post('/grades/record', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId, studentId, ...gradeData } = req.body;

    const grade = await gradeBookService.recordGrade(organizationId, courseId, assignmentId, studentId, gradeData);

    res.json({
      success: true,
      message: 'Grade recorded',
      grade
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get grades for assignment
 * GET /api/lms/grades/:organizationId/:courseId/:assignmentId
 */
router.get('/grades/:organizationId/:courseId/:assignmentId', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId } = req.params;

    const grades = gradeBookService.getAssignmentGrades(organizationId, courseId, assignmentId);

    res.json({
      success: true,
      grades
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Sync grades to LMS
 * POST /api/lms/grades/sync
 * Body: { organizationId, courseId, assignmentId, platform }
 */
router.post('/grades/sync', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId, platform } = req.body;

    const connector = lmsPlugin.connectors[platform];
    if (!connector) {
      return res.status(400).json({ success: false, error: 'Unknown platform' });
    }

    const result = await gradeBookService.syncGradesToLMS(organizationId, courseId, assignmentId, connector);

    res.json({
      success: true,
      message: 'Grades synced to LMS',
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Sync attendance as grades
 * POST /api/lms/grades/attendance
 * Body: { organizationId, courseId, meetingId, platform }
 */
router.post('/grades/attendance', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, meetingId, platform } = req.body;

    // Get attendance report
    const analyticsService = require('../../../services/analyticsService');
    const attendanceReport = await analyticsService.getAttendanceReport(meetingId);

    const connector = lmsPlugin.connectors[platform];
    const result = await gradeBookService.syncAttendanceAsGrades(
      organizationId,
      courseId,
      meetingId,
      attendanceReport,
      connector
    );

    res.json({
      success: true,
      message: 'Attendance synced as grades',
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get grade statistics
 * GET /api/lms/grades/:organizationId/:courseId/:assignmentId/statistics
 */
router.get('/grades/:organizationId/:courseId/:assignmentId/statistics', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId } = req.params;

    const statistics = gradeBookService.getAssignmentStatistics(organizationId, courseId, assignmentId);

    if (!statistics) {
      return res.status(404).json({ success: false, error: 'No grades found' });
    }

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== ASSIGNMENTS ====================

/**
 * Create assignment
 * POST /api/lms/assignments
 * Body: { organizationId, courseId, name, description, dueAt, pointsPossible, ... }
 */
router.post('/assignments', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, ...assignmentData } = req.body;

    const assignment = await assignmentService.createAssignment(organizationId, courseId, assignmentData);

    res.json({
      success: true,
      message: 'Assignment created',
      assignment
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get course assignments
 * GET /api/lms/assignments/:organizationId/:courseId
 */
router.get('/assignments/:organizationId/:courseId', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId } = req.params;
    const { type, published } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (published !== undefined) filters.published = published === 'true';

    const assignments = assignmentService.getCourseAssignments(organizationId, courseId, filters);

    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get assignment by ID
 * GET /api/lms/assignments/:organizationId/:courseId/:assignmentId
 */
router.get('/assignments/:organizationId/:courseId/:assignmentId', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId } = req.params;

    const assignment = assignmentService.getAssignment(organizationId, courseId, assignmentId);

    if (!assignment) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.json({
      success: true,
      assignment
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Update assignment
 * PUT /api/lms/assignments/:organizationId/:courseId/:assignmentId
 * Body: { name, description, dueAt, ... }
 */
router.put('/assignments/:organizationId/:courseId/:assignmentId', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId } = req.params;
    const updates = req.body;

    const assignment = await assignmentService.updateAssignment(organizationId, courseId, assignmentId, updates);

    res.json({
      success: true,
      message: 'Assignment updated',
      assignment
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Sync assignment to LMS
 * POST /api/lms/assignments/:organizationId/:courseId/:assignmentId/sync
 * Body: { platform }
 */
router.post('/assignments/:organizationId/:courseId/:assignmentId/sync', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId } = req.params;
    const { platform } = req.body;

    const connector = lmsPlugin.connectors[platform];
    if (!connector) {
      return res.status(400).json({ success: false, error: 'Unknown platform' });
    }

    const result = await assignmentService.syncAssignmentToLMS(
      organizationId,
      courseId,
      assignmentId,
      connector,
      platform
    );

    res.json({
      success: true,
      message: 'Assignment synced to LMS',
      ...result
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Create submission
 * POST /api/lms/submissions
 * Body: { organizationId, courseId, assignmentId, studentId, url, comment, ... }
 */
router.post('/submissions', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId, ...submissionData } = req.body;

    const submission = await assignmentService.createSubmission(organizationId, courseId, assignmentId, submissionData);

    res.json({
      success: true,
      message: 'Submission created',
      submission
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get assignment submissions
 * GET /api/lms/submissions/:organizationId/:courseId/:assignmentId
 */
router.get('/submissions/:organizationId/:courseId/:assignmentId', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId } = req.params;

    const submissions = assignmentService.getAssignmentSubmissions(organizationId, courseId, assignmentId);

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * Get assignment statistics
 * GET /api/lms/assignments/:organizationId/:courseId/:assignmentId/statistics
 */
router.get('/assignments/:organizationId/:courseId/:assignmentId/statistics', checkLMSLicense, async (req, res) => {
  try {
    const { organizationId, courseId, assignmentId } = req.params;

    const statistics = assignmentService.getAssignmentStatistics(organizationId, courseId, assignmentId);

    if (!statistics) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ==================== COURSE MANAGEMENT ====================

/**
 * Get course details from LMS
 * GET /api/lms/course/:platform/:courseId
 */
router.get('/course/:platform/:courseId', checkLMSLicense, async (req, res) => {
  try {
    const { platform, courseId } = req.params;

    const course = await lmsPlugin.getCourse(courseId, platform);

    res.json({
      success: true,
      course
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
