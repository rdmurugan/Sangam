import React from 'react';
import '../styles/ConnectionIndicator.css';

const ConnectionIndicator = ({ quality }) => {
  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return '#4caf50';
      case 'good':
        return '#8bc34a';
      case 'fair':
        return '#ff9800';
      case 'poor':
        return '#f44336';
      default:
        return '#888';
    }
  };

  const getQualityText = () => {
    switch (quality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className="connection-indicator">
      <div
        className="connection-dot"
        style={{ backgroundColor: getQualityColor() }}
      />
      <span className="connection-text">{getQualityText()}</span>
    </div>
  );
};

export default ConnectionIndicator;
