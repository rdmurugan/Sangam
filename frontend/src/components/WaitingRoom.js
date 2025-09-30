import React from 'react';

const WaitingRoom = () => {
  return (
    <div className="waiting-room">
      <div className="waiting-content">
        <div className="spinner"></div>
        <h2>Please wait</h2>
        <p>The host will let you in soon...</p>
      </div>
    </div>
  );
};

export default WaitingRoom;