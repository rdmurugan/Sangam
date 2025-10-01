import React, { useRef, useEffect, useCallback } from 'react';

const VideoPlayer = ({ stream, muted = false, userName, isLocal = false }) => {
  const videoRef = useCallback((node) => {
    if (node && stream) {
      console.log(`[VideoPlayer ${userName}] Setting stream on video element via ref callback`);
      console.log(`[VideoPlayer ${userName}] Stream ID:`, stream.id);
      console.log(`[VideoPlayer ${userName}] Stream tracks:`, stream.getTracks().map(t => ({
        kind: t.kind,
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label
      })));

      node.srcObject = stream;

      // Immediately try to play
      node.play()
        .then(() => {
          console.log(`✅ [VideoPlayer ${userName}] Video playing`);
        })
        .catch((error) => {
          console.log(`[VideoPlayer ${userName}] Play error:`, error.name, error.message);
        });
    }
  }, [stream, userName]);

  return (
    <div className="video-container">
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
