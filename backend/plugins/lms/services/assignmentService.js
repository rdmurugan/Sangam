/**
 * Assignment Service
 * Manages assignments and submissions for LMS integration
 */

class AssignmentService {
  constructor() {
    this.assignments = new Map(); // assignmentId -> assignment data
    this.submissions = new Map(); // submissionId -> submission data
    this.assignmentMappings = new Map(); // sangamMeetingId -> lmsAssignmentId
  }

  /**
   * Create assignment
   */
  async createAssignment(organizationId, courseId, assignmentData) {
    const assignmentId = this.generateAssignmentId();

    const assignment = {
      id: assignmentId,
      organizationId,
      courseId,
      name: assignmentData.name,
      description: assignmentData.description,
      type: assignmentData.type || 'meeting', // meeting, quiz, discussion, file_upload
      pointsPossible: assignmentData.pointsPossible || 100,
      dueAt: assignmentData.dueAt ? new Date(assignmentData.dueAt) : null,
      availableFrom: assignmentData.availableFrom ? new Date(assignmentData.availableFrom) : new Date(),
      availableUntil: assignmentData.availableUntil ? new Date(assignmentData.availableUntil) : null,
      published: assignmentData.published !== false,
      allowLateSubmission: assignmentData.allowLateSubmission || false,
      meetingId: assignmentData.meetingId || null,
      launchUrl: assignmentData.launchUrl || null,
      createdAt: new Date(),
      createdBy: assignmentData.createdBy,
      syncedToLMS: false,
      lmsAssignmentId: null,
      lmsPlatform: null,
      metadata: assignmentData.metadata || {}
    };

    const assignmentKey = `${organizationId}:${courseId}:${assignmentId}`;
    this.assignments.set(assignmentKey, assignment);

    // Create mapping if this is a meeting assignment
    if (assignment.meetingId) {
      this.assignmentMappings.set(assignment.meetingId, assignmentId);
    }

    console.log(`✓ Assignment created: ${assignment.name} (${assignment.pointsPossible} points)`);

    return assignment;
  }

  /**
   * Get assignment by ID
   */
  getAssignment(organizationId, courseId, assignmentId) {
    const assignmentKey = `${organizationId}:${courseId}:${assignmentId}`;
    return this.assignments.get(assignmentKey) || null;
  }

  /**
   * Get assignment by meeting ID
   */
  getAssignmentByMeeting(meetingId) {
    const assignmentId = this.assignmentMappings.get(meetingId);
    if (!assignmentId) return null;

    // Find the assignment in the map
    for (const [key, assignment] of this.assignments.entries()) {
      if (assignment.id === assignmentId) {
        return assignment;
      }
    }

    return null;
  }

  /**
   * Get all assignments for a course
   */
  getCourseAssignments(organizationId, courseId, filters = {}) {
    const assignments = [];
    const prefix = `${organizationId}:${courseId}:`;

    for (const [key, assignment] of this.assignments.entries()) {
      if (key.startsWith(prefix)) {
        // Apply filters
        if (filters.type && assignment.type !== filters.type) continue;
        if (filters.published !== undefined && assignment.published !== filters.published) continue;
        if (filters.syncedToLMS !== undefined && assignment.syncedToLMS !== filters.syncedToLMS) continue;

        assignments.push(assignment);
      }
    }

    // Sort by due date (earliest first)
    return assignments.sort((a, b) => {
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return a.dueAt - b.dueAt;
    });
  }

  /**
   * Update assignment
   */
  async updateAssignment(organizationId, courseId, assignmentId, updates) {
    const assignmentKey = `${organizationId}:${courseId}:${assignmentId}`;
    const assignment = this.assignments.get(assignmentKey);

    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    // Apply updates
    if (updates.name !== undefined) assignment.name = updates.name;
    if (updates.description !== undefined) assignment.description = updates.description;
    if (updates.pointsPossible !== undefined) assignment.pointsPossible = updates.pointsPossible;
    if (updates.dueAt !== undefined) assignment.dueAt = updates.dueAt ? new Date(updates.dueAt) : null;
    if (updates.availableFrom !== undefined) assignment.availableFrom = new Date(updates.availableFrom);
    if (updates.availableUntil !== undefined) assignment.availableUntil = updates.availableUntil ? new Date(updates.availableUntil) : null;
    if (updates.published !== undefined) assignment.published = updates.published;
    if (updates.allowLateSubmission !== undefined) assignment.allowLateSubmission = updates.allowLateSubmission;
    if (updates.metadata !== undefined) assignment.metadata = { ...assignment.metadata, ...updates.metadata };

    assignment.updatedAt = new Date();
    assignment.syncedToLMS = false; // Mark for re-sync

    this.assignments.set(assignmentKey, assignment);

    return assignment;
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(organizationId, courseId, assignmentId) {
    const assignmentKey = `${organizationId}:${courseId}:${assignmentId}`;
    const assignment = this.assignments.get(assignmentKey);

    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    // Delete assignment
    this.assignments.delete(assignmentKey);

    // Delete mapping if exists
    if (assignment.meetingId) {
      this.assignmentMappings.delete(assignment.meetingId);
    }

    // Delete all submissions for this assignment
    this.deleteAssignmentSubmissions(organizationId, courseId, assignmentId);

    console.log(`✓ Assignment deleted: ${assignment.name}`);

    return true;
  }

  /**
   * Sync assignment to LMS
   */
  async syncAssignmentToLMS(organizationId, courseId, assignmentId, connector, platform) {
    const assignmentKey = `${organizationId}:${courseId}:${assignmentId}`;
    const assignment = this.assignments.get(assignmentKey);

    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    try {
      // Create assignment in LMS
      const lmsAssignment = await connector.createAssignment(courseId, {
        name: assignment.name,
        description: assignment.description,
        pointsPossible: assignment.pointsPossible,
        dueAt: assignment.dueAt,
        launchUrl: assignment.launchUrl,
        published: assignment.published
      });

      // Update assignment with LMS info
      assignment.syncedToLMS = true;
      assignment.lmsAssignmentId = lmsAssignment.id;
      assignment.lmsPlatform = platform;
      assignment.lmsSyncedAt = new Date();

      this.assignments.set(assignmentKey, assignment);

      console.log(`✓ Assignment synced to ${platform}: ${assignment.name}`);

      return {
        success: true,
        lmsAssignmentId: lmsAssignment.id,
        lmsUrl: lmsAssignment.htmlUrl
      };
    } catch (error) {
      console.error(`✗ Failed to sync assignment to ${platform}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create submission
   */
  async createSubmission(organizationId, courseId, assignmentId, submissionData) {
    const assignment = this.getAssignment(organizationId, courseId, assignmentId);

    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    const submissionId = this.generateSubmissionId();

    const submission = {
      id: submissionId,
      organizationId,
      courseId,
      assignmentId,
      studentId: submissionData.studentId,
      studentName: submissionData.studentName,
      type: submissionData.type || 'online_url', // online_url, online_text, file_upload
      url: submissionData.url || null,
      text: submissionData.text || null,
      files: submissionData.files || [],
      comment: submissionData.comment || null,
      submittedAt: new Date(),
      late: this.isLateSubmission(assignment.dueAt),
      grade: null,
      gradedAt: null,
      gradedBy: null,
      feedback: null,
      syncedToLMS: false,
      lmsSubmissionId: null,
      metadata: submissionData.metadata || {}
    };

    const submissionKey = `${organizationId}:${courseId}:${assignmentId}:${submissionData.studentId}`;
    this.submissions.set(submissionKey, submission);

    console.log(`✓ Submission created for ${submissionData.studentName}: ${assignment.name}`);

    return submission;
  }

  /**
   * Get submission
   */
  getSubmission(organizationId, courseId, assignmentId, studentId) {
    const submissionKey = `${organizationId}:${courseId}:${assignmentId}:${studentId}`;
    return this.submissions.get(submissionKey) || null;
  }

  /**
   * Get all submissions for an assignment
   */
  getAssignmentSubmissions(organizationId, courseId, assignmentId) {
    const submissions = [];
    const prefix = `${organizationId}:${courseId}:${assignmentId}:`;

    for (const [key, submission] of this.submissions.entries()) {
      if (key.startsWith(prefix)) {
        submissions.push(submission);
      }
    }

    return submissions.sort((a, b) => b.submittedAt - a.submittedAt);
  }

  /**
   * Get all submissions for a student in a course
   */
  getStudentSubmissions(organizationId, courseId, studentId) {
    const submissions = [];
    const coursePrefix = `${organizationId}:${courseId}:`;

    for (const [key, submission] of this.submissions.entries()) {
      if (key.startsWith(coursePrefix) && submission.studentId === studentId) {
        submissions.push(submission);
      }
    }

    return submissions.sort((a, b) => b.submittedAt - a.submittedAt);
  }

  /**
   * Update submission
   */
  async updateSubmission(organizationId, courseId, assignmentId, studentId, updates) {
    const submissionKey = `${organizationId}:${courseId}:${assignmentId}:${studentId}`;
    const submission = this.submissions.get(submissionKey);

    if (!submission) {
      throw new Error(`Submission not found for student ${studentId} in assignment ${assignmentId}`);
    }

    // Apply updates
    if (updates.url !== undefined) submission.url = updates.url;
    if (updates.text !== undefined) submission.text = updates.text;
    if (updates.files !== undefined) submission.files = updates.files;
    if (updates.comment !== undefined) submission.comment = updates.comment;
    if (updates.grade !== undefined) {
      submission.grade = updates.grade;
      submission.gradedAt = new Date();
      submission.gradedBy = updates.gradedBy;
    }
    if (updates.feedback !== undefined) submission.feedback = updates.feedback;

    submission.updatedAt = new Date();
    submission.syncedToLMS = false; // Mark for re-sync

    this.submissions.set(submissionKey, submission);

    return submission;
  }

  /**
   * Grade submission
   */
  async gradeSubmission(organizationId, courseId, assignmentId, studentId, gradeData) {
    return await this.updateSubmission(organizationId, courseId, assignmentId, studentId, {
      grade: gradeData.grade,
      gradedBy: gradeData.gradedBy,
      feedback: gradeData.feedback
    });
  }

  /**
   * Sync submission to LMS
   */
  async syncSubmissionToLMS(organizationId, courseId, assignmentId, studentId, connector) {
    const submission = this.getSubmission(organizationId, courseId, assignmentId, studentId);
    const assignment = this.getAssignment(organizationId, courseId, assignmentId);

    if (!submission) {
      throw new Error(`Submission not found for student ${studentId}`);
    }

    if (!assignment.lmsAssignmentId) {
      throw new Error('Assignment not synced to LMS');
    }

    try {
      const lmsSubmission = await connector.submitAssignment(
        assignment.lmsAssignmentId,
        studentId,
        {
          url: submission.url,
          comment: submission.comment
        }
      );

      submission.syncedToLMS = true;
      submission.lmsSubmissionId = lmsSubmission.submissionId;
      submission.lmsSyncedAt = new Date();

      const submissionKey = `${organizationId}:${courseId}:${assignmentId}:${studentId}`;
      this.submissions.set(submissionKey, submission);

      console.log(`✓ Submission synced to LMS for student ${studentId}`);

      return {
        success: true,
        lmsSubmissionId: lmsSubmission.submissionId
      };
    } catch (error) {
      console.error(`✗ Failed to sync submission to LMS:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Auto-submit meeting attendance as assignment
   */
  async autoSubmitMeetingAttendance(meetingId, meetingData, attendanceData) {
    const assignment = this.getAssignmentByMeeting(meetingId);

    if (!assignment) {
      console.log(`No assignment found for meeting ${meetingId}`);
      return null;
    }

    const submissions = [];

    // Create submissions for all attendees
    for (const participant of attendanceData.participants) {
      try {
        const submission = await this.createSubmission(
          assignment.organizationId,
          assignment.courseId,
          assignment.id,
          {
            studentId: participant.userId,
            studentName: participant.name,
            type: 'online_url',
            url: `https://sangam.com/meetings/${meetingId}/attendance`,
            comment: `Attended meeting for ${Math.round(participant.duration / 60000)} minutes`,
            metadata: {
              duration: participant.duration,
              joinedAt: participant.joinedAt,
              leftAt: participant.leftAt,
              attendancePercentage: Math.round((participant.duration / meetingData.duration) * 100)
            }
          }
        );

        submissions.push(submission);
      } catch (error) {
        console.error(`Failed to create submission for ${participant.name}:`, error.message);
      }
    }

    console.log(`✓ Auto-submitted ${submissions.length} attendance submissions for meeting ${meetingId}`);

    return {
      assignmentId: assignment.id,
      assignmentName: assignment.name,
      submissions: submissions.length
    };
  }

  /**
   * Delete assignment submissions
   */
  deleteAssignmentSubmissions(organizationId, courseId, assignmentId) {
    const prefix = `${organizationId}:${courseId}:${assignmentId}:`;
    let deletedCount = 0;

    for (const key of this.submissions.keys()) {
      if (key.startsWith(prefix)) {
        this.submissions.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get assignment statistics
   */
  getAssignmentStatistics(organizationId, courseId, assignmentId) {
    const assignment = this.getAssignment(organizationId, courseId, assignmentId);
    const submissions = this.getAssignmentSubmissions(organizationId, courseId, assignmentId);

    if (!assignment) return null;

    const graded = submissions.filter(s => s.grade !== null);
    const ungraded = submissions.filter(s => s.grade === null);
    const late = submissions.filter(s => s.late);

    return {
      assignmentId,
      assignmentName: assignment.name,
      totalSubmissions: submissions.length,
      graded: graded.length,
      ungraded: ungraded.length,
      lateSubmissions: late.length,
      syncedToLMS: submissions.filter(s => s.syncedToLMS).length,
      averageGrade: graded.length > 0
        ? Math.round(graded.reduce((sum, s) => sum + s.grade, 0) / graded.length * 100) / 100
        : null,
      dueAt: assignment.dueAt,
      published: assignment.published
    };
  }

  /**
   * Check if submission is late
   */
  isLateSubmission(dueDate) {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
  }

  /**
   * Helper: Generate assignment ID
   */
  generateAssignmentId() {
    return `asn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper: Generate submission ID
   */
  generateSubmissionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new AssignmentService();
