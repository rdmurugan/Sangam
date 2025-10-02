/**
 * LMS API Service
 * Handles all communication with LMS backend API
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class LMSService {
  constructor() {
    this.baseUrl = `${API_BASE}/lms`;
  }

  /**
   * Generic API call handler
   */
  async apiCall(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API call failed');
      }

      return result;
    } catch (error) {
      console.error('LMS API Error:', error);
      throw error;
    }
  }

  // ==================== STATUS ====================

  /**
   * Get plugin status
   */
  async getStatus() {
    return this.apiCall('/status');
  }

  // ==================== ROSTER ====================

  /**
   * Sync roster from LMS
   */
  async syncRoster(organizationId, courseId, platform) {
    return this.apiCall('/roster/sync', 'POST', {
      organizationId,
      courseId,
      platform,
    });
  }

  /**
   * Get roster for course
   */
  async getRoster(organizationId, courseId) {
    return this.apiCall(`/roster/${organizationId}/${courseId}`);
  }

  /**
   * Get roster statistics
   */
  async getRosterStatistics(organizationId, courseId) {
    return this.apiCall(`/roster/${organizationId}/${courseId}/statistics`);
  }

  /**
   * Export roster to CSV
   */
  async exportRoster(organizationId, courseId) {
    const url = `${this.baseUrl}/roster/${organizationId}/${courseId}/export`;
    window.open(url, '_blank');
  }

  // ==================== GRADES ====================

  /**
   * Create grade column
   */
  async createGradeColumn(organizationId, courseId, columnData) {
    return this.apiCall('/grades/column', 'POST', {
      organizationId,
      courseId,
      ...columnData,
    });
  }

  /**
   * Record grade
   */
  async recordGrade(organizationId, courseId, assignmentId, studentId, gradeData) {
    return this.apiCall('/grades/record', 'POST', {
      organizationId,
      courseId,
      assignmentId,
      studentId,
      ...gradeData,
    });
  }

  /**
   * Get grades for assignment
   */
  async getGrades(organizationId, courseId, assignmentId) {
    return this.apiCall(`/grades/${organizationId}/${courseId}/${assignmentId}`);
  }

  /**
   * Sync grades to LMS
   */
  async syncGrades(organizationId, courseId, assignmentId, platform) {
    return this.apiCall('/grades/sync', 'POST', {
      organizationId,
      courseId,
      assignmentId,
      platform,
    });
  }

  /**
   * Sync attendance as grades
   */
  async syncAttendanceAsGrades(organizationId, courseId, meetingId, platform) {
    return this.apiCall('/grades/attendance', 'POST', {
      organizationId,
      courseId,
      meetingId,
      platform,
    });
  }

  /**
   * Get grade statistics
   */
  async getGradeStatistics(organizationId, courseId, assignmentId) {
    return this.apiCall(`/grades/${organizationId}/${courseId}/${assignmentId}/statistics`);
  }

  // ==================== ASSIGNMENTS ====================

  /**
   * Create assignment
   */
  async createAssignment(organizationId, courseId, assignmentData) {
    return this.apiCall('/assignments', 'POST', {
      organizationId,
      courseId,
      ...assignmentData,
    });
  }

  /**
   * Get course assignments
   */
  async getAssignments(organizationId, courseId, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const endpoint = `/assignments/${organizationId}/${courseId}${query ? `?${query}` : ''}`;
    return this.apiCall(endpoint);
  }

  /**
   * Get assignment by ID
   */
  async getAssignment(organizationId, courseId, assignmentId) {
    return this.apiCall(`/assignments/${organizationId}/${courseId}/${assignmentId}`);
  }

  /**
   * Update assignment
   */
  async updateAssignment(organizationId, courseId, assignmentId, updates) {
    return this.apiCall(`/assignments/${organizationId}/${courseId}/${assignmentId}`, 'PUT', updates);
  }

  /**
   * Sync assignment to LMS
   */
  async syncAssignment(organizationId, courseId, assignmentId, platform) {
    return this.apiCall(`/assignments/${organizationId}/${courseId}/${assignmentId}/sync`, 'POST', {
      platform,
    });
  }

  /**
   * Create submission
   */
  async createSubmission(organizationId, courseId, assignmentId, submissionData) {
    return this.apiCall('/submissions', 'POST', {
      organizationId,
      courseId,
      assignmentId,
      ...submissionData,
    });
  }

  /**
   * Get assignment submissions
   */
  async getSubmissions(organizationId, courseId, assignmentId) {
    return this.apiCall(`/submissions/${organizationId}/${courseId}/${assignmentId}`);
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStatistics(organizationId, courseId, assignmentId) {
    return this.apiCall(`/assignments/${organizationId}/${courseId}/${assignmentId}/statistics`);
  }

  // ==================== COURSE ====================

  /**
   * Get course details from LMS
   */
  async getCourse(platform, courseId) {
    return this.apiCall(`/course/${platform}/${courseId}`);
  }
}

export default new LMSService();
