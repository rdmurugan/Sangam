import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import webrtcService from '../services/webrtc';
import VideoGrid from './VideoGrid';
import Controls from './Controls';
import Chat from './Chat';
import Participants from './Participants';
import WaitingRoom from './WaitingRoom';
import RecordingIndicator from './RecordingIndicator';

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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  const socketRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    initializeRoom();

    return () => {
      cleanup();
    };
  }, []);

  const initializeRoom = async () => {
    try {
      // Get user media
      const stream = await webrtcService.getUserMedia();
      setLocalStream(stream);

      // Connect to socket
      const socket = socketService.connect();
      socketRef.current = socket;
      webrtcService.setSocket(socket);

      // Join room
      socket.emit('join-room', { roomId, userName, isHost });

      // Setup socket listeners
      setupSocketListeners(socket, stream);
    } catch (error) {
      console.error('Error initializing room:', error);
      alert('Failed to access camera/microphone');
    }
  };

  const setupSocketListeners = (socket, stream) => {
    socket.on('waiting-room', () => {
      setIsInWaitingRoom(true);
    });

    socket.on('admitted-to-room', () => {
      setIsInWaitingRoom(false);
      socket.emit('join-room', { roomId, userName, isHost });
    });

    socket.on('room-participants', (currentParticipants) => {
      setParticipants(prev => [...prev, ...currentParticipants]);

      // Create peer connections for existing participants
      currentParticipants.forEach(participant => {
        const peer = webrtcService.createPeer(participant.socketId, true, stream);

        peer.on('stream', (remoteStream) => {
          setPeers(prev => new Map(prev).set(participant.socketId, {
            peer,
            stream: remoteStream,
            userName: participant.userName
          }));
        });
      });
    });

    socket.on('user-joined', (participant) => {
      console.log('User joined:', participant);
      setParticipants(prev => [...prev, participant]);
    });

    socket.on('offer', ({ from, offer }) => {
      console.log('Received offer from:', from);
      const peer = webrtcService.addPeer(from, offer, stream);

      peer.on('stream', (remoteStream) => {
        console.log('Received remote stream from:', from);
        setPeers(prev => new Map(prev).set(from, {
          peer,
          stream: remoteStream,
          userName: 'Participant'
        }));
      });
    });

    socket.on('answer', ({ from, answer }) => {
      console.log('Received answer from:', from);
      setPeers(prev => {
        const peerData = prev.get(from);
        if (peerData) {
          peerData.peer.signal(answer);
        } else {
          console.error('No peer found for answer from:', from);
        }
        return prev;
      });
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      console.log('Received ICE candidate from:', from);
      setPeers(prev => {
        const peerData = prev.get(from);
        if (peerData) {
          peerData.peer.signal(candidate);
        } else {
          console.error('No peer found for ICE candidate from:', from);
        }
        return prev;
      });
    });

    socket.on('user-left', ({ socketId }) => {
      webrtcService.removePeer(socketId);
      setPeers(prev => {
        const newPeers = new Map(prev);
        newPeers.delete(socketId);
        return newPeers;
      });
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

      <Controls
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onScreenShare={handleScreenShare}
        onLeave={leaveRoom}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        isScreenSharing={isScreenSharing}
        isHost={isHost}
      />
    </div>
  );
};

export default Room;