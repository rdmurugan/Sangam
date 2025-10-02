import React, { useRef, useEffect, useState } from 'react';
import { ReactionOverlay } from './Reactions';

const VideoPlayer = ({ stream, muted = false, userName, isLocal = false, reactions = [], isActiveSpeaker = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    console.log(`[VideoPlayer ${userName}] Attaching stream:`, stream.id);
    console.log(`[VideoPlayer ${userName}] Tracks:`, stream.getTracks().map(t => ({
      kind: t.kind,
      enabled: t.enabled,
      muted: t.muted,
      readyState: t.readyState
    })));

    // Check if tracks have actual data
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      console.log(`[VideoPlayer ${userName}] Video track settings:`, videoTrack.getSettings());
      console.log(`[VideoPlayer ${userName}] Video track constraints:`, videoTrack.getConstraints());
    }

    // Direct assignment - let browser handle it
    video.srcObject = stream;

    // Monitor video element state
    const checkVideo = setInterval(() => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        console.log(`✅ [VideoPlayer ${userName}] Video is rendering! ${video.videoWidth}x${video.videoHeight}`);
        clearInterval(checkVideo);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkVideo);
      if (video.videoWidth === 0) {
        console.error(`❌ [VideoPlayer ${userName}] Video NOT rendering after 5s. readyState: ${video.readyState}, paused: ${video.paused}, muted: ${video.muted}`);
      }
    }, 5000);

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
    <div className={`video-container ${isActiveSpeaker ? 'active-speaker' : ''}`} onClick={handleClick} style={{ cursor: 'pointer', position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`video-player ${isLocal ? 'local-video' : ''}`}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          minWidth: '320px',
          minHeight: '220px',
          backgroundColor: '#000'
        }}
      />
      <div className="video-label">{userName}</div>
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

const VideoGrid = ({ localStream, peers, localUserName, isFloating = false, reactions = new Map(), localSocketId, activeSpeaker }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gridRef = useRef(null);

  console.log('VideoGrid rendering - peers count:', peers.size);
  console.log('VideoGrid peers:', Array.from(peers.entries()).map(([id, data]) => ({
    id,
    userName: data.userName,
    hasStream: !!data.stream,
    streamId: data.stream?.id,
    trackCount: data.stream?.getTracks().length
  })));

  const handleMouseDown = (e) => {
    if (!isFloating) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isFloating) return;

    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const gridStyle = isFloating ? {
    position: 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    width: '320px',
    maxHeight: '400px',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: '12px',
    padding: '10px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    cursor: isDragging ? 'grabbing' : 'grab',
    overflow: 'auto'
  } : {};

  return (
    <div
      ref={gridRef}
      className={`video-grid ${isFloating ? 'video-grid-floating' : ''}`}
      style={gridStyle}
      onMouseDown={handleMouseDown}
    >
      {localStream && (
        <VideoPlayer
          stream={localStream}
          muted={true}
          userName={localUserName + ' (You)'}
          isLocal={true}
          reactions={reactions.get(localSocketId) || []}
          isActiveSpeaker={activeSpeaker === localSocketId}
        />
      )}
      {Array.from(peers.entries())
        .filter(([socketId, peerData]) => {
          if (!peerData.stream) {
            console.log(`Filtering out peer ${socketId} - no stream yet`);
            return false;
          }
          return true;
        })
        .map(([socketId, peerData]) => {
          console.log('Rendering peer video:', socketId, 'stream:', peerData.stream.id, 'tracks:', peerData.stream.getTracks().length);
          return (
            <VideoPlayer
              key={socketId}
              stream={peerData.stream}
              userName={peerData.userName}
              muted={false}
              reactions={reactions.get(socketId) || []}
              isActiveSpeaker={activeSpeaker === socketId}
            />
          );
        })}
    </div>
  );
};

export default VideoGrid;
