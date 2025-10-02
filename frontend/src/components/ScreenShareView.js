import React, { useRef, useEffect } from 'react';

const ScreenShareView = ({ stream, userName }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    console.log(`[ScreenShareView] Attaching screen share stream from ${userName}`);
    video.srcObject = stream;

    return () => {
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream, userName]);

  return (
    <div className="screen-share-view">
      <div className="screen-share-header">
        <span>{userName} is sharing their screen</span>
      </div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="screen-share-video"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};

export default ScreenShareView;
