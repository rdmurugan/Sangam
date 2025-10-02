/**
 * Moodle LMS Connector
 * Integrates with Moodle via Web Services API
 */

const axios = require('axios');
const ltiService = require('../services/ltiService');

class MoodleConnector {
  constructor() {
    this.name = 'Moodle';
    this.baseUrl = null;
    this.token = null;
    this.config = null;
  }

  async initialize(config) {
    this.config = config;
    this.baseUrl = config.baseUrl; // e.g., https://moodle.school.edu
    this.token = config.token;

    if (config.lti) {
      ltiService.registerPlatform('moodle', {
        issuer: config.lti.issuer || this.baseUrl,
        clientId: config.lti.clientId,
        authEndpoint: `${this.baseUrl}/mod/lti/auth.php`,
        tokenEndpoint: `${this.baseUrl}/mod/lti/token.php`,
        jwksEndpoint: `${this.baseUrl}/mod/lti/certs.php`,
        deploymentId: config.lti.deploymentId
      });
    }

    console.log(`✓ Moodle connector initialized: ${this.baseUrl}`);
  }

  async getCourse(courseId) {
    const course = await this.call('core_course_get_courses', { options: { ids: [courseId] } });
    return course[0];
  }

  async getRoster(courseId) {
    const enrolled = await this.call('core_enrol_get_enrolled_users', { courseid: courseId });
    const students = enrolled.filter(u => u.roles?.some(r => r.shortname === 'student'));
    const instructors = enrolled.filter(u => u.roles?.some(r => ['teacher', 'editingteacher'].includes(r.shortname)));
    return { students, instructors };
  }

  async createAssignment(courseId, assignmentData) {
    const assignment = await this.call('mod_assign_create_assignment', {
      courseid: courseId,
      name: assignmentData.name,
      intro: assignmentData.description,
      duedate: assignmentData.dueAt ? Math.floor(new Date(assignmentData.dueAt).getTime() / 1000) : 0
    });
    return assignment;
  }

  async sendGrade(assignmentId, studentId, grade) {
    return await this.call('mod_assign_save_grade', {
      assignmentid: assignmentId,
      userid: studentId,
      grade: grade,
      attemp tnumber: -1
    });
  }

  async submitAssignment(assignmentId, studentId, submission) {
    return await this.call('mod_assign_save_submission', {
      assignmentid: assignmentId,
      plugindata: {
        onlinetext_editor: { text: submission.comment, format: 1 }
      }
    });
  }

  async getAssignments(courseId) {
    return await this.call('mod_assign_get_assignments', { courseids: [courseId] });
  }

  async getSubmissions(courseId, assignmentId) {
    return await this.call('mod_assign_get_submissions', { assignmentids: [assignmentId] });
  }

  async call(functionName, params = {}) {
    const url = `${this.baseUrl}/webservice/rest/server.php`;
    const response = await axios.post(url, null, {
      params: {
        wstoken: this.token,
        wsfunction: functionName,
        moodlewsrestformat: 'json',
        ...params
      }
    });
    return response.data;
  }

  async testConnection() {
    try {
      const siteInfo = await this.call('core_webservice_get_site_info');
      return { success: true, user: { name: siteInfo.fullname, email: siteInfo.useremail } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new MoodleConnector();
