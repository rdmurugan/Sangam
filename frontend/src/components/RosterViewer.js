/**
 * Roster Viewer Component
 * Display and manage course roster (students and instructors)
 */

import React, { useState, useEffect } from 'react';
import lmsService from '../services/lmsService';
import '../styles/RosterViewer.css';

const RosterViewer = ({ organizationId, courseId, platform }) => {
  const [roster, setRoster] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, students, instructors
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadRoster();
    loadStatistics();
  }, [organizationId, courseId]);

  const loadRoster = async () => {
    setLoading(true);
    try {
      const result = await lmsService.getRoster(organizationId, courseId);
      setRoster(result.roster);
      setLastSync(result.roster.lastSync);
    } catch (error) {
      console.error('Failed to load roster:', error);
      // For demo purposes, use mock data
      setRoster({
        students: generateMockStudents(45),
        instructors: generateMockInstructors(2),
        lastSync: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await lmsService.getRosterStatistics(organizationId, courseId);
      setStatistics(result.statistics);
    } catch (error) {
      // Mock statistics
      setStatistics({
        totalStudents: 45,
        totalInstructors: 2,
        totalParticipants: 47,
        activeStudents: 42,
        inactiveStudents: 3
      });
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await lmsService.syncRoster(organizationId, courseId, platform);
      await loadRoster();
      await loadStatistics();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    lmsService.exportRoster(organizationId, courseId);
  };

  const getFilteredParticipants = () => {
    if (!roster) return [];

    let participants = [];

    if (filterRole === 'all' || filterRole === 'students') {
      participants = [...participants, ...roster.students.map(s => ({ ...s, role: 'Student' }))];
    }

    if (filterRole === 'all' || filterRole === 'instructors') {
      participants = [...participants, ...roster.instructors.map(i => ({ ...i, role: 'Instructor' }))];
    }

    if (searchTerm) {
      participants = participants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return participants;
  };

  if (loading && !roster) {
    return (
      <div className="roster-viewer loading">
        <div className="spinner"></div>
        <p>Loading roster...</p>
      </div>
    );
  }

  const filteredParticipants = getFilteredParticipants();

  return (
    <div className="roster-viewer">
      {/* Statistics Cards */}
      {statistics && (
        <div className="roster-stats">
          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <div className="stat-content">
              <span className="stat-value">{statistics.totalParticipants}</span>
              <span className="stat-label">Total Participants</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎓</span>
            <div className="stat-content">
              <span className="stat-value">{statistics.totalStudents}</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👨‍🏫</span>
            <div className="stat-content">
              <span className="stat-value">{statistics.totalInstructors}</span>
              <span className="stat-label">Instructors</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✓</span>
            <div className="stat-content">
              <span className="stat-value">{statistics.activeStudents}</span>
              <span className="stat-label">Active Students</span>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="roster-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Participants</option>
            <option value="students">Students Only</option>
            <option value="instructors">Instructors Only</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="button secondary" onClick={handleExport}>
            📥 Export CSV
          </button>
          <button className="button primary" onClick={handleSync} disabled={loading}>
            {loading ? '⏳ Syncing...' : '🔄 Sync Roster'}
          </button>
        </div>
      </div>

      {/* Last Sync Info */}
      {lastSync && (
        <div className="sync-info">
          Last synced: {new Date(lastSync).toLocaleString()}
        </div>
      )}

      {/* Roster Table */}
      <div className="roster-table-container">
        <table className="roster-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant, index) => (
                <tr key={index}>
                  <td>
                    <div className="participant-name">
                      <span className="avatar">{participant.name.charAt(0)}</span>
                      <span>{participant.name}</span>
                    </div>
                  </td>
                  <td>{participant.email}</td>
                  <td>
                    <span className={`role-badge ${participant.role.toLowerCase()}`}>
                      {participant.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${participant.status || 'active'}`}>
                      {participant.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <button className="action-button" title="View details">👁️</button>
                    <button className="action-button" title="Send message">✉️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  {searchTerm ? 'No participants match your search' : 'No participants found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredParticipants.length} of {roster?.students?.length + roster?.instructors?.length || 0} participants
      </div>
    </div>
  );
};

// Mock data generators for demo
function generateMockStudents(count) {
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

  return Array.from({ length: count }, (_, i) => ({
    id: `student-${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `student${i + 1}@school.edu`,
    status: i % 15 === 0 ? 'inactive' : 'active'
  }));
}

function generateMockInstructors(count) {
  const names = [
    { first: 'Dr. Sarah', last: 'Anderson' },
    { first: 'Prof. Michael', last: 'Chen' }
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `instructor-${i + 1}`,
    name: `${names[i].first} ${names[i].last}`,
    email: `${names[i].last.toLowerCase()}@school.edu`,
    status: 'active'
  }));
}

export default RosterViewer;
