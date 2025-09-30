import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ stream, muted = false, userName, isLocal = false }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      // Important for mobile: ensure video plays
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playing successfully for:', userName);
          })
          .catch(error => {
            console.error('Error playing video for', userName, ':', error);
            // Try again after user interaction on mobile
            if (!muted) {
              setTimeout(() => {
                videoRef.current?.play().catch(e => console.error('Retry failed:', e));
              }, 1000);
            }
          });
      }
    }
  }, [stream, userName, muted]);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`video-player ${isLocal ? 'local-video' : ''}`}
        webkit-playsinline="true"
      />
      <div className="video-label">{userName}</div>
    </div>
  );
};

const VideoGrid = ({ localStream, peers, localUserName }) => {
  console.log('VideoGrid rendering - peers count:', peers.size);
  console.log('VideoGrid peers:', Array.from(peers.entries()));

  return (
    <div className="video-grid">
      {localStream && (
        <VideoPlayer
          stream={localStream}
          muted={true}
          userName={localUserName + ' (You)'}
          isLocal={true}
        />
      )}
      {Array.from(peers.entries())
        .filter(([socketId, peerData]) => peerData.stream !== null)
        .map(([socketId, peerData]) => {
          console.log('Rendering peer with stream:', socketId, peerData);
          return (
            <VideoPlayer
              key={socketId}
              stream={peerData.stream}
              userName={peerData.userName}
            />
          );
        })}
    </div>
  );
};

export default VideoGrid;