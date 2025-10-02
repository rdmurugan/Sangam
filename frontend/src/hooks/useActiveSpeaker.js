import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect the active speaker based on audio levels
 * @param {Map} peers - Map of peer connections with streams
 * @param {MediaStream} localStream - Local user's media stream
 * @param {string} localSocketId - Local user's socket ID
 * @returns {string|null} - Socket ID of the active speaker
 */
const useActiveSpeaker = (peers, localStream, localSocketId) => {
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const audioContextRef = useRef(null);
  const analyzersRef = useRef(new Map());
  const volumeCheckIntervalRef = useRef(null);

  useEffect(() => {
    // Initialize Web Audio API
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const analyzers = new Map();

    // Create analyzer for local stream
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack && audioTrack.enabled) {
        try {
          const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
          const analyzer = audioContext.createAnalyser();
          analyzer.fftSize = 512;
          analyzer.smoothingTimeConstant = 0.8;
          source.connect(analyzer);

          analyzers.set(localSocketId, {
            analyzer,
            dataArray: new Uint8Array(analyzer.frequencyBinCount)
          });
        } catch (error) {
          console.warn('Error creating analyzer for local stream:', error);
        }
      }
    }

    // Create analyzers for peer streams
    peers.forEach((peerData, socketId) => {
      if (peerData.stream) {
        const audioTrack = peerData.stream.getAudioTracks()[0];
        if (audioTrack && audioTrack.enabled) {
          try {
            const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 512;
            analyzer.smoothingTimeConstant = 0.8;
            source.connect(analyzer);

            analyzers.set(socketId, {
              analyzer,
              dataArray: new Uint8Array(analyzer.frequencyBinCount)
            });
          } catch (error) {
            console.warn(`Error creating analyzer for peer ${socketId}:`, error);
          }
        }
      }
    });

    analyzersRef.current = analyzers;

    // Check volume levels periodically
    const checkVolumes = () => {
      let maxVolume = 0;
      let loudestSpeaker = null;
      const threshold = 30; // Minimum volume threshold to be considered speaking

      analyzersRef.current.forEach(({ analyzer, dataArray }, socketId) => {
        analyzer.getByteFrequencyData(dataArray);

        // Calculate average volume
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;

        // Track the loudest speaker
        if (average > threshold && average > maxVolume) {
          maxVolume = average;
          loudestSpeaker = socketId;
        }
      });

      // Only update if there's a change and speaker is above threshold
      if (loudestSpeaker !== activeSpeaker) {
        setActiveSpeaker(loudestSpeaker);
      }
    };

    // Check volumes every 200ms
    volumeCheckIntervalRef.current = setInterval(checkVolumes, 200);

    return () => {
      // Cleanup
      if (volumeCheckIntervalRef.current) {
        clearInterval(volumeCheckIntervalRef.current);
      }

      // Disconnect analyzers
      analyzersRef.current.forEach(({ analyzer }) => {
        try {
          analyzer.disconnect();
        } catch (error) {
          // Ignore errors during cleanup
        }
      });
      analyzersRef.current.clear();
    };
  }, [peers, localStream, localSocketId, activeSpeaker]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return activeSpeaker;
};

export default useActiveSpeaker;
