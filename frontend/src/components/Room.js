import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import webrtcService from '../services/webrtc';
import useActiveSpeaker from '../hooks/useActiveSpeaker';
import VideoGrid from './VideoGrid';
import GalleryView from './GalleryView';
import Controls from './Controls';
import Sidebar from './Sidebar';
import WaitingRoom from './WaitingRoom';
import WaitingRoomPanel from './WaitingRoomPanel';
import RecordingIndicator from './RecordingIndicator';
import ConnectionIndicator from './ConnectionIndicator';
import MeetingInfo from './MeetingInfo';
import JoinPrompt from './JoinPrompt';
import DeviceSettings from './DeviceSettings';
import ScreenShareView from './ScreenShareView';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [userName, setUserName] = useState(sessionStorage.getItem('userName') || '');
  const [isHost] = useState(sessionStorage.getItem('isHost') === 'true');
  const [showJoinPrompt, setShowJoinPrompt] = useState(!sessionStorage.getItem('userName'));
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [roomName, setRoomName] = useState('Sangam Meeting');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  const [remoteScreenShare, setRemoteScreenShare] = useState(null); // {socketId, userName, stream}
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('connecting');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reactions, setReactions] = useState(new Map()); // Map of socketId -> array of reactions
  const [viewMode, setViewMode] = useState('speaker'); // 'speaker' or 'gallery'
  const socketRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Active speaker detection
  const activeSpeaker = useActiveSpeaker(peers, localStream, socketRef.current?.id);

  useEffect(() => {
    // Only initialize room if userName is set
    if (userName) {
      initializeRoom();
    }

    // Handle browser back/forward button and page close
    const handleBeforeUnload = (e) => {
      cleanup();
      // Cancel the event to prevent immediate unload
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
    };

    const handlePopState = () => {
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      cleanup();
    };
  }, [userName]);

  const initializeRoom = async () => {
    try {
      // Get user media
      console.log('Requesting camera/microphone access...');
      const stream = await webrtcService.getUserMedia();
      console.log('Camera/microphone access granted');
      setLocalStream(stream);

      // Prefetch ICE servers (TURN credentials) to avoid race condition
      console.log('Prefetching ICE servers...');
      await webrtcService.getIceServers();
      console.log('ICE servers cached');

      // Connect to socket
      console.log('Connecting to server...');
      const socket = socketService.connect();
      socketRef.current = socket;
      webrtcService.setSocket(socket);

      // Setup socket listeners BEFORE joining room
      setupSocketListeners(socket, stream);

      // Join room
      console.log('Joining room:', roomId);
      socket.emit('join-room', { roomId, userName, isHost });
    } catch (error) {
      console.error('Error initializing room:', error);

      // Better error message
      let errorMessage = 'Failed to access camera/microphone.\n\n';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Camera/microphone access was denied.\n\n';
        errorMessage += 'To fix this:\n';
        errorMessage += '1. Look for a camera icon with an "X" in your address bar\n';
        errorMessage += '2. Click it and select "Allow"\n';
        errorMessage += '3. Refresh this page\n\n';
        errorMessage += 'Or go to your browser Settings > Privacy > Camera/Microphone and allow access for this site.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera or microphone found on your device.';
      } else {
        errorMessage += 'Error: ' + error.message;
      }

      alert(errorMessage);
      navigate('/');
    }
  };

  const setupSocketListeners = (socket, stream) => {
    // Connection monitoring
    socket.on('connect', () => {
      console.log('Socket connected');
      setConnectionQuality('excellent');

      // If this is a reconnection (not initial connect), recreate peer connections
      if (reconnectAttempts.current > 0) {
        console.log('Reconnected - recreating peer connections');
        recreatePeerConnections();
      }

      setIsReconnecting(false);
      reconnectAttempts.current = 0;
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionQuality('poor');

      if (reason === 'io server disconnect') {
        // Server disconnected the client, don't reconnect
        console.log('Server disconnected client');
      } else {
        // Client disconnected, attempt to reconnect
        attemptReconnection();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionQuality('poor');
      attemptReconnection();
    });

    socket.on('waiting-room', () => {
      setIsInWaitingRoom(true);
    });

    socket.on('admitted-to-room', () => {
      console.log('Admitted to room - now joining');
      setIsInWaitingRoom(false);
      // Don't emit join-room again - backend handles joining directly
    });

    // Get room info including name
    socket.on('room-info', (roomInfo) => {
      console.log('Received room-info:', roomInfo);
      if (roomInfo.name) {
        setRoomName(roomInfo.name);
      }
    });

    socket.on('room-participants', (currentParticipants) => {
      console.log('Received room-participants:', currentParticipants);

      // Prevent duplicates - only add participants not already in state
      setParticipants(prev => {
        const existingIds = new Set(prev.map(p => p.socketId));
        const newParticipants = currentParticipants.filter(p => !existingIds.has(p.socketId));
        return [...prev, ...newParticipants];
      });

      // Create peer connections for existing participants
      currentParticipants.forEach(async (participant) => {
        // Skip if peer already exists
        if (peersRef.current.has(participant.socketId)) {
          console.log('Peer already exists for:', participant.socketId);
          return;
        }

        console.log('Creating peer for existing participant:', participant.socketId);
        const peer = await webrtcService.createPeer(participant.socketId, true, stream);

        // Add peer to ref immediately so it can receive answer/ice-candidates
        peersRef.current.set(participant.socketId, { peer, stream: null, userName: participant.userName });

        peer.on('stream', (remoteStream) => {
          console.log('✅ Received stream from existing participant:', participant.socketId);
          console.log('Stream details:', {
            streamId: remoteStream.id,
            tracks: remoteStream.getTracks().map(t => ({kind: t.kind, enabled: t.enabled, readyState: t.readyState}))
          });
          const peerData = { peer, stream: remoteStream, userName: participant.userName };
          peersRef.current.set(participant.socketId, peerData);
          console.log('📺 Updating peers state with stream for:', participant.socketId);
          setPeers(new Map(peersRef.current));
        });

        peer.on('error', (err) => {
          console.error('Peer error for existing participant:', participant.socketId, err);
          // Clean up broken peer
          webrtcService.removePeer(participant.socketId);
          peersRef.current.delete(participant.socketId);
          setPeers(new Map(peersRef.current));
        });
      });
    });

    socket.on('user-joined', (participant) => {
      console.log('User joined:', participant);

      // Prevent duplicates
      setParticipants(prev => {
        const exists = prev.some(p => p.socketId === participant.socketId);
        if (exists) {
          console.log('Participant already exists:', participant.socketId);
          return prev;
        }
        return [...prev, participant];
      });

      // Don't create peer here - the new user will initiate the connection
      // We'll receive an 'offer' event and respond to it
      console.log('Waiting for offer from new user:', participant.socketId);
    });

    socket.on('offer', async ({ from, offer }) => {
      console.log('📥 Received OFFER from:', from);

      // Skip if peer already exists
      if (peersRef.current.has(from)) {
        console.log('⚠️ Peer already exists for offer from:', from);
        return;
      }

      console.log('🆕 Creating new peer for offer from:', from);
      const peer = await webrtcService.addPeer(from, offer, stream);

      // Get userName from participants list
      const participant = participants.find(p => p.socketId === from);
      const userName = participant ? participant.userName : 'Participant';

      // Add peer to ref immediately so it can receive ice-candidates
      peersRef.current.set(from, { peer, stream: null, userName });

      peer.on('stream', (remoteStream) => {
        console.log('✅ Received remote stream from:', from);
        console.log('Stream details:', {
          streamId: remoteStream.id,
          tracks: remoteStream.getTracks().map(t => ({kind: t.kind, enabled: t.enabled, readyState: t.readyState}))
        });
        const peerData = { peer, stream: remoteStream, userName };
        peersRef.current.set(from, peerData);
        console.log('📺 Updating peers state with stream for:', from);
        console.log('Current peers map size:', peersRef.current.size);
        setPeers(new Map(peersRef.current));
      });

      peer.on('error', (err) => {
        console.error('Peer error for new user:', from, err);
        // Clean up broken peer
        webrtcService.removePeer(from);
        peersRef.current.delete(from);
        setPeers(new Map(peersRef.current));
      });
    });

    socket.on('answer', ({ from, answer }) => {
      console.log('📥 Received ANSWER from:', from);
      const peerData = peersRef.current.get(from);
      if (peerData && !peerData.peer.destroyed) {
        try {
          console.log('📤 Signaling answer to peer:', from);
          peerData.peer.signal(answer);
          console.log('✅ Answer signaled successfully to:', from);
        } catch (error) {
          console.error('❌ Error signaling answer to peer:', from, error);
          // Clean up broken peer
          webrtcService.removePeer(from);
          peersRef.current.delete(from);
          setPeers(new Map(peersRef.current));
        }
      } else {
        console.error('❌ No peer found for answer from:', from, 'or peer is destroyed');
      }
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      console.log('📥 Received ICE candidate from:', from, 'Type:', candidate?.candidate?.type || candidate?.type);
      const peerData = peersRef.current.get(from);
      if (peerData && !peerData.peer.destroyed) {
        try {
          console.log('📤 Signaling ICE candidate to peer:', from);
          peerData.peer.signal(candidate);
          console.log('✅ ICE candidate signaled successfully to:', from);
        } catch (error) {
          console.error('❌ Error signaling ICE candidate to peer:', from, error);
          // Don't clean up on ICE candidate errors - they can be non-fatal
        }
      } else {
        console.error('❌ No peer found for ICE candidate from:', from, 'or peer is destroyed');
        console.log('Current peers:', Array.from(peersRef.current.keys()));
      }
    });

    socket.on('user-left', ({ socketId }) => {
      webrtcService.removePeer(socketId);
      peersRef.current.delete(socketId);
      setPeers(new Map(peersRef.current));
      setParticipants(prev => prev.filter(p => p.socketId !== socketId));
    });

    socket.on('user-audio-toggled', ({ socketId, enabled }) => {
      setParticipants(prev => prev.map(p =>
        p.socketId === socketId ? { ...p, audioEnabled: enabled } : p
      ));
    });

    socket.on('user-video-toggled', ({ socketId, enabled }) => {
      setParticipants(prev => prev.map(p =>
        p.socketId === socketId ? { ...p, videoEnabled: enabled } : p
      ));
    });

    socket.on('user-screen-sharing', ({ socketId, isSharing }) => {
      setParticipants(prev => prev.map(p =>
        p.socketId === socketId ? { ...p, isScreenSharing: isSharing } : p
      ));

      // Track remote screen share
      if (isSharing) {
        const peerData = peersRef.current.get(socketId);
        if (peerData && peerData.stream) {
          setRemoteScreenShare({
            socketId,
            userName: peerData.userName,
            stream: peerData.stream
          });
        }
      } else {
        // Clear remote screen share if this peer stopped sharing
        setRemoteScreenShare(prev => {
          if (prev && prev.socketId === socketId) {
            return null;
          }
          return prev;
        });
      }
    });

    socket.on('recording-started', () => {
      setIsRecording(true);
    });

    socket.on('recording-stopped', () => {
      setIsRecording(false);
    });

    socket.on('removed-from-room', () => {
      alert('You have been removed from the meeting');
      leaveRoom();
    });

    socket.on('user-waiting', ({ socketId, userName }) => {
      console.log('User waiting:', socketId, userName);
      setWaitingUsers(prev => [...prev, { socketId, userName }]);
    });

    socket.on('user-admitted', ({ socketId }) => {
      console.log('User admitted:', socketId);
      setWaitingUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    socket.on('user-rejected', ({ socketId }) => {
      console.log('User rejected:', socketId);
      setWaitingUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    socket.on('rejected-from-room', () => {
      alert('You have been rejected from the meeting');
      navigate('/');
    });

    socket.on('meeting-ended', () => {
      alert('The host has ended the meeting for everyone');
      cleanup();
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('isHost');
      navigate('/', { replace: true });
    });

    socket.on('host-left', ({ newHostSocketId, newHostName }) => {
      if (socketRef.current?.id === newHostSocketId) {
        // This user is the new host
        alert(`The previous host has left. You are now the host of this meeting.`);
        sessionStorage.setItem('isHost', 'true');
        // Force re-render to update isHost state
        window.location.reload();
      }
    });

    socket.on('user-reacted', ({ socketId, reaction }) => {
      console.log('Received reaction from:', socketId, reaction);

      // Add reaction to the user's reaction list
      setReactions(prev => {
        const newReactions = new Map(prev);
        const userReactions = newReactions.get(socketId) || [];
        const newReaction = {
          ...reaction,
          id: Date.now() + Math.random(),
          timestamp: Date.now()
        };
        newReactions.set(socketId, [...userReactions, newReaction]);

        // Auto-remove reaction after 3 seconds
        setTimeout(() => {
          setReactions(current => {
            const updated = new Map(current);
            const reactions = updated.get(socketId) || [];
            updated.set(socketId, reactions.filter(r => r.id !== newReaction.id));
            return updated;
          });
        }, 3000);

        return newReactions;
      });
    });
  };

  const handleToggleAudio = (enabled) => {
    webrtcService.toggleAudio(enabled);
    socketRef.current.emit('toggle-audio', { roomId, enabled });
  };

  const handleToggleVideo = (enabled) => {
    webrtcService.toggleVideo(enabled);
    socketRef.current.emit('toggle-video', { roomId, enabled });
  };

  const handleReact = (reaction) => {
    console.log('Sending reaction:', reaction);

    if (!socketRef.current) {
      console.warn('Socket not connected, cannot send reaction');
      return;
    }

    const mySocketId = socketRef.current.id;
    socketRef.current.emit('send-reaction', { roomId, reaction });

    // Also show locally
    const localReaction = {
      ...reaction,
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    };

    console.log('Adding local reaction for socketId:', mySocketId, localReaction);

    setReactions(prev => {
      const newReactions = new Map(prev);
      const userReactions = newReactions.get(mySocketId) || [];
      newReactions.set(mySocketId, [...userReactions, localReaction]);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setReactions(current => {
          const updated = new Map(current);
          const reactions = updated.get(mySocketId) || [];
          updated.set(mySocketId, reactions.filter(r => r.id !== localReaction.id));
          return updated;
        });
      }, 3000);

      return newReactions;
    });
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'speaker' ? 'gallery' : 'speaker');
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      webrtcService.stopScreenShare();
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      setIsWindowMinimized(false);
      socketRef.current.emit('stop-screen-share', { roomId });
    } else {
      try {
        const screenStream = await webrtcService.getDisplayMedia();
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        setIsWindowMinimized(true); // Auto-minimize when sharing starts
        socketRef.current.emit('start-screen-share', { roomId });

        // Stop sharing when user stops from browser
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setIsWindowMinimized(false);
          screenStreamRef.current = null;
          socketRef.current.emit('stop-screen-share', { roomId });
        };

        // Create new peer connections with screen stream
        peers.forEach(async (peerData, socketId) => {
          const peer = await webrtcService.createPeer(socketId, true, screenStream);

          peer.on('stream', (remoteStream) => {
            setPeers(prev => new Map(prev).set(socketId, {
              peer,
              stream: remoteStream,
              userName: peerData.userName
            }));
          });
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };

  const handleRemoveParticipant = (socketId) => {
    socketRef.current.emit('remove-participant', { roomId, socketId });
  };

  const handleAdmitUser = (socketId) => {
    socketRef.current.emit('admit-user', { roomId, socketId });
  };

  const handleRejectUser = (socketId) => {
    socketRef.current.emit('reject-user', { roomId, socketId });
  };

  const recreatePeerConnections = async () => {
    console.log('Recreating peer connections after reconnection...');

    if (!localStream) {
      console.error('No local stream available for reconnection');
      return;
    }

    // Clean up all existing peer connections
    peersRef.current.forEach((peerData, socketId) => {
      webrtcService.removePeer(socketId);
    });
    peersRef.current.clear();
    setPeers(new Map());

    // Wait a bit for socket to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Rejoin the room
    console.log('Rejoining room after reconnection');
    socketRef.current.emit('join-room', { roomId, userName, isHost });
  };

  const attemptReconnection = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      alert('Connection lost. Please refresh the page to rejoin the meeting.');
      return;
    }

    setIsReconnecting(true);
    reconnectAttempts.current += 1;
    console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);

    setTimeout(() => {
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    }, 2000 * reconnectAttempts.current); // Exponential backoff
  };

  const leaveRoom = () => {
    if (isHost && participants.length > 0) {
      // Host has options: leave or end meeting for all
      const choice = window.confirm(
        'Do you want to:\n\n' +
        'OK - End meeting for everyone\n' +
        'Cancel - Just leave the meeting\n\n' +
        'If you just leave, another participant will become the host.'
      );

      if (choice) {
        // End meeting for everyone
        endMeetingForAll();
      } else {
        // Just leave and transfer host
        leaveMeeting();
      }
    } else {
      // Regular participant or host with no other participants
      leaveMeeting();
    }
  };

  const endMeetingForAll = () => {
    // Notify server to end meeting for all participants
    if (socketRef.current) {
      socketRef.current.emit('end-meeting', { roomId });
    }
    cleanup();
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('isHost');
    navigate('/', { replace: true });
  };

  const leaveMeeting = () => {
    cleanup();
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('isHost');
    navigate('/', { replace: true });
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up connections...');

    // Stop all local media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
    }

    // Cleanup WebRTC and socket connections
    webrtcService.cleanup();
    socketService.disconnect();

    console.log('✅ Cleanup complete');
  };

  const handleJoin = (name) => {
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('isHost', 'false');
    setUserName(name);
    setShowJoinPrompt(false);
  };

  const handleDeviceChange = async (deviceType, deviceId) => {
    try {
      if (!localStream) return;

      if (deviceType === 'audioInput') {
        // Get new audio stream with specific device
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } },
          video: false
        });

        // Replace audio track in local stream
        const oldAudioTrack = localStream.getAudioTracks()[0];
        const newAudioTrack = newStream.getAudioTracks()[0];

        if (oldAudioTrack) {
          localStream.removeTrack(oldAudioTrack);
          oldAudioTrack.stop();
        }

        localStream.addTrack(newAudioTrack);

        // Update all peer connections with new track
        peersRef.current.forEach((peerData) => {
          if (peerData.peer && !peerData.peer.destroyed) {
            peerData.peer.replaceTrack(oldAudioTrack, newAudioTrack, localStream);
          }
        });

        setLocalStream(new MediaStream(localStream.getTracks()));
      } else if (deviceType === 'videoInput') {
        // Get new video stream with specific device
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { deviceId: { exact: deviceId } }
        });

        // Replace video track in local stream
        const oldVideoTrack = localStream.getVideoTracks()[0];
        const newVideoTrack = newStream.getVideoTracks()[0];

        if (oldVideoTrack) {
          localStream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }

        localStream.addTrack(newVideoTrack);

        // Update all peer connections with new track
        peersRef.current.forEach((peerData) => {
          if (peerData.peer && !peerData.peer.destroyed) {
            peerData.peer.replaceTrack(oldVideoTrack, newVideoTrack, localStream);
          }
        });

        setLocalStream(new MediaStream(localStream.getTracks()));
      } else if (deviceType === 'audioOutput') {
        // Set audio output device (speaker)
        // This is done by setting sinkId on audio elements
        // The video elements will handle this in VideoGrid component
        console.log('Audio output device changed to:', deviceId);
      }
    } catch (error) {
      console.error('Error changing device:', error);
      alert('Failed to switch device. Please try again.');
    }
  };

  if (showJoinPrompt) {
    return <JoinPrompt roomId={roomId} onJoin={handleJoin} />;
  }

  if (isInWaitingRoom) {
    return <WaitingRoom />;
  }

  const handleToggleSidebar = (tab) => {
    if (showSidebar && sidebarTab === tab) {
      setShowSidebar(false);
    } else {
      setSidebarTab(tab);
      setShowSidebar(true);
    }
  };

  // Minimized window view when screen sharing
  if (isWindowMinimized && isScreenSharing) {
    return (
      <div className="minimized-window">
        <div className="minimized-header" onClick={() => setIsWindowMinimized(false)}>
          <div className="minimized-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
            </svg>
            <span>Sharing: {roomName}</span>
          </div>
          <button className="expand-button" title="Expand window">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
        <div className="minimized-preview">
          <VideoGrid
            localStream={localStream}
            peers={peers}
            localUserName={userName}
            isFloating={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="room-container">
      {isRecording && <RecordingIndicator />}
      <ConnectionIndicator quality={isReconnecting ? 'connecting' : connectionQuality} />

      {/* Floating screen share controls */}
      {isScreenSharing && screenStreamRef.current && !isWindowMinimized && (
        <div className="floating-share-controls">
          <button
            className="floating-control-btn stop-share-btn"
            onClick={handleScreenShare}
            title="Stop sharing"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.79 18l2 2H24v-2h-2.21zM1.11 2.98l1.55 1.56c-.41.37-.66.89-.66 1.48V16c0 1.1.9 2 2.01 2H0v2h18.13l2.71 2.71 1.41-1.41L2.52 1.57 1.11 2.98zM4 6.02h.13l4.95 4.93H4V6.02zm17.96-2L22 6v12h-1.96L4.13 2.09C4.74 2.04 5.37 2 6.01 2H20c1.1 0 2 .9 2 2z"/>
            </svg>
            <span>Stop Sharing</span>
          </button>
          <button
            className="floating-control-btn minimize-btn"
            onClick={() => setIsWindowMinimized(true)}
            title="Minimize window"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
            <span>Minimize</span>
          </button>
        </div>
      )}

      <div className="room-main-area">
        {/* View Mode Switcher */}
        {!remoteScreenShare && (
          <button
            className="view-mode-toggle"
            onClick={toggleViewMode}
            title={`Switch to ${viewMode === 'speaker' ? 'Gallery' : 'Speaker'} View`}
          >
            {viewMode === 'speaker' ? (
              // Gallery icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h4v4H4V6zm6 0h4v4h-4V6zm6 0h4v4h-4V6zM4 12h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 18h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
            ) : (
              // Speaker icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h3v-3H5v3zm11 0h3v-3h-3v3zM5 12h3V9H5v3zm6-3v3h3V9h-3zm5 0v3h3V9h-3zM11 15h3v-3h-3v3z"/>
              </svg>
            )}
          </button>
        )}

        <div className="main-content">
          {remoteScreenShare ? (
            /* Show remote participant's screen share in main view */
            <ScreenShareView
              stream={remoteScreenShare.stream}
              userName={remoteScreenShare.userName}
            />
          ) : viewMode === 'gallery' ? (
            /* Gallery view mode */
            <GalleryView
              localStream={localStream}
              peers={peers}
              localUserName={userName}
              reactions={reactions}
              localSocketId={socketRef.current?.id}
              activeSpeaker={activeSpeaker}
              itemsPerPage={9}
            />
          ) : (
            /* Speaker view mode (default) */
            <VideoGrid
              localStream={localStream}
              peers={peers}
              localUserName={userName}
              isFloating={false}
              reactions={reactions}
              localSocketId={socketRef.current?.id}
              activeSpeaker={activeSpeaker}
            />
          )}
        </div>

        {/* Floating video grid when someone else is screen sharing */}
        {remoteScreenShare && (
          <VideoGrid
            localStream={localStream}
            peers={peers}
            localUserName={userName}
            isFloating={true}
            reactions={reactions}
            localSocketId={socketRef.current?.id}
            activeSpeaker={activeSpeaker}
          />
        )}

        {showSidebar && (
          <Sidebar
            activeTab={sidebarTab}
            onClose={() => setShowSidebar(false)}
            socket={socketRef.current}
            roomId={roomId}
            userName={userName}
            participants={participants}
            isHost={isHost}
            onRemoveParticipant={handleRemoveParticipant}
            localSocketId={socketRef.current?.id}
            isCollapsed={!showSidebar}
            onToggleCollapse={() => setShowSidebar(!showSidebar)}
          />
        )}
      </div>

      {showMeetingInfo && (
        <MeetingInfo
          roomId={roomId}
          roomName={roomName}
          participantCount={participants.length + 1}
          onClose={() => setShowMeetingInfo(false)}
        />
      )}

      {showWaitingRoom && isHost && (
        <WaitingRoomPanel
          waitingUsers={waitingUsers}
          onAdmitUser={handleAdmitUser}
          onRejectUser={handleRejectUser}
        />
      )}

      <Controls
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onScreenShare={handleScreenShare}
        onLeave={leaveRoom}
        onToggleChat={() => handleToggleSidebar('chat')}
        onToggleParticipants={() => handleToggleSidebar('participants')}
        onToggleWhiteboard={() => handleToggleSidebar('whiteboard')}
        onToggleMeetingInfo={() => setShowMeetingInfo(!showMeetingInfo)}
        onToggleSettings={() => setShowDeviceSettings(!showDeviceSettings)}
        onToggleWaitingRoom={() => setShowWaitingRoom(!showWaitingRoom)}
        onReact={handleReact}
        isScreenSharing={isScreenSharing}
        isSidebarOpen={showSidebar}
        sidebarTab={sidebarTab}
        isHost={isHost}
        waitingCount={waitingUsers.length}
      />

      {showDeviceSettings && (
        <DeviceSettings
          onClose={() => setShowDeviceSettings(false)}
          onDeviceChange={handleDeviceChange}
          currentStream={localStream}
        />
      )}
    </div>
  );
};

export default Room;