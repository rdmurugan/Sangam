import React, { useState, useEffect } from 'react';
import '../styles/MeetingAnalytics.css';

const MeetingAnalytics = ({ socket, roomId, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [talkTimeData, setTalkTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch analytics data
  const fetchAnalytics = () => {
    if (socket) {
      socket.emit('get-meeting-analytics', { roomId });
      socket.emit('get-meeting-summary', { roomId });
      socket.emit('get-talk-time-distribution', { roomId });
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Initial fetch
    fetchAnalytics();

    // Listen for analytics updates
    const handleMeetingAnalytics = (data) => {
      setAnalytics(data);
      setLoading(false);
    };

    const handleMeetingSummary = (data) => {
      setSummary(data);
    };

    const handleTalkTimeDistribution = (data) => {
      setTalkTimeData(data);
    };

    socket.on('meeting-analytics', handleMeetingAnalytics);
    socket.on('meeting-summary', handleMeetingSummary);
    socket.on('talk-time-distribution', handleTalkTimeDistribution);

    // Auto-refresh every 10 seconds if enabled
    let refreshInterval;
    if (autoRefresh) {
      refreshInterval = setInterval(fetchAnalytics, 10000);
    }

    return () => {
      socket.off('meeting-analytics', handleMeetingAnalytics);
      socket.off('meeting-summary', handleMeetingSummary);
      socket.off('talk-time-distribution', handleTalkTimeDistribution);
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [socket, roomId, autoRefresh]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#6a9e4a';
    if (score >= 60) return '#e8a83a';
    if (score >= 40) return '#e87a3a';
    return '#e84a3a';
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😔';
      default:
        return '😐';
    }
  };

  const renderOverviewTab = () => {
    if (!analytics) return <div className="loading">Loading analytics...</div>;

    return (
      <div className="analytics-overview">
        {/* Health Score Card */}
        <div className="analytics-card health-score-card">
          <div className="card-header">
            <h3>📊 Meeting Health Score</h3>
            {analytics.healthScore !== null && (
              <div
                className="health-score-badge"
                style={{ backgroundColor: getHealthScoreColor(analytics.healthScore) }}
              >
                {analytics.healthScore}/100
              </div>
            )}
          </div>
          <div className="card-content">
            {analytics.healthScore !== null ? (
              <>
                <div className="health-score-visual">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#333"
                      strokeWidth="15"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={getHealthScoreColor(analytics.healthScore)}
                      strokeWidth="15"
                      strokeDasharray={`${(analytics.healthScore / 100) * 502.4} 502.4`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                    <text
                      x="100"
                      y="100"
                      textAnchor="middle"
                      dy="10"
                      fontSize="40"
                      fontWeight="bold"
                      fill="#fff"
                    >
                      {analytics.healthScore}
                    </text>
                  </svg>
                </div>
                {analytics.healthFactors && (
                  <div className="health-factors">
                    {Object.entries(analytics.healthFactors).map(([factor, score]) => (
                      <div key={factor} className="health-factor">
                        <span className="factor-name">
                          {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <div className="factor-bar">
                          <div
                            className="factor-fill"
                            style={{
                              width: `${(score / 30) * 100}%`,
                              backgroundColor: getHealthScoreColor((score / 30) * 100)
                            }}
                          />
                        </div>
                        <span className="factor-score">{Math.round(score)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">Health score will be calculated during the meeting</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="analytics-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{analytics.totalParticipants}</div>
            <div className="stat-label">Participants</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatDuration(analytics.duration)}</div>
            <div className="stat-label">Duration</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{analytics.totalChatMessages}</div>
            <div className="stat-label">Messages</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎭</div>
            <div className="stat-value">{analytics.totalReactions}</div>
            <div className="stat-label">Reactions</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📺</div>
            <div className="stat-value">{analytics.totalScreenShares}</div>
            <div className="stat-label">Screen Shares</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">{getSentimentIcon(analytics.overallSentiment)}</div>
            <div className="stat-value">{analytics.overallSentiment}</div>
            <div className="stat-label">Sentiment</div>
          </div>
        </div>

        {/* Summary Insights */}
        {summary && (
          <div className="analytics-card">
            <h3>💡 Meeting Insights</h3>
            <div className="insights-grid">
              {summary.highlights.length > 0 && (
                <div className="insight-section highlights">
                  <h4>✨ Highlights</h4>
                  <ul>
                    {summary.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.concerns.length > 0 && (
                <div className="insight-section concerns">
                  <h4>⚠️ Concerns</h4>
                  <ul>
                    {summary.concerns.map((concern, index) => (
                      <li key={index}>{concern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.recommendations.length > 0 && (
                <div className="insight-section recommendations">
                  <h4>💡 Recommendations</h4>
                  <ul>
                    {summary.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAttendanceTab = () => {
    if (!analytics) return <div className="loading">Loading analytics...</div>;

    return (
      <div className="analytics-attendance">
        <div className="analytics-card">
          <h3>📋 Attendance Overview</h3>
          <div className="attendance-stats">
            <div className="attendance-stat">
              <span className="stat-label">Total Participants:</span>
              <span className="stat-value">{analytics.totalParticipants}</span>
            </div>
            <div className="attendance-stat">
              <span className="stat-label">Unique Participants:</span>
              <span className="stat-value">{analytics.uniqueParticipants}</span>
            </div>
            <div className="attendance-stat">
              <span className="stat-label">Late Arrivals:</span>
              <span className="stat-value">{analytics.lateArrivals.length}</span>
            </div>
            <div className="attendance-stat">
              <span className="stat-label">Early Leavers:</span>
              <span className="stat-value">{analytics.earlyLeavers.length}</span>
            </div>
          </div>
        </div>

        {/* Participants List */}
        <div className="analytics-card">
          <h3>👥 Participant Details</h3>
          <div className="participants-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Join Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Messages</th>
                  <th>Reactions</th>
                </tr>
              </thead>
              <tbody>
                {analytics.participants.map((participant, index) => (
                  <tr key={index}>
                    <td>{participant.userName}</td>
                    <td>{formatTime(participant.joinTime)}</td>
                    <td>{formatDuration(participant.duration)}</td>
                    <td>
                      {participant.wasLate && (
                        <span className="status-badge late">
                          Late ({participant.minutesLate}min)
                        </span>
                      )}
                      {participant.leaveTime ? (
                        <span className="status-badge left">Left</span>
                      ) : (
                        <span className="status-badge active">Active</span>
                      )}
                    </td>
                    <td>{participant.chatMessages}</td>
                    <td>{participant.reactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Late Arrivals */}
        {analytics.lateArrivals.length > 0 && (
          <div className="analytics-card">
            <h3>⏰ Late Arrivals</h3>
            <div className="late-arrivals-list">
              {analytics.lateArrivals.map((arrival, index) => (
                <div key={index} className="late-arrival-item">
                  <span className="participant-name">{arrival.userName}</span>
                  <span className="late-time">{arrival.minutesLate} minutes late</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEngagementTab = () => {
    if (!analytics) return <div className="loading">Loading analytics...</div>;

    const avgEngagement = analytics.engagementRate || 0;

    return (
      <div className="analytics-engagement">
        <div className="analytics-card">
          <h3>🔥 Engagement Metrics</h3>
          <div className="engagement-overview">
            <div className="engagement-metric">
              <div className="metric-icon">💬</div>
              <div className="metric-content">
                <div className="metric-value">{analytics.totalChatMessages}</div>
                <div className="metric-label">Total Messages</div>
                <div className="metric-avg">
                  {(analytics.totalChatMessages / analytics.totalParticipants).toFixed(1)} per person
                </div>
              </div>
            </div>

            <div className="engagement-metric">
              <div className="metric-icon">🎭</div>
              <div className="metric-content">
                <div className="metric-value">{analytics.totalReactions}</div>
                <div className="metric-label">Total Reactions</div>
                <div className="metric-avg">
                  {(analytics.totalReactions / analytics.totalParticipants).toFixed(1)} per person
                </div>
              </div>
            </div>

            <div className="engagement-metric">
              <div className="metric-icon">📺</div>
              <div className="metric-content">
                <div className="metric-value">{analytics.totalScreenShares}</div>
                <div className="metric-label">Screen Shares</div>
              </div>
            </div>

            <div className="engagement-metric">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{avgEngagement.toFixed(1)}</div>
                <div className="metric-label">Engagement Rate</div>
                <div className="metric-subtitle">interactions/person</div>
              </div>
            </div>
          </div>
        </div>

        {/* Participant Engagement */}
        <div className="analytics-card">
          <h3>👥 Individual Engagement</h3>
          <div className="participant-engagement-list">
            {analytics.participants
              .sort((a, b) => (b.chatMessages + b.reactions) - (a.chatMessages + a.reactions))
              .map((participant, index) => {
                const totalEngagement = participant.chatMessages + participant.reactions;
                return (
                  <div key={index} className="participant-engagement-item">
                    <div className="participant-info">
                      <span className="rank">#{index + 1}</span>
                      <span className="participant-name">{participant.userName}</span>
                    </div>
                    <div className="engagement-breakdown">
                      <div className="engagement-stat">
                        <span className="stat-icon">💬</span>
                        <span>{participant.chatMessages}</span>
                      </div>
                      <div className="engagement-stat">
                        <span className="stat-icon">🎭</span>
                        <span>{participant.reactions}</span>
                      </div>
                      <div className="engagement-stat">
                        <span className="stat-icon">📺</span>
                        <span>{participant.screenShares}</span>
                      </div>
                    </div>
                    <div className="engagement-total">
                      Total: {totalEngagement}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div className="analytics-card">
          <h3>💭 Sentiment Analysis</h3>
          <div className="sentiment-overview">
            <div className="sentiment-score">
              <div className="sentiment-icon large">
                {getSentimentIcon(analytics.overallSentiment)}
              </div>
              <div className="sentiment-label">{analytics.overallSentiment}</div>
              <div className="sentiment-value">
                Score: {(analytics.sentimentScore * 100).toFixed(0)}%
              </div>
            </div>
            <div className="sentiment-description">
              {analytics.overallSentiment === 'positive' && (
                <p>The meeting had a positive atmosphere with constructive discussions.</p>
              )}
              {analytics.overallSentiment === 'neutral' && (
                <p>The meeting maintained a neutral tone throughout discussions.</p>
              )}
              {analytics.overallSentiment === 'negative' && (
                <p>The meeting showed some concerns or challenges in discussions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTalkTimeTab = () => {
    if (!analytics || !talkTimeData) return <div className="loading">Loading talk time data...</div>;

    return (
      <div className="analytics-talktime">
        <div className="analytics-card">
          <h3>🎤 Talk Time Distribution</h3>
          <div className="talktime-overview">
            <div className="talktime-stat">
              <span className="stat-label">Active Speakers:</span>
              <span className="stat-value">{talkTimeData.totalSpeakers}</span>
            </div>
            <div className="talktime-stat">
              <span className="stat-label">Silent Participants:</span>
              <span className="stat-value">
                {talkTimeData.silentParticipants} ({talkTimeData.silentPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Dominant Speakers */}
        {talkTimeData.dominantSpeakers.length > 0 && (
          <div className="analytics-card">
            <h3>🗣️ Top Speakers</h3>
            <div className="dominant-speakers-list">
              {talkTimeData.dominantSpeakers.map((speaker, index) => (
                <div key={index} className="speaker-item">
                  <div className="speaker-rank">#{index + 1}</div>
                  <div className="speaker-info">
                    <div className="speaker-name">{speaker.userName}</div>
                    <div className="speaker-time">{formatDuration(speaker.totalTime)}</div>
                  </div>
                  <div className="speaker-bar">
                    <div
                      className="speaker-fill"
                      style={{ width: `${speaker.percentage}%` }}
                    />
                  </div>
                  <div className="speaker-percentage">{speaker.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participation Balance */}
        <div className="analytics-card">
          <h3>⚖️ Participation Balance</h3>
          <div className="balance-visualization">
            <svg width="100%" height="300" viewBox="0 0 800 300">
              {talkTimeData.dominantSpeakers.map((speaker, index) => {
                const barWidth = (speaker.percentage / 100) * 600;
                const x = 100;
                const y = index * 50 + 20;
                return (
                  <g key={index}>
                    <text x="10" y={y + 20} fill="#999" fontSize="14">
                      {speaker.userName}
                    </text>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height="30"
                      fill="#4a90e2"
                      rx="5"
                    />
                    <text x={x + barWidth + 10} y={y + 20} fill="#fff" fontSize="14">
                      {speaker.percentage}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {talkTimeData.silentPercentage > 50 && (
            <div className="balance-warning">
              ⚠️ Over {talkTimeData.silentPercentage}% of participants were silent.
              Consider encouraging more participation.
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics-overlay">
        <div className="analytics-modal loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-overlay">
      <div className="analytics-modal">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-left">
            <h2>📊 Meeting Analytics</h2>
            {analytics && (
              <span className="meeting-title">{analytics.title}</span>
            )}
          </div>
          <div className="header-right">
            <button
              className={`refresh-btn ${autoRefresh ? 'active' : ''}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              🔄
            </button>
            <button className="refresh-btn" onClick={fetchAnalytics}>
              Refresh
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="analytics-tabs">
          <button
            className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`analytics-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </button>
          <button
            className={`analytics-tab ${activeTab === 'engagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('engagement')}
          >
            Engagement
          </button>
          <button
            className={`analytics-tab ${activeTab === 'talktime' ? 'active' : ''}`}
            onClick={() => setActiveTab('talktime')}
          >
            Talk Time
          </button>
        </div>

        {/* Content */}
        <div className="analytics-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'attendance' && renderAttendanceTab()}
          {activeTab === 'engagement' && renderEngagementTab()}
          {activeTab === 'talktime' && renderTalkTimeTab()}
        </div>
      </div>
    </div>
  );
};

export default MeetingAnalytics;
