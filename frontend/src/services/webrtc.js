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

  async getIceServers() {
    try {
      const API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/turn/credentials`);
      const data = await response.json();
      console.log('✅ Fetched TURN credentials:', data.iceServers?.length, 'servers');
      return data.iceServers;
    } catch (error) {
      console.error('❌ Failed to fetch TURN credentials, using fallback:', error);
      // Fallback to hardcoded servers
      return [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ];
    }
  }

  async createPeer(socketId, initiator, stream) {
    console.log('Creating peer for:', socketId, 'Initiator:', initiator, 'Stream tracks:', stream?.getTracks().map(t => t.kind));

    // Fetch fresh TURN credentials
    const iceServers = this.cachedIceServers || await this.getIceServers();
    // Cache for reuse within same session
    this.cachedIceServers = iceServers;

    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream,
      config: {
        iceServers,
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
      console.log('🔔 Signal generated:', signal.type, 'for peer:', socketId);

      if (!this.socket || !this.socket.connected) {
        console.error('❌ Socket not connected! Cannot send signal:', signal.type);
        return;
      }

      if (signal.type === 'offer') {
        console.log('📤 Sending OFFER to:', socketId);
        this.socket.emit('offer', { to: socketId, offer: signal, type: 'video' });
      } else if (signal.type === 'answer') {
        console.log('📤 Sending ANSWER to:', socketId);
        this.socket.emit('answer', { to: socketId, answer: signal });
      } else {
        // ICE candidates
        console.log('📤 Sending ICE CANDIDATE to:', socketId, 'Candidate:', signal.candidate);
        this.socket.emit('ice-candidate', { to: socketId, candidate: signal });
      }
    });

    peer.on('connect', () => {
      console.log('Peer connected successfully:', socketId);
    });

    // Track if SimplePeer already emitted the stream
    let simplePeerStreamReceived = false;

    peer.on('stream', (remoteStream) => {
      simplePeerStreamReceived = true;
      console.log('✅ SimplePeer stream event fired for:', socketId, 'with tracks:', remoteStream.getTracks().map(t => t.kind));
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
    console.log(`[${socketId}] SimplePeer._pc exists:`, !!peer._pc);

    if (peer._pc) {
      const pc = peer._pc;
      console.log(`[${socketId}] Initial ICE state:`, pc.iceConnectionState);

      pc.addEventListener('iceconnectionstatechange', () => {
        console.log(`🔵 [${socketId}] ICE connection state:`, pc.iceConnectionState);

        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          console.log(`✅ [${socketId}] ICE CONNECTION ESTABLISHED`);
        }

        if (pc.iceConnectionState === 'failed') {
          console.error(`❌ [${socketId}] ICE connection FAILED`);
        }

        if (pc.iceConnectionState === 'disconnected') {
          console.warn(`⚠️ [${socketId}] ICE connection DISCONNECTED`);
        }
      });

      pc.addEventListener('connectionstatechange', () => {
        console.log(`🟡 [${socketId}] Connection state:`, pc.connectionState);
      });

      // Force check ICE state after delays
      setTimeout(() => {
        console.log(`⏱️ [${socketId}] ICE state after 3s:`, pc.iceConnectionState);
        console.log(`⏱️ [${socketId}] Connection state after 3s:`, pc.connectionState);
      }, 3000);

      setTimeout(() => {
        console.log(`⏱️ [${socketId}] ICE state after 10s:`, pc.iceConnectionState);
        console.log(`⏱️ [${socketId}] Connection state after 10s:`, pc.connectionState);

        if (pc.iceConnectionState === 'new' || pc.iceConnectionState === 'checking') {
          console.error(`❌ [${socketId}] ICE STUCK at '${pc.iceConnectionState}' after 10s. Connection failed.`);
        }
      }, 10000);

      // Log ALL ICE candidates with details (use addEventListener to not override SimplePeer's handler)
      pc.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          const c = event.candidate;
          console.log(`🧊 [${socketId}] ICE candidate generated:`, {
            type: c.type, // host, srflx (STUN), or relay (TURN)
            protocol: c.protocol,
            address: c.address || c.ip,
            port: c.port,
            priority: c.priority,
            foundation: c.foundation
          });

          // Highlight TURN candidates
          if (c.type === 'relay') {
            console.log(`✅ [${socketId}] TURN RELAY candidate found!`);
          } else if (c.type === 'srflx') {
            console.log(`🌐 [${socketId}] STUN reflexive candidate found`);
          } else if (c.type === 'host') {
            console.log(`🏠 [${socketId}] HOST (local) candidate found`);
          }
        } else {
          console.log(`[${socketId}] ICE gathering completed`);
        }
      });

      // Monitor signaling state
      pc.onsignalingstatechange = () => {
        console.log(`[${socketId}] Signaling state:`, pc.signalingState);
      };

      // Log when tracks are received
      const originalOnTrack = pc.ontrack;
      pc.ontrack = (event) => {
        console.log(`[${socketId}] Track received:`, event.track.kind, 'streams:', event.streams.length);

        // Call SimplePeer's original handler
        if (originalOnTrack) {
          originalOnTrack.call(pc, event);
        }
      };
    }

    this.peers.set(socketId, peer);
    return peer;
  }

  async addPeer(socketId, signal, stream) {
    const peer = await this.createPeer(socketId, false, stream);
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