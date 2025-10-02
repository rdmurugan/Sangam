import React, { useState, useEffect } from 'react';

// Professional SVG Icons
const PollIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const Polls = ({ socket, roomId, isHost, userName }) => {
  const [polls, setPolls] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [myVotes, setMyVotes] = useState({}); // pollId -> array of option indices

  useEffect(() => {
    if (!socket) return;

    // Listen for new polls
    socket.on('poll-created', (poll) => {
      setPolls(prev => [...prev, poll]);
    });

    // Listen for vote updates from other users
    socket.on('poll-vote-update', ({ pollId, voterName, optionIds }) => {
      setPolls(prev => prev.map(poll => {
        if (poll.id !== pollId) return poll;

        const updatedOptions = poll.options.map(option => {
          const wasVoted = option.voters.includes(voterName);
          const isVoted = optionIds.includes(option.id);

          if (wasVoted && !isVoted) {
            // Remove vote
            return {
              ...option,
              votes: option.votes - 1,
              voters: option.voters.filter(v => v !== voterName)
            };
          } else if (!wasVoted && isVoted) {
            // Add vote
            return {
              ...option,
              votes: option.votes + 1,
              voters: [...option.voters, voterName]
            };
          }
          return option;
        });

        return { ...poll, options: updatedOptions };
      }));
    });

    // Listen for poll ended
    socket.on('poll-ended', ({ pollId }) => {
      setPolls(prev => prev.map(p => p.id === pollId ? { ...p, isActive: false } : p));
    });

    return () => {
      socket.off('poll-created');
      socket.off('poll-vote-update');
      socket.off('poll-ended');
    };
  }, [socket]);

  const handleCreatePoll = () => {
    if (!pollQuestion.trim()) {
      alert('Please enter a poll question');
      return;
    }

    const validOptions = pollOptions.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    const poll = {
      id: Date.now(),
      question: pollQuestion.trim(),
      options: validOptions.map((opt, index) => ({
        id: index,
        text: opt.trim(),
        votes: 0,
        voters: []
      })),
      allowMultipleVotes,
      createdBy: userName,
      createdAt: Date.now(),
      isActive: true
    };

    socket?.emit('create-poll', { roomId, poll });

    // Reset form
    setPollQuestion('');
    setPollOptions(['', '']);
    setAllowMultipleVotes(false);
    setShowCreatePoll(false);
  };

  const handleVote = (pollId, optionId) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !poll.isActive) return;

    const currentVotes = myVotes[pollId] || [];

    let newVotes;
    if (poll.allowMultipleVotes) {
      // Toggle vote for this option
      if (currentVotes.includes(optionId)) {
        newVotes = currentVotes.filter(id => id !== optionId);
      } else {
        newVotes = [...currentVotes, optionId];
      }
    } else {
      // Single vote - replace existing vote
      newVotes = [optionId];
    }

    // Update local state immediately
    setMyVotes(prev => ({ ...prev, [pollId]: newVotes }));

    // Update poll counts locally
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p;

      const updatedOptions = p.options.map(option => {
        const wasVoted = currentVotes.includes(option.id);
        const isVoted = newVotes.includes(option.id);

        if (wasVoted && !isVoted) {
          // Remove vote
          return {
            ...option,
            votes: option.votes - 1,
            voters: option.voters.filter(v => v !== userName)
          };
        } else if (!wasVoted && isVoted) {
          // Add vote
          return {
            ...option,
            votes: option.votes + 1,
            voters: [...option.voters, userName]
          };
        }
        return option;
      });

      return { ...p, options: updatedOptions };
    }));

    // Broadcast vote to other users
    socket?.emit('vote-poll', { roomId, pollId, optionIds: newVotes, voterName: userName });
  };

  const handleEndPoll = (pollId) => {
    if (window.confirm('Are you sure you want to end this poll?')) {
      socket?.emit('end-poll', { roomId, pollId });
    }
  };

  const addOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removeOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const calculatePercentage = (option, poll) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * 100);
  };

  return (
    <div className="polls-container">
      <div className="polls-header">
        <h3>
          <PollIcon />
          <span>Polls</span>
        </h3>
        {isHost && (
          <button
            className="create-poll-button"
            onClick={() => setShowCreatePoll(!showCreatePoll)}
            title="Create Poll"
          >
            {showCreatePoll ? <CloseIcon /> : <AddIcon />}
          </button>
        )}
      </div>

      {showCreatePoll && (
        <div className="poll-create-form">
          <h4>Create New Poll</h4>

          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              placeholder="Enter your poll question"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="poll-input"
            />
          </div>

          <div className="form-group">
            <label>Options</label>
            {pollOptions.map((option, index) => (
              <div key={index} className="poll-option-input">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="poll-input"
                />
                {pollOptions.length > 2 && (
                  <button
                    className="remove-option-btn"
                    onClick={() => removeOption(index)}
                    title="Remove option"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 10 && (
              <button className="add-option-btn" onClick={addOption}>
                <AddIcon />
                <span>Add Option</span>
              </button>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowMultipleVotes}
                onChange={(e) => setAllowMultipleVotes(e.target.checked)}
              />
              <span>Allow multiple answers</span>
            </label>
          </div>

          <button className="create-poll-submit" onClick={handleCreatePoll}>
            Create Poll
          </button>
        </div>
      )}

      <div className="polls-list">
        {polls.length === 0 ? (
          <div className="polls-empty">
            <PollIcon />
            <p>No polls yet</p>
            {isHost && <p className="polls-empty-hint">Create a poll to get started</p>}
          </div>
        ) : (
          polls.map((poll) => (
            <div key={poll.id} className={`poll-item ${!poll.isActive ? 'poll-ended' : ''}`}>
              <div className="poll-header-row">
                <div className="poll-question">{poll.question}</div>
                {!poll.isActive && <span className="poll-ended-badge">Ended</span>}
              </div>

              <div className="poll-meta">
                By {poll.createdBy} • {new Date(poll.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {poll.allowMultipleVotes && <span className="multi-vote-badge">Multiple answers allowed</span>}
              </div>

              <div className="poll-options">
                {poll.options.map((option) => {
                  const percentage = calculatePercentage(option, poll);
                  const isVoted = myVotes[poll.id]?.includes(option.id);

                  return (
                    <div key={option.id} className="poll-option-wrapper">
                      <button
                        className={`poll-option ${isVoted ? 'voted' : ''} ${!poll.isActive ? 'disabled' : ''}`}
                        onClick={() => handleVote(poll.id, option.id)}
                        disabled={!poll.isActive}
                      >
                        <div className="poll-option-content">
                          <div className="poll-option-text">
                            {isVoted && <CheckIcon />}
                            <span>{option.text}</span>
                          </div>
                          <div className="poll-option-stats">
                            <span className="poll-votes">{option.votes} {option.votes === 1 ? 'vote' : 'votes'}</span>
                            <span className="poll-percentage">{percentage}%</span>
                          </div>
                        </div>
                        <div className="poll-progress-bar" style={{ width: `${percentage}%` }}></div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {isHost && poll.isActive && (
                <button
                  className="end-poll-btn"
                  onClick={() => handleEndPoll(poll.id)}
                >
                  End Poll
                </button>
              )}

              {!poll.isActive && (
                <div className="poll-total-votes">
                  Total votes: {poll.options.reduce((sum, opt) => sum + opt.votes, 0)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Polls;
