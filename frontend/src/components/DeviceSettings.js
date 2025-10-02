import React, { useState, useEffect } from 'react';

const DeviceSettings = ({ onClose, onDeviceChange, currentStream }) => {
  const [devices, setDevices] = useState({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: []
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: '',
    videoInput: '',
    audioOutput: ''
  });

  useEffect(() => {
    enumerateDevices();
    getCurrentDevices();
  }, []);

  const enumerateDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = deviceList.filter(device => device.kind === 'audioinput');
      const videoInputs = deviceList.filter(device => device.kind === 'videoinput');
      const audioOutputs = deviceList.filter(device => device.kind === 'audiooutput');

      setDevices({
        audioInputs,
        videoInputs,
        audioOutputs
      });
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  const getCurrentDevices = () => {
    if (currentStream) {
      const audioTrack = currentStream.getAudioTracks()[0];
      const videoTrack = currentStream.getVideoTracks()[0];

      if (audioTrack) {
        const settings = audioTrack.getSettings();
        setSelectedDevices(prev => ({ ...prev, audioInput: settings.deviceId || '' }));
      }

      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setSelectedDevices(prev => ({ ...prev, videoInput: settings.deviceId || '' }));
      }
    }
  };

  const handleDeviceChange = async (deviceType, deviceId) => {
    setSelectedDevices(prev => ({ ...prev, [deviceType]: deviceId }));

    // Notify parent component to switch device
    if (onDeviceChange) {
      onDeviceChange(deviceType, deviceId);
    }
  };

  return (
    <div className="device-settings-overlay" onClick={onClose}>
      <div className="device-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="device-settings-header">
          <h2>Device Settings</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="device-settings-content">
          {/* Microphone Selection */}
          <div className="device-group">
            <label className="device-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              Microphone
            </label>
            <select
              value={selectedDevices.audioInput}
              onChange={(e) => handleDeviceChange('audioInput', e.target.value)}
              className="device-select"
            >
              {devices.audioInputs.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Selection */}
          <div className="device-group">
            <label className="device-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              Camera
            </label>
            <select
              value={selectedDevices.videoInput}
              onChange={(e) => handleDeviceChange('videoInput', e.target.value)}
              className="device-select"
            >
              {devices.videoInputs.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Speaker Selection */}
          <div className="device-group">
            <label className="device-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              Speaker
            </label>
            <select
              value={selectedDevices.audioOutput}
              onChange={(e) => handleDeviceChange('audioOutput', e.target.value)}
              className="device-select"
            >
              {devices.audioOutputs.length > 0 ? (
                devices.audioOutputs.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.substring(0, 5)}`}
                  </option>
                ))
              ) : (
                <option value="">Default Speaker</option>
              )}
            </select>
          </div>
        </div>

        <div className="device-settings-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettings;
