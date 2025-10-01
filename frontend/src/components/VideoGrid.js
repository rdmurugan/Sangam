import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ stream, muted = false, userName, isLocal = false }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      // Validate stream has active tracks
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      console.log(`[VideoPlayer ${userName}] Stream:`, stream.id, 'Video tracks:', videoTracks.length, 'Audio tracks:', audioTracks.length);
      console.log(`[VideoPlayer ${userName}] Tracks state:`, [...videoTracks, ...audioTracks].map(t => ({
        kind: t.kind,
        id: t.id,
        enabled: t.enabled,
        readyState: t.readyState,
        muted: t.muted
      })));

      if (videoTracks.length === 0 && audioTracks.length === 0) {
        console.error('Stream has no tracks for:', userName);
        return;
      }

      // Check if tracks are active
      const hasActiveTracks = [...videoTracks, ...audioTracks].some(track => track.readyState === 'live');
      if (!hasActiveTracks) {
        console.error('Stream has no active tracks for:', userName);
        return;
      }

      console.log(`[VideoPlayer ${userName}] Setting srcObject on video element`);
      videoRef.current.srcObject = stream;

      // Log video element properties
      console.log(`[VideoPlayer ${userName}] Video element:`, {
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused
      });

      // Important for mobile: ensure video plays
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`✅ [VideoPlayer ${userName}] Video playing successfully`);
            console.log(`[VideoPlayer ${userName}] After play - dimensions:`, {
              videoWidth: videoRef.current.videoWidth,
              videoHeight: videoRef.current.videoHeight
            });
          })
          .catch(error => {
            console.error(`❌ [VideoPlayer ${userName}] Error playing video:`, error.name, error.message);
            // Try again after user interaction on mobile
            if (!muted) {
              setTimeout(() => {
                console.log(`[VideoPlayer ${userName}] Retrying play...`);
                videoRef.current?.play().catch(e => console.error('Retry failed:', e));
              }, 1000);
            }
          });
      }
    }

    // Cleanup on unmount
    return () => {
      if (videoRef.current) {
        console.log(`[VideoPlayer ${userName}] Cleaning up - removing srcObject`);
        videoRef.current.srcObject = null;
      }
    };
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
        controls={false}
        preload="auto"
        style={{ objectFit: 'cover' }}
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
            />
          );
        })}
    </div>
  );
};

export default VideoGrid;