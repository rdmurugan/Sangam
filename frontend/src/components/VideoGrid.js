import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ stream, muted = false, userName, isLocal = false }) => {
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
    <div className="video-container" onClick={handleClick} style={{ cursor: 'pointer', position: 'relative' }}>
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
      {!isLocal && stream && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#0f0',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          {stream.getTracks().length} tracks
        </div>
      )}
    </div>
  );
};

const VideoGrid = ({ localStream, peers, localUserName }) => {
  console.log('VideoGrid rendering - peers count:', peers.size);
  console.log('VideoGrid peers:', Array.from(peers.entries()).map(([id, data]) => ({
    id,
    userName: data.userName,
    hasStream: !!data.stream,
    streamId: data.stream?.id,
    trackCount: data.stream?.getTracks().length
  })));

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
              muted={true}
            />
          );
        })}
    </div>
  );
};

export default VideoGrid;
