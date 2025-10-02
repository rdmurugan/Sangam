/**
 * Assignment Manager Component
 * Create, view, and manage course assignments
 */

import React, { useState, useEffect } from 'react';
import lmsService from '../services/lmsService';
import '../styles/AssignmentManager.css';

const AssignmentManager = ({ organizationId, courseId, platform }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, unpublished
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAssignments();
  }, [organizationId, courseId, filter]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const filters = filter !== 'all' ? { published: filter === 'published' } : {};
      const result = await lmsService.getAssignments(organizationId, courseId, filters);
      setAssignments(result.assignments || generateMockAssignments());
    } catch (error) {
      setAssignments(generateMockAssignments());
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (assignmentData) => {
    try {
      await lmsService.createAssignment(organizationId, courseId, assignmentData);
      showMessage('success', 'Assignment created successfully');
      setShowCreateModal(false);
      loadAssignments();
    } catch (error) {
      showMessage('error', 'Failed to create assignment: ' + error.message);
    }
  };

  const handleSyncAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      const result = await lmsService.syncAssignment(organizationId, courseId, assignmentId, platform);
      showMessage('success', `Assignment synced to ${platform}`);
      loadAssignments();
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

  const getAssignmentTypeIcon = (type) => {
    switch (type) {
      case 'meeting': return '🎥';
      case 'quiz': return '📝';
      case 'discussion': return '💬';
      case 'file_upload': return '📄';
      default: return '📋';
    }
  };

  return (
    <div className="assignment-manager">
      {message.text && (
        <div className={`assignment-message ${message.type}`}>
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      {/* Toolbar */}
      <div className="assignment-toolbar">
        <div className="toolbar-left">
          <h2>Assignments</h2>
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Assignments</option>
            <option value="published">Published Only</option>
            <option value="unpublished">Unpublished Only</option>
          </select>
        </div>
        <button
          className="create-button"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create Assignment
        </button>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading assignments...</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-header">
                <span className="assignment-icon">{getAssignmentTypeIcon(assignment.type)}</span>
                <h3>{assignment.name}</h3>
                <span className={`published-badge ${assignment.published ? 'published' : 'draft'}`}>
                  {assignment.published ? '✓ Published' : '○ Draft'}
                </span>
              </div>

              <div className="assignment-body">
                <p className="assignment-description">{assignment.description}</p>

                <div className="assignment-details">
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{assignment.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Points:</span>
                    <span className="detail-value">{assignment.pointsPossible || 100}</span>
                  </div>
                  {assignment.dueAt && (
                    <div className="detail-item">
                      <span className="detail-label">Due:</span>
                      <span className="detail-value">
                        {new Date(assignment.dueAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="assignment-status">
                  {assignment.syncedToLMS ? (
                    <span className="sync-status synced">✓ Synced to LMS</span>
                  ) : (
                    <span className="sync-status pending">⏳ Not synced</span>
                  )}
                </div>
              </div>

              <div className="assignment-footer">
                <button
                  className="button secondary small"
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  👁️ View
                </button>
                <button
                  className="button secondary small"
                  onClick={() => handleSyncAssignment(assignment.id)}
                  disabled={loading}
                >
                  🔄 Sync
                </button>
                <button className="button secondary small">
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}

          {assignments.length === 0 && (
            <div className="no-assignments">
              <p>No assignments found</p>
              <button onClick={() => setShowCreateModal(true)}>
                Create your first assignment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAssignment}
        />
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          organizationId={organizationId}
          courseId={courseId}
          onClose={() => setSelectedAssignment(null)}
        />
      )}
    </div>
  );
};

// Create Assignment Modal
const CreateAssignmentModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'meeting',
    pointsPossible: 100,
    dueAt: '',
    published: true,
    createdBy: 'instructor-1' // Would come from current user
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Assignment</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form className="assignment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Assignment Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Week 5 Meeting Attendance"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the assignment..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="meeting">Meeting</option>
                <option value="quiz">Quiz</option>
                <option value="discussion">Discussion</option>
                <option value="file_upload">File Upload</option>
              </select>
            </div>

            <div className="form-group">
              <label>Points Possible *</label>
              <input
                type="number"
                value={formData.pointsPossible}
                onChange={(e) => handleChange('pointsPossible', parseInt(e.target.value))}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="datetime-local"
              value={formData.dueAt}
              onChange={(e) => handleChange('dueAt', e.target.value)}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => handleChange('published', e.target.checked)}
              />
              Publish immediately
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Assignment Details Modal
const AssignmentDetailsModal = ({ assignment, organizationId, courseId, onClose }) => {
  const [statistics, setStatistics] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    loadStatistics();
    loadSubmissions();
  }, [assignment]);

  const loadStatistics = async () => {
    try {
      const result = await lmsService.getAssignmentStatistics(organizationId, courseId, assignment.id);
      setStatistics(result.statistics);
    } catch (error) {
      setStatistics({
        totalSubmissions: 38,
        graded: 35,
        ungraded: 3,
        lateSubmissions: 5,
        averageGrade: 87.2
      });
    }
  };

  const loadSubmissions = async () => {
    try {
      const result = await lmsService.getSubmissions(organizationId, courseId, assignment.id);
      setSubmissions(result.submissions || []);
    } catch (error) {
      setSubmissions([]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{assignment.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="assignment-details-content">
          <div className="details-section">
            <h3>Assignment Information</h3>
            <p><strong>Type:</strong> {assignment.type}</p>
            <p><strong>Points:</strong> {assignment.pointsPossible || 100}</p>
            {assignment.dueAt && <p><strong>Due:</strong> {new Date(assignment.dueAt).toLocaleString()}</p>}
            <p><strong>Published:</strong> {assignment.published ? 'Yes' : 'No'}</p>
            <p className="description">{assignment.description}</p>
          </div>

          {statistics && (
            <div className="details-section">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-value">{statistics.totalSubmissions}</span>
                  <span className="stat-label">Total Submissions</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{statistics.graded}</span>
                  <span className="stat-label">Graded</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{statistics.ungraded}</span>
                  <span className="stat-label">Ungraded</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{statistics.averageGrade?.toFixed(1) || '-'}</span>
                  <span className="stat-label">Average Grade</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data
function generateMockAssignments() {
  return [
    {
      id: 'asn-1',
      name: 'Week 1 Meeting Attendance',
      description: 'Attendance for Week 1 online meeting',
      type: 'meeting',
      pointsPossible: 100,
      dueAt: '2025-10-10T23:59:00',
      published: true,
      syncedToLMS: true
    },
    {
      id: 'asn-2',
      name: 'Week 2 Discussion',
      description: 'Participate in the week 2 discussion on data structures',
      type: 'discussion',
      pointsPossible: 50,
      dueAt: '2025-10-17T23:59:00',
      published: true,
      syncedToLMS: false
    },
    {
      id: 'asn-3',
      name: 'Midterm Project',
      description: 'Submit your midterm project presentation',
      type: 'file_upload',
      pointsPossible: 200,
      dueAt: '2025-10-25T23:59:00',
      published: false,
      syncedToLMS: false
    }
  ];
}

export default AssignmentManager;
