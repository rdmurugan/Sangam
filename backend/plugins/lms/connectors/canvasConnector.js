/**
 * Canvas LMS Connector
 * Integrates with Canvas LMS API
 */

const axios = require('axios');
const ltiService = require('../services/ltiService');

class CanvasConnector {
  constructor() {
    this.name = 'Canvas';
    this.baseUrl = null;
    this.accessToken = null;
    this.config = null;
  }

  /**
   * Initialize Canvas connector
   */
  async initialize(config) {
    this.config = config;
    this.baseUrl = config.baseUrl; // e.g., https://canvas.instructure.com
    this.accessToken = config.accessToken;

    // Register with LTI service
    if (config.lti) {
      ltiService.registerPlatform('canvas', {
        issuer: config.lti.issuer || 'https://canvas.instructure.com',
        clientId: config.lti.clientId,
        authEndpoint: `${this.baseUrl}/api/lti/authorize_redirect`,
        tokenEndpoint: `${this.baseUrl}/login/oauth2/token`,
        jwksEndpoint: `${this.baseUrl}/api/lti/security/jwks`,
        deploymentId: config.lti.deploymentId
      });
    }

    console.log(`✓ Canvas connector initialized: ${this.baseUrl}`);
  }

  /**
   * Get course details
   */
  async getCourse(courseId) {
    try {
      const response = await this.api(`/api/v1/courses/${courseId}`, 'GET');
      return {
        id: response.id,
        name: response.name,
        courseCode: response.course_code,
        startDate: response.start_at,
        endDate: response.end_at,
        enrollmentTermId: response.enrollment_term_id,
        status: response.workflow_state
      };
    } catch (error) {
      throw new Error(`Failed to get Canvas course: ${error.message}`);
    }
  }

  /**
   * Get course roster (students and instructors)
   */
  async getRoster(courseId) {
    try {
      const enrollments = await this.api(
        `/api/v1/courses/${courseId}/enrollments?per_page=100`,
        'GET'
      );

      const students = [];
      const instructors = [];

      for (const enrollment of enrollments) {
        const user = {
          id: enrollment.user_id,
          name: enrollment.user.name,
          email: enrollment.user.login_id || enrollment.user.email,
          avatar: enrollment.user.avatar_url,
          enrollmentId: enrollment.id,
          role: enrollment.type,
          status: enrollment.enrollment_state
        };

        if (enrollment.type === 'StudentEnrollment') {
          students.push(user);
        } else if (['TeacherEnrollment', 'TaEnrollment', 'DesignerEnrollment'].includes(enrollment.type)) {
          instructors.push(user);
        }
      }

      return { students, instructors };
    } catch (error) {
      throw new Error(`Failed to get Canvas roster: ${error.message}`);
    }
  }

  /**
   * Create assignment in Canvas
   */
  async createAssignment(courseId, assignmentData) {
    try {
      const payload = {
        assignment: {
          name: assignmentData.name,
          description: assignmentData.description,
          points_possible: assignmentData.pointsPossible || 100,
          due_at: assignmentData.dueAt,
          submission_types: ['online_url'],
          external_tool_tag_attributes: {
            url: assignmentData.launchUrl,
            new_tab: true
          },
          published: assignmentData.published !== false
        }
      };

      const response = await this.api(
        `/api/v1/courses/${courseId}/assignments`,
        'POST',
        payload
      );

      return {
        id: response.id,
        name: response.name,
        description: response.description,
        pointsPossible: response.points_possible,
        dueAt: response.due_at,
        htmlUrl: response.html_url
      };
    } catch (error) {
      throw new Error(`Failed to create Canvas assignment: ${error.message}`);
    }
  }

  /**
   * Send grade to Canvas
   */
  async sendGrade(assignmentId, studentId, grade) {
    try {
      // First, get the submission ID
      const submission = await this.api(
        `/api/v1/courses/${this.config.courseId}/assignments/${assignmentId}/submissions/${studentId}`,
        'GET'
      );

      // Update the grade
      const payload = {
        submission: {
          posted_grade: grade
        }
      };

      const response = await this.api(
        `/api/v1/courses/${this.config.courseId}/assignments/${assignmentId}/submissions/${studentId}`,
        'PUT',
        payload
      );

      return {
        success: true,
        submissionId: response.id,
        grade: response.grade,
        score: response.score,
        gradedAt: response.graded_at
      };
    } catch (error) {
      throw new Error(`Failed to send grade to Canvas: ${error.message}`);
    }
  }

  /**
   * Submit assignment to Canvas
   */
  async submitAssignment(assignmentId, studentId, submission) {
    try {
      const payload = {
        submission: {
          submission_type: 'online_url',
          url: submission.url
        },
        comment: {
          text_comment: submission.comment || 'Submitted via Sangam'
        }
      };

      const response = await this.api(
        `/api/v1/courses/${this.config.courseId}/assignments/${assignmentId}/submissions`,
        'POST',
        payload
      );

      return {
        success: true,
        submissionId: response.id,
        submittedAt: response.submitted_at,
        url: response.url
      };
    } catch (error) {
      throw new Error(`Failed to submit to Canvas: ${error.message}`);
    }
  }

  /**
   * Get assignments for a course
   */
  async getAssignments(courseId) {
    try {
      const assignments = await this.api(
        `/api/v1/courses/${courseId}/assignments?per_page=100`,
        'GET'
      );

      return assignments.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        pointsPossible: a.points_possible,
        dueAt: a.due_at,
        htmlUrl: a.html_url,
        published: a.published
      }));
    } catch (error) {
      throw new Error(`Failed to get Canvas assignments: ${error.message}`);
    }
  }

  /**
   * Get student submissions for an assignment
   */
  async getSubmissions(courseId, assignmentId) {
    try {
      const submissions = await this.api(
        `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions?include[]=user&per_page=100`,
        'GET'
      );

      return submissions.map(s => ({
        id: s.id,
        studentId: s.user_id,
        studentName: s.user?.name,
        submittedAt: s.submitted_at,
        grade: s.grade,
        score: s.score,
        late: s.late,
        missing: s.missing,
        workflowState: s.workflow_state
      }));
    } catch (error) {
      throw new Error(`Failed to get Canvas submissions: ${error.message}`);
    }
  }

  /**
   * Create announcement in Canvas
   */
  async createAnnouncement(courseId, title, message) {
    try {
      const payload = {
        title,
        message,
        is_announcement: true
      };

      const response = await this.api(
        `/api/v1/courses/${courseId}/discussion_topics`,
        'POST',
        payload
      );

      return {
        id: response.id,
        title: response.title,
        message: response.message,
        postedAt: response.posted_at,
        htmlUrl: response.html_url
      };
    } catch (error) {
      throw new Error(`Failed to create Canvas announcement: ${error.message}`);
    }
  }

  /**
   * Get course modules
   */
  async getModules(courseId) {
    try {
      const modules = await this.api(
        `/api/v1/courses/${courseId}/modules?per_page=100`,
        'GET'
      );

      return modules.map(m => ({
        id: m.id,
        name: m.name,
        position: m.position,
        unlockAt: m.unlock_at,
        requireSequentialProgress: m.require_sequential_progress,
        state: m.state,
        itemsCount: m.items_count
      }));
    } catch (error) {
      throw new Error(`Failed to get Canvas modules: ${error.message}`);
    }
  }

  /**
   * Create external tool in module
   */
  async addToolToModule(courseId, moduleId, toolData) {
    try {
      const payload = {
        module_item: {
          title: toolData.title,
          type: 'ExternalTool',
          external_url: toolData.url,
          new_tab: true
        }
      };

      const response = await this.api(
        `/api/v1/courses/${courseId}/modules/${moduleId}/items`,
        'POST',
        payload
      );

      return {
        id: response.id,
        title: response.title,
        type: response.type,
        htmlUrl: response.html_url
      };
    } catch (error) {
      throw new Error(`Failed to add tool to Canvas module: ${error.message}`);
    }
  }

  /**
   * Helper: Make API request to Canvas
   */
  async api(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Canvas API Error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Test connection to Canvas
   */
  async testConnection() {
    try {
      const response = await this.api('/api/v1/users/self', 'GET');
      return {
        success: true,
        user: {
          id: response.id,
          name: response.name,
          email: response.primary_email
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CanvasConnector();
