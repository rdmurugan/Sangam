import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIAssistant.css';

// SVG Icons
const AIIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 11.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5zm-2 5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5zM17.5 17c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2zm-2-11c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2zM19 8.5c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5zM11 4.07V3c0-.55-.45-1-1-1s-1 .45-1 1v1.07C7.61 4.56 7 5.79 7 7.13v5.74c0 1.34.61 2.57 2 3.06V17c0 .55.45 1 1 1s1-.45 1-1v-1.07c1.39-.49 2-1.72 2-3.06V7.13c0-1.34-.61-2.57-2-3.06zm0 9.06c0 1.1-.9 2-2 2s-2-.9-2-2V7.13c0-1.1.9-2 2-2s2 .9 2 2v5.99z"/>
  </svg>
);

const SummaryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

const ActionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c1.57 0 3.04.46 4.28 1.25l1.45-1.45C16.1 2.67 14.13 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c1.73 0 3.36-.44 4.78-1.22l-1.5-1.5c-1 .46-2.11.72-3.28.72z"/>
  </svg>
);

const HighlightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 14l3 3-3 3v-6zm0-6l3 3-3 3V8zm12.59 6.41L16 11l-4 4-4-4L5.41 13.59 12 20.17l6.59-6.58zM12 3.83L5.41 10.42 8 13l4-4 4 4 2.59-2.58L12 3.83z"/>
  </svg>
);

const TranscriptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const AIAssistant = ({ socket, roomId, userName, isHost }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState(null);
  const [actionItems, setActionItems] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for transcript updates
    socket.on('transcript-update', ({ userName, text, language, timestamp, socketId }) => {
      setTranscript(prev => [...prev, {
        userName,
        text,
        language,
        timestamp,
        socketId,
        id: Date.now() + Math.random()
      }]);
    });

    // Listen for AI summary
    socket.on('ai-summary-generated', (summaryData) => {
      setSummary(summaryData);
      if (summaryData.actionItems) {
        setActionItems(summaryData.actionItems);
      }
      if (summaryData.highlights) {
        setHighlights(summaryData.highlights);
      }
      setIsGenerating(false);
    });

    return () => {
      socket.off('transcript-update');
      socket.off('ai-summary-generated');
    };
  }, [socket]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleToggleRecording = () => {
    if (isRecording) {
      socket?.emit('stop-ai-recording', { roomId });
      setIsRecording(false);
    } else {
      socket?.emit('start-ai-recording', { roomId });
      setIsRecording(true);
    }
  };

  const handleGenerateSummary = async () => {
    if (transcript.length === 0) {
      alert('No transcript available to summarize');
      return;
    }

    setIsGenerating(true);

    // Format transcript for AI
    const formattedTranscript = transcript
      .map(t => `${t.userName}: ${t.text}`)
      .join('\n');

    socket?.emit('generate-ai-summary', {
      roomId,
      transcript: formattedTranscript,
      userName
    });
  };

  const handleDownloadTranscript = () => {
    const formattedTranscript = transcript
      .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.userName}: ${t.text}`)
      .join('\n');

    const blob = new Blob([formattedTranscript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${roomId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    if (!summary) {
      alert('Please generate a summary first');
      return;
    }

    socket?.emit('send-summary-email', {
      roomId,
      summary,
      transcript: transcript.map(t => `${t.userName}: ${t.text}`).join('\n')
    });

    alert('Summary email sent to all participants!');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderSummary = () => {
    if (!summary) {
      return (
        <div className="ai-empty-state">
          <AIIcon />
          <p>No summary generated yet</p>
          <p className="ai-hint">Click "Generate Summary" to create an AI-powered meeting summary</p>
          <button
            className="ai-action-btn primary"
            onClick={handleGenerateSummary}
            disabled={isGenerating || transcript.length === 0}
          >
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>
      );
    }

    return (
      <div className="ai-summary-content">
        <div className="summary-section">
          <h4>Executive Summary</h4>
          <p className="summary-text">{summary.summary}</p>
        </div>

        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <div className="summary-section">
            <h4>Key Discussion Points</h4>
            <ul className="summary-list">
              {summary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.decisions && summary.decisions.length > 0 && (
          <div className="summary-section">
            <h4>Decisions Made</h4>
            <ul className="summary-list decisions">
              {summary.decisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.followUps && summary.followUps.length > 0 && (
          <div className="summary-section">
            <h4>Follow-up Topics</h4>
            <ul className="summary-list">
              {summary.followUps.map((followUp, index) => (
                <li key={index}>{followUp}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="summary-actions">
          <button className="ai-action-btn" onClick={handleGenerateSummary}>
            Regenerate
          </button>
          <button className="ai-action-btn" onClick={handleDownloadTranscript}>
            <DownloadIcon />
            Download
          </button>
          <button className="ai-action-btn" onClick={handleSendEmail}>
            <EmailIcon />
            Email Summary
          </button>
        </div>
      </div>
    );
  };

  const renderActionItems = () => {
    if (actionItems.length === 0) {
      return (
        <div className="ai-empty-state">
          <ActionIcon />
          <p>No action items extracted yet</p>
          <p className="ai-hint">Generate a summary to automatically extract action items</p>
        </div>
      );
    }

    return (
      <div className="action-items-list">
        {actionItems.map((item, index) => (
          <div key={index} className="action-item-card">
            <div className="action-item-header">
              <span className="action-assignee">{item.assignee}</span>
              <span
                className="action-priority"
                style={{ backgroundColor: getPriorityColor(item.priority) }}
              >
                {item.priority}
              </span>
            </div>
            <p className="action-task">{item.task}</p>
            {item.dueDate && (
              <span className="action-due-date">Due: {item.dueDate}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderHighlights = () => {
    if (highlights.length === 0) {
      return (
        <div className="ai-empty-state">
          <HighlightIcon />
          <p>No highlights detected yet</p>
          <p className="ai-hint">Important moments and decisions will appear here</p>
        </div>
      );
    }

    return (
      <div className="highlights-list">
        {highlights.map((highlight, index) => (
          <div key={index} className={`highlight-card ${highlight.type}`}>
            <div className="highlight-meta">
              <span className="highlight-type">{highlight.type}</span>
              <span className="highlight-time">
                {Math.floor(highlight.timestamp / 60)}:{String(highlight.timestamp % 60).padStart(2, '0')}
              </span>
            </div>
            <p className="highlight-text">{highlight.text}</p>
            <span className="highlight-speaker">{highlight.speaker}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderTranscript = () => {
    if (transcript.length === 0) {
      return (
        <div className="ai-empty-state">
          <TranscriptIcon />
          <p>No transcript available</p>
          <p className="ai-hint">Start AI recording to capture the meeting transcript</p>
        </div>
      );
    }

    return (
      <div className="transcript-list">
        {transcript.map((entry) => (
          <div key={entry.id} className="transcript-entry">
            <div className="transcript-meta">
              <span className="transcript-speaker">{entry.userName}</span>
              <span className="transcript-time">{formatTime(entry.timestamp)}</span>
            </div>
            <p className="transcript-text">{entry.text}</p>
          </div>
        ))}
        <div ref={transcriptEndRef} />
      </div>
    );
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <h3>
          <AIIcon />
          <span>AI Meeting Assistant</span>
        </h3>
        <button
          className={`ai-recording-toggle ${isRecording ? 'active' : ''}`}
          onClick={handleToggleRecording}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <>
              <span className="recording-dot"></span>
              Recording
            </>
          ) : (
            'Start AI'
          )}
        </button>
      </div>

      <div className="ai-tabs">
        <button
          className={`ai-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <SummaryIcon />
          <span>Summary</span>
        </button>
        <button
          className={`ai-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <ActionIcon />
          <span>Actions</span>
          {actionItems.length > 0 && (
            <span className="ai-badge">{actionItems.length}</span>
          )}
        </button>
        <button
          className={`ai-tab ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
        >
          <HighlightIcon />
          <span>Highlights</span>
        </button>
        <button
          className={`ai-tab ${activeTab === 'transcript' ? 'active' : ''}`}
          onClick={() => setActiveTab('transcript')}
        >
          <TranscriptIcon />
          <span>Transcript</span>
        </button>
      </div>

      <div className="ai-content">
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'actions' && renderActionItems()}
        {activeTab === 'highlights' && renderHighlights()}
        {activeTab === 'transcript' && renderTranscript()}
      </div>

      {isRecording && (
        <div className="ai-footer">
          <span className="recording-indicator">
            <span className="recording-dot"></span>
            AI is listening and capturing transcript...
          </span>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
