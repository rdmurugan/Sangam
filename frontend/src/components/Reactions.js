import React, { useState } from 'react';

const REACTIONS = [
  { emoji: '👍', name: 'thumbs-up', label: 'Thumbs Up' },
  { emoji: '👏', name: 'clap', label: 'Clap' },
  { emoji: '❤️', name: 'heart', label: 'Heart' },
  { emoji: '😂', name: 'laugh', label: 'Laugh' },
  { emoji: '🙋', name: 'raise-hand', label: 'Raise Hand' },
  { emoji: '🎉', name: 'celebrate', label: 'Celebrate' },
  { emoji: '👎', name: 'thumbs-down', label: 'Thumbs Down' },
  { emoji: '🤔', name: 'thinking', label: 'Thinking' }
];

const Reactions = ({ onReact, isOpen, onToggle }) => {
  const [selectedReaction, setSelectedReaction] = useState(null);

  const handleReaction = (reaction) => {
    setSelectedReaction(reaction.emoji);
    onReact(reaction);
    onToggle(); // Close the reactions panel after selecting

    // Clear selection after animation
    setTimeout(() => setSelectedReaction(null), 1000);
  };

  return (
    <div className={`reactions-container ${isOpen ? 'open' : ''}`}>
      <button
        className="reactions-toggle"
        onClick={onToggle}
        title="Reactions"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
        <span>React</span>
      </button>

      {isOpen && (
        <div className="reactions-panel">
          <div className="reactions-grid">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.name}
                className={`reaction-btn ${selectedReaction === reaction.emoji ? 'selected' : ''}`}
                onClick={() => handleReaction(reaction)}
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component to display reactions on video feeds
export const ReactionOverlay = ({ reactions }) => {
  return (
    <div className="reaction-overlay">
      {reactions.map((reaction, index) => (
        <div
          key={`${reaction.id}-${index}`}
          className="floating-reaction"
          style={{
            animationDelay: `${index * 0.1}s`,
            left: `${Math.random() * 80 + 10}%`
          }}
        >
          {reaction.emoji}
        </div>
      ))}
    </div>
  );
};

export default Reactions;
