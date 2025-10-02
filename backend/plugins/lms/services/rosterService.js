/**
 * Roster Service
 * Manages course rosters and participant synchronization
 */

class RosterService {
  constructor() {
    this.rosters = new Map(); // courseId -> roster data
  }

  /**
   * Update roster for a course
   */
  async updateRoster(organizationId, courseId, roster) {
    const rosterKey = `${organizationId}:${courseId}`;

    this.rosters.set(rosterKey, {
      courseId,
      organizationId,
      students: roster.students || [],
      instructors: roster.instructors || [],
      lastSync: new Date(),
      totalStudents: roster.students?.length || 0,
      totalInstructors: roster.instructors?.length || 0
    });

    console.log(`✓ Roster updated for course ${courseId}: ${roster.students?.length || 0} students, ${roster.instructors?.length || 0} instructors`);

    return this.rosters.get(rosterKey);
  }

  /**
   * Get roster for a course
   */
  getRoster(organizationId, courseId) {
    const rosterKey = `${organizationId}:${courseId}`;
    return this.rosters.get(rosterKey) || null;
  }

  /**
   * Find student in roster
   */
  findStudent(organizationId, courseId, studentId) {
    const roster = this.getRoster(organizationId, courseId);
    if (!roster) return null;

    return roster.students.find(s => s.id === studentId || s.email === studentId);
  }

  /**
   * Find instructor in roster
   */
  findInstructor(organizationId, courseId, instructorId) {
    const roster = this.getRoster(organizationId, courseId);
    if (!roster) return null;

    return roster.instructors.find(i => i.id === instructorId || i.email === instructorId);
  }

  /**
   * Check if user is enrolled in course
   */
  isEnrolled(organizationId, courseId, userId) {
    const student = this.findStudent(organizationId, courseId, userId);
    const instructor = this.findInstructor(organizationId, courseId, userId);

    return !!(student || instructor);
  }

  /**
   * Get user role in course
   */
  getUserRole(organizationId, courseId, userId) {
    const student = this.findStudent(organizationId, courseId, userId);
    if (student) return 'student';

    const instructor = this.findInstructor(organizationId, courseId, userId);
    if (instructor) return 'instructor';

    return null;
  }

  /**
   * Add participant to roster
   */
  addParticipant(organizationId, courseId, participant, role = 'student') {
    const roster = this.getRoster(organizationId, courseId);
    if (!roster) {
      throw new Error(`Roster not found for course ${courseId}`);
    }

    if (role === 'student') {
      roster.students.push(participant);
      roster.totalStudents++;
    } else if (role === 'instructor') {
      roster.instructors.push(participant);
      roster.totalInstructors++;
    }

    this.rosters.set(`${organizationId}:${courseId}`, roster);

    return roster;
  }

  /**
   * Remove participant from roster
   */
  removeParticipant(organizationId, courseId, userId) {
    const roster = this.getRoster(organizationId, courseId);
    if (!roster) {
      throw new Error(`Roster not found for course ${courseId}`);
    }

    roster.students = roster.students.filter(s => s.id !== userId);
    roster.instructors = roster.instructors.filter(i => i.id !== userId);
    roster.totalStudents = roster.students.length;
    roster.totalInstructors = roster.instructors.length;

    this.rosters.set(`${organizationId}:${courseId}`, roster);

    return roster;
  }

  /**
   * Get all rosters for organization
   */
  getOrganizationRosters(organizationId) {
    const rosters = [];

    for (const [key, roster] of this.rosters.entries()) {
      if (key.startsWith(`${organizationId}:`)) {
        rosters.push(roster);
      }
    }

    return rosters;
  }

  /**
   * Export roster to CSV
   */
  exportToCSV(organizationId, courseId) {
    const roster = this.getRoster(organizationId, courseId);
    if (!roster) return null;

    const headers = ['Name', 'Email', 'Role', 'Status'];
    const rows = [];

    roster.students.forEach(s => {
      rows.push([s.name, s.email, s.role || 'Student', s.status || 'Active'].join(','));
    });

    roster.instructors.forEach(i => {
      rows.push([i.name, i.email, i.role || 'Instructor', i.status || 'Active'].join(','));
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Get roster statistics
   */
  getStatistics(organizationId, courseId) {
    const roster = this.getRoster(organizationId, courseId);
    if (!roster) return null;

    return {
      courseId: roster.courseId,
      totalStudents: roster.totalStudents,
      totalInstructors: roster.totalInstructors,
      totalParticipants: roster.totalStudents + roster.totalInstructors,
      lastSync: roster.lastSync,
      activeStudents: roster.students.filter(s => s.status === 'active').length,
      inactiveStudents: roster.students.filter(s => s.status !== 'active').length
    };
  }
}

module.exports = new RosterService();
