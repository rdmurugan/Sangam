import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ stream, muted = false, userName, isLocal = false }) => {
  const videoRef = useRef();

  useEffect(() => {
    let metadataLoaded = false;
    let fallbackTimeout = null;

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

      // Wait for loadedmetadata event to ensure video dimensions are available
      const handleLoadedMetadata = () => {
        metadataLoaded = true;
        console.log(`[VideoPlayer ${userName}] ✅ Metadata loaded - dimensions:`, {
          videoWidth: videoRef.current.videoWidth,
          videoHeight: videoRef.current.videoHeight,
          readyState: videoRef.current.readyState
        });

        // Try to play once metadata is loaded
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`✅ [VideoPlayer ${userName}] Video playing successfully (after metadata)`);
              console.log(`[VideoPlayer ${userName}] After play - dimensions:`, {
                videoWidth: videoRef.current.videoWidth,
                videoHeight: videoRef.current.videoHeight
              });
            })
            .catch(error => {
              console.error(`❌ [VideoPlayer ${userName}] Error playing video (after metadata):`, error.name, error.message);
            });
        }
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      // Also try canplay event as backup
      const handleCanPlay = () => {
        if (!metadataLoaded) {
          console.log(`[VideoPlayer ${userName}] ✅ canplay event fired`);
          metadataLoaded = true;

          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`✅ [VideoPlayer ${userName}] Video playing successfully (canplay)`);
              })
              .catch(error => {
                console.error(`❌ [VideoPlayer ${userName}] Error playing video (canplay):`, error.name, error.message);
              });
          }
        }
      };
      videoRef.current.addEventListener('canplay', handleCanPlay);

      // Log video element properties immediately
      console.log(`[VideoPlayer ${userName}] Video element (before metadata):`, {
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        readyState: videoRef.current.readyState,
        paused: videoRef.current.paused,
        muted: videoRef.current.muted,
        autoplay: videoRef.current.autoplay
      });

      // IMMEDIATE PLAY ATTEMPT - try right away
      console.log(`[VideoPlayer ${userName}] Attempting immediate play...`);
      const immediatePlayPromise = videoRef.current.play();
      if (immediatePlayPromise !== undefined) {
        immediatePlayPromise
          .then(() => {
            console.log(`✅ [VideoPlayer ${userName}] IMMEDIATE play successful!`);
            metadataLoaded = true; // Prevent other attempts
          })
          .catch(error => {
            console.log(`[VideoPlayer ${userName}] Immediate play failed (expected):`, error.name);
          });
      }

      // FALLBACK: Also try to play after delay in case metadata event doesn't fire
      // This can happen with remote MediaStreams
      fallbackTimeout = setTimeout(() => {
        if (!metadataLoaded && videoRef.current) {
          console.log(`[VideoPlayer ${userName}] ⚠️ Metadata event didn't fire, trying to play anyway...`);
          console.log(`[VideoPlayer ${userName}] Current state:`, {
            srcObject: !!videoRef.current.srcObject,
            readyState: videoRef.current.readyState,
            paused: videoRef.current.paused,
            muted: videoRef.current.muted,
            networkState: videoRef.current.networkState
          });

          const playPromise = videoRef.current.play();
          console.log(`[VideoPlayer ${userName}] play() returned:`, playPromise);

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`✅ [VideoPlayer ${userName}] Video playing successfully (fallback)`);
                console.log(`[VideoPlayer ${userName}] Dimensions:`, {
                  videoWidth: videoRef.current.videoWidth,
                  videoHeight: videoRef.current.videoHeight,
                  readyState: videoRef.current.readyState,
                  paused: videoRef.current.paused
                });
              })
              .catch(error => {
                console.error(`❌ [VideoPlayer ${userName}] Error playing video (fallback):`, error);
                console.error(`[VideoPlayer ${userName}] Error name:`, error.name);
                console.error(`[VideoPlayer ${userName}] Error message:`, error.message);
              });
          } else {
            console.warn(`[VideoPlayer ${userName}] play() returned undefined!`);
          }
        }
      }, 500); // Wait 500ms for metadata event
    }

    // Cleanup on unmount
    return () => {
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
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
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          minWidth: '320px',
          minHeight: '220px'
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