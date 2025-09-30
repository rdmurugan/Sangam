import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import webrtcService from '../services/webrtc';
import VideoGrid from './VideoGrid';
import Controls from './Controls';
import Chat from './Chat';
import Participants from './Participants';
import WaitingRoom from './WaitingRoom';
import WaitingRoomPanel from './WaitingRoomPanel';
import RecordingIndicator from './RecordingIndicator';
import ConnectionIndicator from './ConnectionIndicator';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [userName] = useState(sessionStorage.getItem('userName') || 'Guest');
  const [isHost] = useState(sessionStorage.getItem('isHost') === 'true');
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('connecting');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const socketRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    initializeRoom();

    return () => {
      cleanup();
    };
  }, []);

  const initializeRoom = async () => {
    try {
      // Get user media
      console.log('Requesting camera/microphone access...');
      const stream = await webrtcService.getUserMedia();
      console.log('Camera/microphone access granted');
      setLocalStream(stream);

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

    socket.on('room-participants', (currentParticipants) => {
      console.log('Received room-participants:', currentParticipants);

      // Prevent duplicates - only add participants not already in state
      setParticipants(prev => {
        const existingIds = new Set(prev.map(p => p.socketId));
        const newParticipants = currentParticipants.filter(p => !existingIds.has(p.socketId));
        return [...prev, ...newParticipants];
      });

      // Create peer connections for existing participants
      currentParticipants.forEach(participant => {
        // Skip if peer already exists
        if (peersRef.current.has(participant.socketId)) {
          console.log('Peer already exists for:', participant.socketId);
          return;
        }

        console.log('Creating peer for existing participant:', participant.socketId);
        const peer = webrtcService.createPeer(participant.socketId, true, stream);

        // Add peer to ref immediately so it can receive answer/ice-candidates
        peersRef.current.set(participant.socketId, { peer, stream: null, userName: participant.userName });

        peer.on('stream', (remoteStream) => {
          console.log('Received stream from existing participant:', participant.socketId);
          const peerData = { peer, stream: remoteStream, userName: participant.userName };
          peersRef.current.set(participant.socketId, peerData);
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

    socket.on('offer', ({ from, offer }) => {
      console.log('Received offer from:', from);

      // Skip if peer already exists
      if (peersRef.current.has(from)) {
        console.log('Peer already exists for offer from:', from);
        return;
      }

      const peer = webrtcService.addPeer(from, offer, stream);

      // Get userName from participants list
      const participant = participants.find(p => p.socketId === from);
      const userName = participant ? participant.userName : 'Participant';

      // Add peer to ref immediately so it can receive ice-candidates
      peersRef.current.set(from, { peer, stream: null, userName });

      peer.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', from);
        const peerData = { peer, stream: remoteStream, userName };
        peersRef.current.set(from, peerData);
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
      console.log('Received answer from:', from);
      const peerData = peersRef.current.get(from);
      if (peerData && !peerData.peer.destroyed) {
        try {
          peerData.peer.signal(answer);
        } catch (error) {
          console.error('Error signaling answer to peer:', from, error);
          // Clean up broken peer
          webrtcService.removePeer(from);
          peersRef.current.delete(from);
          setPeers(new Map(peersRef.current));
        }
      } else {
        console.error('No peer found for answer from:', from, 'or peer is destroyed');
      }
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      console.log('Received ICE candidate from:', from);
      const peerData = peersRef.current.get(from);
      if (peerData && !peerData.peer.destroyed) {
        try {
          peerData.peer.signal(candidate);
        } catch (error) {
          console.error('Error signaling ICE candidate to peer:', from, error);
          // Don't clean up on ICE candidate errors - they can be non-fatal
        }
      } else {
        console.error('No peer found for ICE candidate from:', from, 'or peer is destroyed');
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
  };

  const handleToggleAudio = (enabled) => {
    webrtcService.toggleAudio(enabled);
    socketRef.current.emit('toggle-audio', { roomId, enabled });
  };

  const handleToggleVideo = (enabled) => {
    webrtcService.toggleVideo(enabled);
    socketRef.current.emit('toggle-video', { roomId, enabled });
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      webrtcService.stopScreenShare();
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      socketRef.current.emit('stop-screen-share', { roomId });
    } else {
      try {
        const screenStream = await webrtcService.getDisplayMedia();
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        socketRef.current.emit('start-screen-share', { roomId });

        // Create new peer connections with screen stream
        peers.forEach((peerData, socketId) => {
          const peer = webrtcService.createPeer(socketId, true, screenStream);

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
    cleanup();
    navigate('/');
  };

  const cleanup = () => {
    webrtcService.cleanup();
    socketService.disconnect();
  };

  if (isInWaitingRoom) {
    return <WaitingRoom />;
  }

  return (
    <div className="room-container">
      {isRecording && <RecordingIndicator />}
      <ConnectionIndicator quality={isReconnecting ? 'connecting' : connectionQuality} />

      <div className="main-content">
        <VideoGrid
          localStream={localStream}
          peers={peers}
          localUserName={userName}
        />
      </div>

      {showChat && (
        <Chat
          socket={socketRef.current}
          roomId={roomId}
          userName={userName}
        />
      )}

      {showParticipants && (
        <Participants
          participants={participants}
          isHost={isHost}
          onRemoveParticipant={handleRemoveParticipant}
          localSocketId={socketRef.current?.id}
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
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        onToggleWaitingRoom={() => setShowWaitingRoom(!showWaitingRoom)}
        isScreenSharing={isScreenSharing}
        isHost={isHost}
        waitingCount={waitingUsers.length}
      />
    </div>
  );
};

export default Room;