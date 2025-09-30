import SimplePeer from 'simple-peer';

class WebRTCService {
  constructor() {
    this.peers = new Map();
    this.localStream = null;
    this.screenStream = null;
    this.socket = null;
  }

  setSocket(socket) {
    this.socket = socket;
  }

  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      // Mobile-optimized constraints
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      const enhancedConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: isMobile ? {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 },
          facingMode: 'user'
        } : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };

      console.log('Requesting media with constraints:', enhancedConstraints);
      this.localStream = await navigator.mediaDevices.getUserMedia(enhancedConstraints);
      console.log('Local stream obtained:', this.localStream.getTracks().map(t => `${t.kind}: ${t.label}`));
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async getDisplayMedia() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true
      });

      // Handle screen share stop
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      return this.screenStream;
    } catch (error) {
      console.error('Error accessing screen share:', error);
      throw error;
    }
  }

  createPeer(socketId, initiator, stream) {
    console.log('Creating peer for:', socketId, 'Initiator:', initiator, 'Stream tracks:', stream?.getTracks().map(t => t.kind));

    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers: [
          // Google STUN servers
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // Free TURN servers - multiple providers for reliability
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          // Backup TURN server
          {
            urls: 'turn:numb.viagenie.ca',
            username: 'webrtc@live.com',
            credential: 'muazkh'
          }
        ],
        // Important for mobile devices and connection stability
        sdpSemantics: 'unified-plan',
        // Enable all candidates (host, srflx, relay)
        iceTransportPolicy: 'all',
        // Bundle policy for better performance
        bundlePolicy: 'max-bundle',
        // RTC configuration
        rtcpMuxPolicy: 'require',
        // ICE candidate pool size - helps with connection establishment
        iceCandidatePoolSize: 10
      },
      // Offer options for better mobile support
      offerOptions: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      }
    });

    peer.on('signal', (signal) => {
      console.log('Signal generated:', signal.type, 'for peer:', socketId);
      if (signal.type === 'offer') {
        this.socket.emit('offer', { to: socketId, offer: signal, type: 'video' });
      } else if (signal.type === 'answer') {
        this.socket.emit('answer', { to: socketId, answer: signal });
      } else {
        // ICE candidates
        this.socket.emit('ice-candidate', { to: socketId, candidate: signal });
      }
    });

    peer.on('connect', () => {
      console.log('Peer connected successfully:', socketId);
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received remote stream from peer:', socketId, 'with tracks:', remoteStream.getTracks().map(t => t.kind));
    });

    peer.on('error', (err) => {
      console.error('❌ Peer error for', socketId, ':', err);
      console.error('Error details:', err.message, err.code);
      // Don't immediately destroy on error - let ICE retry
    });

    peer.on('close', () => {
      console.log('⚠️ Peer connection closed:', socketId);
      console.trace('Close event stack trace');
      this.peers.delete(socketId);
    });

    // Monitor ICE connection state for debugging
    if (peer._pc) {
      const pc = peer._pc;
      const remoteStream = new MediaStream();
      let streamEmitted = false;

      pc.oniceconnectionstatechange = () => {
        console.log(`[${socketId}] ICE connection state:`, pc.iceConnectionState);

        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          console.log(`[${socketId}] ✅ ICE CONNECTION ESTABLISHED`);
        }

        if (pc.iceConnectionState === 'failed') {
          console.log(`[${socketId}] ❌ ICE connection FAILED`);
        }

        if (pc.iceConnectionState === 'disconnected') {
          console.log(`[${socketId}] ⚠️ ICE connection DISCONNECTED`);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`[${socketId}] Connection state:`, pc.connectionState);
      };

      // Log ALL ICE candidates with details
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const c = event.candidate;
          console.log(`[${socketId}] ICE candidate:`, {
            type: c.type,
            protocol: c.protocol,
            address: c.address || c.ip,
            port: c.port
          });
        } else {
          console.log(`[${socketId}] ICE gathering completed`);
        }
      };

      // Monitor signaling state
      pc.onsignalingstatechange = () => {
        console.log(`[${socketId}] Signaling state:`, pc.signalingState);
      };

      // CRITICAL FIX: Hook into ontrack to manually emit stream
      // Save SimplePeer's original ontrack handler
      const originalOnTrack = pc.ontrack;

      pc.ontrack = (event) => {
        console.log(`[${socketId}] Track received:`, event.track.kind, 'streams:', event.streams.length);

        // Call SimplePeer's original handler first
        if (originalOnTrack) {
          originalOnTrack.call(pc, event);
        }

        // Add track to our custom stream
        const track = event.track;
        if (!remoteStream.getTracks().find(t => t.id === track.id)) {
          remoteStream.addTrack(track);
          console.log(`[${socketId}] Added ${track.kind} track. Total tracks:`, remoteStream.getTracks().length);
        }

        // Emit stream event after collecting tracks (with delay to get both audio and video)
        if (!streamEmitted && remoteStream.getTracks().length > 0) {
          streamEmitted = true;
          setTimeout(() => {
            console.log(`[${socketId}] Manually emitting stream with ${remoteStream.getTracks().length} tracks`);
            peer.emit('stream', remoteStream);
          }, 200); // Small delay to collect all tracks
        }
      };
    }

    this.peers.set(socketId, peer);
    return peer;
  }

  addPeer(socketId, signal, stream) {
    const peer = this.createPeer(socketId, false, stream);
    peer.signal(signal);
    return peer;
  }

  removePeer(socketId) {
    const peer = this.peers.get(socketId);
    if (peer) {
      peer.destroy();
      this.peers.delete(socketId);
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  cleanup() {
    this.peers.forEach(peer => peer.destroy());
    this.peers.clear();
    this.stopLocalStream();
    this.stopScreenShare();
  }
}

export default new WebRTCService();