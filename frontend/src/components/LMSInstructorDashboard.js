/**
 * LMS Instructor Dashboard
 * Main dashboard for instructors to manage courses, roster, assignments, and grades
 */

import React, { useState, useEffect } from 'react';
import lmsService from '../services/lmsService';
import RosterViewer from './RosterViewer';
import GradeBook from './GradeBook';
import AssignmentManager from './AssignmentManager';
import '../styles/LMSInstructorDashboard.css';

const LMSInstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('roster');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [platform, setPlatform] = useState('canvas');
  const [organizationId, setOrganizationId] = useState('org-123'); // Would come from user context
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // In production, would load user's courses from backend
    setCourses([
      { id: 'course-101', name: 'Introduction to Computer Science', students: 45, platform: 'canvas' },
      { id: 'course-102', name: 'Data Structures & Algorithms', students: 38, platform: 'canvas' },
      { id: 'course-201', name: 'Web Development', students: 52, platform: 'moodle' },
    ]);

    if (!selectedCourse) {
      setSelectedCourse({
        id: 'course-101',
        name: 'Introduction to Computer Science',
        students: 45,
        platform: 'canvas'
      });
    }
  }, []);

  const handleSync = async (syncType) => {
    if (!selectedCourse) {
      showMessage('error', 'Please select a course first');
      return;
    }

    setLoading(true);
    try {
      let result;
      switch (syncType) {
        case 'roster':
          result = await lmsService.syncRoster(organizationId, selectedCourse.id, platform);
          showMessage('success', `Roster synced: ${result.studentsCount} students, ${result.instructorsCount} instructors`);
          break;
        case 'grades':
          showMessage('info', 'Grade sync initiated');
          break;
        default:
          break;
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  return (
    <div className="lms-instructor-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📚 LMS Instructor Dashboard</h1>
          <p className="subtitle">Manage courses, roster, assignments, and grades</p>
        </div>
        <div className="header-actions">
          <select
            className="course-selector"
            value={selectedCourse?.id || ''}
            onChange={(e) => {
              const course = courses.find(c => c.id === e.target.value);
              setSelectedCourse(course);
              setPlatform(course.platform);
            }}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.students} students)
              </option>
            ))}
          </select>
          <button className="sync-button" onClick={() => handleSync('roster')} disabled={loading}>
            {loading ? '⏳ Syncing...' : '🔄 Sync Roster'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`dashboard-message ${message.type}`}>
          {message.type === 'success' ? '✓' : message.type === 'error' ? '✗' : 'ℹ'} {message.text}
        </div>
      )}

      {/* Course Info Bar */}
      {selectedCourse && (
        <div className="course-info-bar">
          <div className="info-item">
            <span className="info-label">Course</span>
            <span className="info-value">{selectedCourse.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Platform</span>
            <span className="info-value">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Students</span>
            <span className="info-value">{selectedCourse.students}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Course ID</span>
            <span className="info-value">{selectedCourse.id}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          👥 Roster
        </button>
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          📝 Assignments
        </button>
        <button
          className={`tab ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          📊 Grade Book
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {selectedCourse ? (
          <>
            {activeTab === 'roster' && (
              <RosterViewer
                organizationId={organizationId}
                courseId={selectedCourse.id}
                platform={platform}
              />
            )}
            {activeTab === 'assignments' && (
              <AssignmentManager
                organizationId={organizationId}
                courseId={selectedCourse.id}
                platform={platform}
              />
            )}
            {activeTab === 'grades' && (
              <GradeBook
                organizationId={organizationId}
                courseId={selectedCourse.id}
                platform={platform}
              />
            )}
            {activeTab === 'analytics' && (
              <div className="analytics-placeholder">
                <h2>📈 Course Analytics</h2>
                <p>Analytics dashboard coming soon...</p>
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <h3>Average Attendance</h3>
                    <p className="big-number">87%</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Total Meetings</h3>
                    <p className="big-number">24</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Average Grade</h3>
                    <p className="big-number">85.3</p>
                  </div>
                  <div className="analytics-card">
                    <h3>Participation Rate</h3>
                    <p className="big-number">92%</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-course-selected">
            <h2>No Course Selected</h2>
            <p>Please select a course from the dropdown above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LMSInstructorDashboard;
