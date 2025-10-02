/**
 * Google Classroom Connector
 * Integrates with Google Classroom API
 */

const { google } = require('googleapis');
const ltiService = require('../services/ltiService');

class GoogleClassroomConnector {
  constructor() {
    this.name = 'Google Classroom';
    this.classroom = null;
    this.config = null;
  }

  async initialize(config) {
    this.config = config;

    const auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    auth.setCredentials({
      access_token: config.accessToken,
      refresh_token: config.refreshToken
    });

    this.classroom = google.classroom({ version: 'v1', auth });

    console.log(`✓ Google Classroom connector initialized`);
  }

  async getCourse(courseId) {
    const response = await this.classroom.courses.get({ id: courseId });
    return response.data;
  }

  async getRoster(courseId) {
    const studentsResp = await this.classroom.courses.students.list({ courseId });
    const teachersResp = await this.classroom.courses.teachers.list({ courseId });

    return {
      students: studentsResp.data.students || [],
      instructors: teachersResp.data.teachers || []
    };
  }

  async createAssignment(courseId, assignmentData) {
    const response = await this.classroom.courses.courseWork.create({
      courseId,
      requestBody: {
        title: assignmentData.name,
        description: assignmentData.description,
        maxPoints: assignmentData.pointsPossible || 100,
        workType: 'ASSIGNMENT',
        state: 'PUBLISHED',
        dueDate: assignmentData.dueAt ? this.convertToGoogleDate(assignmentData.dueAt) : undefined
      }
    });
    return response.data;
  }

  async sendGrade(assignmentId, studentId, grade) {
    const response = await this.classroom.courses.courseWork.studentSubmissions.patch({
      courseId: this.config.courseId,
      courseWorkId: assignmentId,
      id: studentId,
      updateMask: 'assignedGrade,draftGrade',
      requestBody: {
        assignedGrade: grade,
        draftGrade: grade
      }
    });
    return response.data;
  }

  async submitAssignment(assignmentId, studentId, submission) {
    const response = await this.classroom.courses.courseWork.studentSubmissions.turnIn({
      courseId: this.config.courseId,
      courseWorkId: assignmentId,
      id: studentId
    });
    return response.data;
  }

  async getAssignments(courseId) {
    const response = await this.classroom.courses.courseWork.list({ courseId });
    return response.data.courseWork || [];
  }

  async getSubmissions(courseId, assignmentId) {
    const response = await this.classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId: assignmentId
    });
    return response.data.studentSubmissions || [];
  }

  convertToGoogleDate(dateString) {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  async testConnection() {
    try {
      const response = await this.classroom.courses.list({ pageSize: 1 });
      return { success: true, courses: response.data.courses?.length || 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GoogleClassroomConnector();
