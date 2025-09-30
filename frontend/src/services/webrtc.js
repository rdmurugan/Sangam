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
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          // Additional reliable STUN servers
          { urls: 'stun:stun.stunprotocol.org:3478' },
          { urls: 'stun:stun.voip.blackberry.com:3478' },
          // Twilio STUN
          { urls: 'stun:global.stun.twilio.com:3478' },
          // Free TURN servers with better reliability
          {
            urls: 'turn:numb.viagenie.ca',
            username: 'webrtc@live.com',
            credential: 'muazkh'
          },
          {
            urls: 'turn:relay.metered.ca:80',
            username: 'f4b4035eaa67d13a733c9d27',
            credential: 'rHqw7ZB1xCDuPEFR'
          },
          {
            urls: 'turn:relay.metered.ca:443',
            username: 'f4b4035eaa67d13a733c9d27',
            credential: 'rHqw7ZB1xCDuPEFR'
          },
          {
            urls: 'turn:relay.metered.ca:443?transport=tcp',
            username: 'f4b4035eaa67d13a733c9d27',
            credential: 'rHqw7ZB1xCDuPEFR'
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
      console.error('Peer error for', socketId, ':', err);
      // Don't immediately destroy on error - let ICE retry
    });

    peer.on('close', () => {
      console.log('Peer connection closed:', socketId);
      this.peers.delete(socketId);
    });

    // Monitor ICE connection state for debugging
    if (peer._pc) {
      peer._pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for ${socketId}:`, peer._pc.iceConnectionState);

        // Handle connection failures
        if (peer._pc.iceConnectionState === 'failed') {
          console.log(`ICE connection failed for ${socketId}, attempting ICE restart`);
          // SimplePeer will handle ICE restart automatically
        }

        if (peer._pc.iceConnectionState === 'disconnected') {
          console.log(`ICE connection disconnected for ${socketId}, waiting for reconnection...`);
          // Wait a bit before taking action - connection might recover
        }
      };

      peer._pc.onconnectionstatechange = () => {
        console.log(`Connection state for ${socketId}:`, peer._pc.connectionState);
      };

      // Log ICE candidates for debugging
      peer._pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`ICE candidate for ${socketId}:`, event.candidate.type, event.candidate.protocol);
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