/**
 * Grade Book Service
 * Manages grade synchronization between Sangam and LMS platforms
 */

class GradeBookService {
  constructor() {
    this.gradeRecords = new Map(); // assignmentId -> grade records
    this.gradeColumns = new Map(); // courseId -> grade columns
    this.syncHistory = new Map(); // syncId -> sync history
  }

  /**
   * Create grade book column in LMS
   */
  async createGradeColumn(organizationId, courseId, columnData) {
    const columnKey = `${organizationId}:${courseId}:${columnData.name}`;

    const column = {
      id: this.generateColumnId(),
      organizationId,
      courseId,
      name: columnData.name,
      description: columnData.description,
      pointsPossible: columnData.pointsPossible || 100,
      gradeType: columnData.gradeType || 'percentage', // percentage, points, complete_incomplete
      hidden: columnData.hidden || false,
      createdAt: new Date(),
      syncedToLMS: false,
      lmsColumnId: null
    };

    this.gradeColumns.set(columnKey, column);

    console.log(`✓ Grade column created: ${columnData.name} (${column.pointsPossible} points)`);

    return column;
  }

  /**
   * Get grade column
   */
  getGradeColumn(organizationId, courseId, columnName) {
    const columnKey = `${organizationId}:${courseId}:${columnName}`;
    return this.gradeColumns.get(columnKey) || null;
  }

  /**
   * Get all grade columns for a course
   */
  getCourseGradeColumns(organizationId, courseId) {
    const columns = [];
    const prefix = `${organizationId}:${courseId}:`;

    for (const [key, column] of this.gradeColumns.entries()) {
      if (key.startsWith(prefix)) {
        columns.push(column);
      }
    }

    return columns;
  }

  /**
   * Record grade for student
   */
  async recordGrade(organizationId, courseId, assignmentId, studentId, gradeData) {
    const gradeKey = `${organizationId}:${courseId}:${assignmentId}:${studentId}`;

    const grade = {
      organizationId,
      courseId,
      assignmentId,
      studentId,
      score: gradeData.score,
      scoreMaximum: gradeData.scoreMaximum || 100,
      percentage: this.calculatePercentage(gradeData.score, gradeData.scoreMaximum),
      comment: gradeData.comment || null,
      gradedBy: gradeData.gradedBy,
      gradedAt: new Date(),
      syncedToLMS: false,
      lmsSyncedAt: null,
      lmsSyncStatus: 'pending'
    };

    this.gradeRecords.set(gradeKey, grade);

    console.log(`✓ Grade recorded for student ${studentId}: ${grade.score}/${grade.scoreMaximum} (${grade.percentage}%)`);

    return grade;
  }

  /**
   * Get grade for student
   */
  getGrade(organizationId, courseId, assignmentId, studentId) {
    const gradeKey = `${organizationId}:${courseId}:${assignmentId}:${studentId}`;
    return this.gradeRecords.get(gradeKey) || null;
  }

  /**
   * Get all grades for an assignment
   */
  getAssignmentGrades(organizationId, courseId, assignmentId) {
    const grades = [];
    const prefix = `${organizationId}:${courseId}:${assignmentId}:`;

    for (const [key, grade] of this.gradeRecords.entries()) {
      if (key.startsWith(prefix)) {
        grades.push(grade);
      }
    }

    return grades;
  }

  /**
   * Get all grades for a student in a course
   */
  getStudentGrades(organizationId, courseId, studentId) {
    const grades = [];
    const coursePrefix = `${organizationId}:${courseId}:`;

    for (const [key, grade] of this.gradeRecords.entries()) {
      if (key.startsWith(coursePrefix) && grade.studentId === studentId) {
        grades.push(grade);
      }
    }

    return grades;
  }

  /**
   * Update grade
   */
  async updateGrade(organizationId, courseId, assignmentId, studentId, updates) {
    const gradeKey = `${organizationId}:${courseId}:${assignmentId}:${studentId}`;
    const grade = this.gradeRecords.get(gradeKey);

    if (!grade) {
      throw new Error(`Grade not found for student ${studentId} in assignment ${assignmentId}`);
    }

    if (updates.score !== undefined) {
      grade.score = updates.score;
      grade.percentage = this.calculatePercentage(updates.score, grade.scoreMaximum);
    }

    if (updates.scoreMaximum !== undefined) {
      grade.scoreMaximum = updates.scoreMaximum;
      grade.percentage = this.calculatePercentage(grade.score, updates.scoreMaximum);
    }

    if (updates.comment !== undefined) {
      grade.comment = updates.comment;
    }

    grade.updatedAt = new Date();
    grade.syncedToLMS = false; // Mark for re-sync
    grade.lmsSyncStatus = 'pending';

    this.gradeRecords.set(gradeKey, grade);

    return grade;
  }

  /**
   * Batch record grades for multiple students
   */
  async batchRecordGrades(organizationId, courseId, assignmentId, gradesData) {
    const results = {
      success: [],
      failed: []
    };

    for (const gradeData of gradesData) {
      try {
        const grade = await this.recordGrade(
          organizationId,
          courseId,
          assignmentId,
          gradeData.studentId,
          gradeData
        );
        results.success.push(grade);
      } catch (error) {
        results.failed.push({
          studentId: gradeData.studentId,
          error: error.message
        });
      }
    }

    console.log(`✓ Batch grading completed: ${results.success.length} success, ${results.failed.length} failed`);

    return results;
  }

  /**
   * Sync grades to LMS
   */
  async syncGradesToLMS(organizationId, courseId, assignmentId, connector) {
    const grades = this.getAssignmentGrades(organizationId, courseId, assignmentId);
    const unsyncedGrades = grades.filter(g => !g.syncedToLMS);

    if (unsyncedGrades.length === 0) {
      console.log('✓ No grades to sync');
      return { synced: 0, failed: 0 };
    }

    const syncId = this.generateSyncId();
    const syncRecord = {
      syncId,
      organizationId,
      courseId,
      assignmentId,
      startedAt: new Date(),
      totalGrades: unsyncedGrades.length,
      syncedCount: 0,
      failedCount: 0,
      errors: []
    };

    console.log(`Starting grade sync: ${unsyncedGrades.length} grades to sync...`);

    for (const grade of unsyncedGrades) {
      try {
        await connector.sendGrade(
          assignmentId,
          grade.studentId,
          grade.score
        );

        // Mark as synced
        const gradeKey = `${organizationId}:${courseId}:${assignmentId}:${grade.studentId}`;
        const gradeRecord = this.gradeRecords.get(gradeKey);
        gradeRecord.syncedToLMS = true;
        gradeRecord.lmsSyncedAt = new Date();
        gradeRecord.lmsSyncStatus = 'success';
        this.gradeRecords.set(gradeKey, gradeRecord);

        syncRecord.syncedCount++;
      } catch (error) {
        syncRecord.failedCount++;
        syncRecord.errors.push({
          studentId: grade.studentId,
          error: error.message
        });

        // Mark sync as failed
        const gradeKey = `${organizationId}:${courseId}:${assignmentId}:${grade.studentId}`;
        const gradeRecord = this.gradeRecords.get(gradeKey);
        gradeRecord.lmsSyncStatus = 'failed';
        gradeRecord.lmsSyncError = error.message;
        this.gradeRecords.set(gradeKey, gradeRecord);
      }
    }

    syncRecord.completedAt = new Date();
    this.syncHistory.set(syncId, syncRecord);

    console.log(`✓ Grade sync completed: ${syncRecord.syncedCount} synced, ${syncRecord.failedCount} failed`);

    return {
      syncId,
      synced: syncRecord.syncedCount,
      failed: syncRecord.failedCount,
      errors: syncRecord.errors
    };
  }

  /**
   * Calculate attendance-based grade
   */
  calculateAttendanceGrade(attendanceData, maxPoints = 100) {
    const { totalDuration, attendedDuration, joinedOnTime, leftEarly } = attendanceData;

    // Base grade on attendance percentage
    let baseGrade = (attendedDuration / totalDuration) * maxPoints;

    // Bonus for joining on time
    if (joinedOnTime) {
      baseGrade += maxPoints * 0.05; // 5% bonus
    }

    // Penalty for leaving early
    if (leftEarly) {
      baseGrade -= maxPoints * 0.05; // 5% penalty
    }

    // Cap at maximum points
    return Math.min(Math.round(baseGrade), maxPoints);
  }

  /**
   * Create attendance grade column and sync
   */
  async syncAttendanceAsGrades(organizationId, courseId, meetingId, attendanceReport, connector) {
    // Create grade column for this meeting
    const column = await this.createGradeColumn(organizationId, courseId, {
      name: `Attendance: ${attendanceReport.meetingName}`,
      description: `Attendance grade for meeting on ${new Date(attendanceReport.startTime).toLocaleDateString()}`,
      pointsPossible: 100,
      gradeType: 'points'
    });

    const assignmentId = column.id;

    // Calculate and record grades for each participant
    const gradesData = attendanceReport.participants.map(participant => ({
      studentId: participant.userId,
      score: this.calculateAttendanceGrade({
        totalDuration: attendanceReport.duration,
        attendedDuration: participant.duration,
        joinedOnTime: participant.joinedAt <= attendanceReport.startTime + (5 * 60 * 1000), // 5 min grace
        leftEarly: participant.leftAt < attendanceReport.endTime - (5 * 60 * 1000) // 5 min before end
      }),
      scoreMaximum: 100,
      comment: `Attended for ${Math.round(participant.duration / 60000)} minutes`,
      gradedBy: 'system'
    }));

    const results = await this.batchRecordGrades(organizationId, courseId, assignmentId, gradesData);

    // Sync to LMS
    const syncResults = await this.syncGradesToLMS(organizationId, courseId, assignmentId, connector);

    return {
      assignmentId,
      gradesRecorded: results.success.length,
      gradesFailed: results.failed.length,
      syncedToLMS: syncResults.synced,
      syncFailed: syncResults.failed
    };
  }

  /**
   * Get grade statistics for assignment
   */
  getAssignmentStatistics(organizationId, courseId, assignmentId) {
    const grades = this.getAssignmentGrades(organizationId, courseId, assignmentId);

    if (grades.length === 0) {
      return null;
    }

    const scores = grades.map(g => g.percentage);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      assignmentId,
      totalGrades: grades.length,
      average: Math.round(average * 100) / 100,
      median: Math.round(median * 100) / 100,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      syncedToLMS: grades.filter(g => g.syncedToLMS).length,
      pendingSync: grades.filter(g => !g.syncedToLMS).length,
      distribution: {
        'A (90-100)': scores.filter(s => s >= 90).length,
        'B (80-89)': scores.filter(s => s >= 80 && s < 90).length,
        'C (70-79)': scores.filter(s => s >= 70 && s < 80).length,
        'D (60-69)': scores.filter(s => s >= 60 && s < 70).length,
        'F (0-59)': scores.filter(s => s < 60).length
      }
    };
  }

  /**
   * Get sync history
   */
  getSyncHistory(organizationId, courseId, assignmentId = null) {
    const history = [];

    for (const [syncId, record] of this.syncHistory.entries()) {
      if (record.organizationId === organizationId &&
          record.courseId === courseId &&
          (!assignmentId || record.assignmentId === assignmentId)) {
        history.push(record);
      }
    }

    return history.sort((a, b) => b.startedAt - a.startedAt);
  }

  /**
   * Delete grade
   */
  deleteGrade(organizationId, courseId, assignmentId, studentId) {
    const gradeKey = `${organizationId}:${courseId}:${assignmentId}:${studentId}`;
    const deleted = this.gradeRecords.delete(gradeKey);

    if (deleted) {
      console.log(`✓ Grade deleted for student ${studentId} in assignment ${assignmentId}`);
    }

    return deleted;
  }

  /**
   * Delete all grades for an assignment
   */
  deleteAssignmentGrades(organizationId, courseId, assignmentId) {
    const prefix = `${organizationId}:${courseId}:${assignmentId}:`;
    let deletedCount = 0;

    for (const key of this.gradeRecords.keys()) {
      if (key.startsWith(prefix)) {
        this.gradeRecords.delete(key);
        deletedCount++;
      }
    }

    console.log(`✓ Deleted ${deletedCount} grades for assignment ${assignmentId}`);

    return deletedCount;
  }

  /**
   * Helper: Calculate percentage
   */
  calculatePercentage(score, maxScore) {
    if (maxScore === 0) return 0;
    return Math.round((score / maxScore) * 10000) / 100; // Two decimal places
  }

  /**
   * Helper: Generate column ID
   */
  generateColumnId() {
    return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Helper: Generate sync ID
   */
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new GradeBookService();
