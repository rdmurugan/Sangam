import React, { useState, useRef, useEffect } from 'react';
import { ReactionOverlay } from './Reactions';

const VideoPlayer = ({ stream, muted = false, userName, isLocal = false, reactions = [], isActiveSpeaker = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;

    const checkVideo = setInterval(() => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        clearInterval(checkVideo);
      }
    }, 500);

    setTimeout(() => clearInterval(checkVideo), 5000);

    return () => {
      clearInterval(checkVideo);
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream, userName]);

  const handleClick = () => {
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(err => console.warn('Play failed:', err));
    }
  };

  return (
    <div className={`gallery-video-container ${isActiveSpeaker ? 'active-speaker' : ''}`} onClick={handleClick} style={{ cursor: 'pointer', position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`gallery-video-player ${isLocal ? 'local-video' : ''}`}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          backgroundColor: '#000'
        }}
      />
      <div className="gallery-video-label">{userName}</div>
      {reactions.length > 0 && <ReactionOverlay reactions={reactions} />}
      {isActiveSpeaker && (
        <div className="speaking-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

const GalleryView = ({ localStream, peers, localUserName, reactions = new Map(), localSocketId, activeSpeaker, itemsPerPage = 9 }) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Combine local stream and peers into a single array
  const allParticipants = [];

  if (localStream) {
    allParticipants.push({
      id: localSocketId,
      stream: localStream,
      userName: localUserName + ' (You)',
      isLocal: true,
      reactions: reactions.get(localSocketId) || []
    });
  }

  // Add peers
  Array.from(peers.entries())
    .filter(([_, peerData]) => peerData.stream)
    .forEach(([socketId, peerData]) => {
      allParticipants.push({
        id: socketId,
        stream: peerData.stream,
        userName: peerData.userName,
        isLocal: false,
        reactions: reactions.get(socketId) || []
      });
    });

  const totalPages = Math.ceil(allParticipants.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = allParticipants.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Reset to first page if participants change and current page is out of bounds
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="gallery-view-container">
      <div className="gallery-grid">
        {currentParticipants.map((participant) => (
          <VideoPlayer
            key={participant.id}
            stream={participant.stream}
            userName={participant.userName}
            muted={participant.isLocal}
            isLocal={participant.isLocal}
            reactions={participant.reactions}
            isActiveSpeaker={activeSpeaker === participant.id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="gallery-pagination">
          <button
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            title="Previous page"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <span className="pagination-info">
            Page {currentPage + 1} of {totalPages} ({allParticipants.length} participants)
          </span>
          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            title="Next page"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
