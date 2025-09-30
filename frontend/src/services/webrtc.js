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
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          // Public TURN servers for better mobile connectivity
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
          }
        ],
        // Important for mobile devices
        sdpSemantics: 'unified-plan',
        // Enable all candidates
        iceTransportPolicy: 'all',
        // Bundle policy
        bundlePolicy: 'max-bundle',
        // RTC configuration
        rtcpMuxPolicy: 'require'
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
    });

    peer.on('close', () => {
      console.log('Peer connection closed:', socketId);
    });

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