/**
 * Blackboard LMS Connector
 * Integrates with Blackboard Learn via REST API
 */

const axios = require('axios');
const ltiService = require('../services/ltiService');

class BlackboardConnector {
  constructor() {
    this.name = 'Blackboard';
    this.baseUrl = null;
    this.accessToken = null;
    this.config = null;
  }

  async initialize(config) {
    this.config = config;
    this.baseUrl = config.baseUrl;
    await this.authenticate();

    if (config.lti) {
      ltiService.registerPlatform('blackboard', {
        issuer: config.lti.issuer || 'https://blackboard.com',
        clientId: config.lti.clientId,
        authEndpoint: `${this.baseUrl}/learn/api/public/v1/lti/authorize`,
        tokenEndpoint: `${this.baseUrl}/learn/api/public/v1/oauth2/token`,
        jwksEndpoint: `${this.baseUrl}/learn/api/public/v1/lti/jwks`,
        deploymentId: config.lti.deploymentId
      });
    }

    console.log(`✓ Blackboard connector initialized: ${this.baseUrl}`);
  }

  async authenticate() {
    const response = await axios.post(`${this.baseUrl}/learn/api/public/v1/oauth2/token`, {
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });
    this.accessToken = response.data.access_token;
  }

  async getCourse(courseId) {
    return await this.api(`/learn/api/public/v3/courses/${courseId}`);
  }

  async getRoster(courseId) {
    const memberships = await this.api(`/learn/api/public/v1/courses/${courseId}/users`);
    const students = memberships.filter(m => m.courseRoleId === 'Student');
    const instructors = memberships.filter(m => ['Instructor', 'TeachingAssistant'].includes(m.courseRoleId));
    return { students, instructors };
  }

  async createAssignment(courseId, assignmentData) {
    return await this.api(`/learn/api/public/v2/courses/${courseId}/gradebook/columns`, 'POST', {
      name: assignmentData.name,
      description: assignmentData.description,
      score: { possible: assignmentData.pointsPossible || 100 }
    });
  }

  async sendGrade(assignmentId, studentId, grade) {
    return await this.api(`/learn/api/public/v2/courses/${this.config.courseId}/gradebook/columns/${assignmentId}/users/${studentId}`, 'PATCH', {
      score: grade
    });
  }

  async submitAssignment(assignmentId, studentId, submission) {
    return await this.api(`/learn/api/public/v1/courses/${this.config.courseId}/contents/${assignmentId}/attempts`, 'POST', {
      studentId,
      text: submission.comment
    });
  }

  async getAssignments(courseId) {
    return await this.api(`/learn/api/public/v2/courses/${courseId}/gradebook/columns`);
  }

  async getSubmissions(courseId, assignmentId) {
    return await this.api(`/learn/api/public/v2/courses/${courseId}/gradebook/columns/${assignmentId}/attempts`);
  }

  async api(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    if (data) config.data = data;
    const response = await axios(config);
    return response.data;
  }

  async testConnection() {
    try {
      const user = await this.api('/learn/api/public/v1/users/me');
      return { success: true, user: { name: user.name, email: user.contact?.email } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new BlackboardConnector();
