/**
 * Grade Book Component
 * View, enter, and sync grades for course assignments
 */

import React, { useState, useEffect } from 'react';
import lmsService from '../services/lmsService';
import '../styles/GradeBook.css';

const GradeBook = ({ organizationId, courseId, platform }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [grades, setGrades] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAssignments();
  }, [organizationId, courseId]);

  useEffect(() => {
    if (selectedAssignment) {
      loadGrades();
      loadStatistics();
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const result = await lmsService.getAssignments(organizationId, courseId);
      setAssignments(result.assignments || generateMockAssignments());
      if (result.assignments && result.assignments.length > 0) {
        setSelectedAssignment(result.assignments[0]);
      }
    } catch (error) {
      setAssignments(generateMockAssignments());
      setSelectedAssignment(generateMockAssignments()[0]);
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    if (!selectedAssignment) return;

    setLoading(true);
    try {
      const result = await lmsService.getGrades(organizationId, courseId, selectedAssignment.id);
      setGrades(result.grades || generateMockGrades());
    } catch (error) {
      setGrades(generateMockGrades());
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!selectedAssignment) return;

    try {
      const result = await lmsService.getGradeStatistics(organizationId, courseId, selectedAssignment.id);
      setStatistics(result.statistics);
    } catch (error) {
      // Mock statistics
      setStatistics({
        totalGrades: 45,
        average: 85.3,
        median: 87,
        highest: 98,
        lowest: 62,
        distribution: {
          'A (90-100)': 18,
          'B (80-89)': 15,
          'C (70-79)': 8,
          'D (60-69)': 3,
          'F (0-59)': 1
        }
      });
    }
  };

  const handleSaveGrade = async (studentId, score) => {
    try {
      await lmsService.recordGrade(organizationId, courseId, selectedAssignment.id, studentId, {
        score,
        scoreMaximum: selectedAssignment.pointsPossible || 100,
        gradedBy: 'instructor-1' // Would come from current user
      });

      showMessage('success', 'Grade saved successfully');
      setEditingGrade(null);
      loadGrades();
      loadStatistics();
    } catch (error) {
      showMessage('error', 'Failed to save grade: ' + error.message);
    }
  };

  const handleSyncGrades = async () => {
    if (!selectedAssignment) return;

    setLoading(true);
    try {
      const result = await lmsService.syncGrades(organizationId, courseId, selectedAssignment.id, platform);
      showMessage('success', `Synced ${result.synced} grades to ${platform}`);
    } catch (error) {
      showMessage('error', 'Sync failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="gradebook">
      {message.text && (
        <div className={`gradebook-message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* Assignment Selector */}
      <div className="gradebook-header">
        <div className="assignment-selector">
          <label>Assignment:</label>
          <select
            value={selectedAssignment?.id || ''}
            onChange={(e) => {
              const assignment = assignments.find(a => a.id === e.target.value);
              setSelectedAssignment(assignment);
            }}
          >
            {assignments.map(assignment => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.name} ({assignment.pointsPossible || 100} points)
              </option>
            ))}
          </select>
        </div>
        <button className="sync-button" onClick={handleSyncGrades} disabled={loading}>
          {loading ? '⏳ Syncing...' : `🔄 Sync to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
        </button>
      </div>

      {selectedAssignment && (
        <>
          {/* Statistics */}
          {statistics && (
            <div className="grade-stats">
              <div className="stat-card">
                <span className="stat-label">Average</span>
                <span className="stat-value">{statistics.average.toFixed(1)}</span>
                <span className="stat-letter">{getLetterGrade(statistics.average)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Median</span>
                <span className="stat-value">{statistics.median.toFixed(1)}</span>
                <span className="stat-letter">{getLetterGrade(statistics.median)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Highest</span>
                <span className="stat-value">{statistics.highest}</span>
                <span className="stat-letter">{getLetterGrade(statistics.highest)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Lowest</span>
                <span className="stat-value">{statistics.lowest}</span>
                <span className="stat-letter">{getLetterGrade(statistics.lowest)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Graded</span>
                <span className="stat-value">{statistics.totalGrades}</span>
                <span className="stat-sublabel">students</span>
              </div>
            </div>
          )}

          {/* Grade Distribution */}
          {statistics?.distribution && (
            <div className="grade-distribution">
              <h3>Grade Distribution</h3>
              <div className="distribution-bars">
                {Object.entries(statistics.distribution).map(([grade, count]) => (
                  <div key={grade} className="distribution-item">
                    <span className="distribution-label">{grade}</span>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill"
                        style={{ width: `${(count / statistics.totalGrades) * 100}%` }}
                      />
                    </div>
                    <span className="distribution-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grades Table */}
          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Letter Grade</th>
                  <th>Status</th>
                  <th>Graded At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, index) => (
                  <tr key={index}>
                    <td>
                      <div className="student-info">
                        <span className="avatar">{grade.studentName.charAt(0)}</span>
                        <span>{grade.studentName}</span>
                      </div>
                    </td>
                    <td>
                      {editingGrade === grade.studentId ? (
                        <input
                          type="number"
                          min="0"
                          max={selectedAssignment.pointsPossible || 100}
                          defaultValue={grade.score}
                          className="grade-input"
                          onBlur={(e) => handleSaveGrade(grade.studentId, parseFloat(e.target.value))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveGrade(grade.studentId, parseFloat(e.target.value));
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span>{grade.score !== null ? grade.score : '-'}</span>
                      )}
                      <span className="score-max"> / {grade.scoreMaximum}</span>
                    </td>
                    <td>
                      <span className={`percentage ${grade.percentage >= 90 ? 'excellent' : grade.percentage >= 70 ? 'good' : 'warning'}`}>
                        {grade.percentage !== null ? `${grade.percentage.toFixed(1)}%` : '-'}
                      </span>
                    </td>
                    <td>
                      {grade.percentage !== null ? (
                        <span className={`letter-grade grade-${getLetterGrade(grade.percentage)}`}>
                          {getLetterGrade(grade.percentage)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span className={`sync-status ${grade.syncedToLMS ? 'synced' : 'pending'}`}>
                        {grade.syncedToLMS ? '✓ Synced' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      {grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => setEditingGrade(grade.studentId)}
                        title="Edit grade"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// Mock data generators
function generateMockAssignments() {
  return [
    { id: 'asn-1', name: 'Week 1 Meeting Attendance', pointsPossible: 100, type: 'attendance' },
    { id: 'asn-2', name: 'Week 2 Meeting Attendance', pointsPossible: 100, type: 'attendance' },
    { id: 'asn-3', name: 'Midterm Participation', pointsPossible: 50, type: 'meeting' },
    { id: 'asn-4', name: 'Final Project Presentation', pointsPossible: 100, type: 'meeting' },
  ];
}

function generateMockGrades() {
  const names = [
    'Emma Smith', 'Liam Johnson', 'Olivia Williams', 'Noah Brown', 'Ava Jones',
    'Ethan Garcia', 'Sophia Miller', 'Mason Davis', 'Isabella Rodriguez', 'William Martinez',
    'Mia Hernandez', 'James Lopez', 'Charlotte Gonzalez', 'Benjamin Wilson', 'Amelia Anderson',
    'Lucas Thomas', 'Harper Taylor', 'Henry Moore', 'Evelyn Jackson', 'Alexander Martin'
  ];

  return names.map((name, i) => {
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    return {
      studentId: `student-${i + 1}`,
      studentName: name,
      score,
      scoreMaximum: 100,
      percentage: score,
      gradedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      syncedToLMS: Math.random() > 0.3
    };
  });
}

export default GradeBook;
