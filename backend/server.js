const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Security and authentication
const { helmetConfig, generalLimiter, roomCreationLimiter, validateRoomName } = require('./middleware/security');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const aiService = require('./services/aiService');
const securityService = require('./services/securityService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(helmetConfig);
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Authentication routes
app.use('/api/auth', authRoutes);

// TURN server credentials
const turnRoutes = require('./routes/turn');
app.use('/api/turn', turnRoutes);

// Store active rooms and participants
const rooms = new Map();
const waitingRooms = new Map();
const breakoutRooms = new Map(); // mainRoomId -> breakout config
const transcripts = new Map(); // roomId -> transcript array
const aiRecordings = new Map(); // roomId -> recording status

// Generate simple room ID in format xxx-xxx-xxxx
function generateRoomId() {
  const digits = '0123456789';
  let roomId = '';

  // Generate 3 digits
  for (let i = 0; i < 3; i++) {
    roomId += digits[Math.floor(Math.random() * digits.length)];
  }
  roomId += '-';

  // Generate 3 digits
  for (let i = 0; i < 3; i++) {
    roomId += digits[Math.floor(Math.random() * digits.length)];
  }
  roomId += '-';

  // Generate 4 digits
  for (let i = 0; i < 4; i++) {
    roomId += digits[Math.floor(Math.random() * digits.length)];
  }

  // Check if room ID already exists (very rare collision)
  if (rooms.has(roomId)) {
    return generateRoomId(); // Recursively generate new one
  }

  return roomId;
}

// Room management
app.post('/api/room/create', roomCreationLimiter, validateRoomName, (req, res) => {
  const roomId = generateRoomId();
  const { hostName, roomName, password, waitingRoomEnabled, allowParticipantsToShare, muteOnEntry, scheduledTime, complianceMode } = req.body;

  rooms.set(roomId, {
    id: roomId,
    name: roomName || 'Meeting Room',
    host: hostName,
    hostSocketId: null, // Will be set when host joins
    password: password || null,
    participants: [],
    coHosts: [], // Array of socketIds with co-host permissions
    roles: new Map(), // socketId -> role mapping
    pinnedUsers: [], // Array of pinned user socketIds
    spotlightUser: null, // Currently spotlighted user
    settings: {
      isLocked: false,
      waitingRoomEnabled: waitingRoomEnabled || false,
      recordingEnabled: false,
      muteOnEntry: muteOnEntry || false,
      allowParticipantsToShare: allowParticipantsToShare !== false, // default true
      requireHostApproval: waitingRoomEnabled || false,
      complianceMode: complianceMode || 'STANDARD',
      watermarkEnabled: false,
      screenshotPrevention: false
    },
    scheduledTime: scheduledTime || null,
    createdAt: Date.now()
  });

  // Log room creation in audit
  securityService.logAction(roomId, 'ROOM_CREATED', {
    hostName,
    roomName,
    complianceMode: complianceMode || 'STANDARD',
    timestamp: Date.now()
  });

  res.json({ roomId, message: 'Room created successfully' });
});

app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // Return room info without password
  const { password, ...roomInfo } = room;
  res.json({
    ...roomInfo,
    requiresPassword: !!password
  });
});

// Validate room password
app.post('/api/room/:roomId/validate-password', (req, res) => {
  const { roomId } = req.params;
  const { password } = req.body;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (!room.password) {
    return res.json({ valid: true });
  }

  if (room.password === password) {
    return res.json({ valid: true });
  }

  return res.status(401).json({ valid: false, error: 'Incorrect password' });
});

// WebRTC Signaling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userName, isHost }) => {
    console.log(`📥 User ${userName} (${socket.id}) attempting to join room: ${roomId}`);
    const room = rooms.get(roomId);

    if (!room) {
      console.log(`❌ Room not found: ${roomId}`);
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    console.log(`✅ Room found: ${roomId}, Current participants: ${room.participants.length}`);

    // Security checks
    // 1. Check if user is blocked
    if (securityService.isUserBlocked(roomId, socket.id)) {
      console.log(`🚫 Blocked user ${userName} (${socket.id}) attempted to join room ${roomId}`);
      socket.emit('error', { message: 'You have been blocked from this meeting' });
      return;
    }

    // 2. Check if meeting is locked (only host can join locked meeting)
    if (securityService.isMeetingLocked(roomId) && !isHost) {
      console.log(`🔒 Meeting locked: ${userName} (${socket.id}) denied entry to ${roomId}`);
      socket.emit('error', { message: 'This meeting is currently locked' });
      securityService.logAction(roomId, 'JOIN_DENIED_LOCKED', {
        userName,
        socketId: socket.id,
        timestamp: Date.now()
      });
      return;
    }

    // Check if user is already in the room (reconnection scenario)
    const existingParticipant = room.participants.find(p => p.socketId === socket.id);
    if (existingParticipant) {
      // Just send current participants, don't notify others
      socket.emit('room-participants', room.participants.filter(p => p.socketId !== socket.id));
      return;
    }

    // Waiting room logic
    if (room.settings.waitingRoomEnabled && !isHost) {
      const waitingRoom = waitingRooms.get(roomId) || [];
      // Check if user is already in waiting room (prevent duplicates)
      const alreadyWaiting = waitingRoom.some(u => u.socketId === socket.id);

      if (!alreadyWaiting) {
        waitingRoom.push({ socketId: socket.id, userName });
        waitingRooms.set(roomId, waitingRoom);

        socket.emit('waiting-room');
        io.to(roomId).emit('user-waiting', { socketId: socket.id, userName });
      }
      return;
    }

    socket.join(roomId);

    // Assign role
    let userRole = 'PARTICIPANT';
    if (isHost) {
      userRole = 'HOST';
      room.hostSocketId = socket.id;
    } else if (room.coHosts.includes(socket.id)) {
      userRole = 'CO_HOST';
    }
    room.roles.set(socket.id, userRole);

    const participant = {
      socketId: socket.id,
      userName,
      isHost,
      role: userRole,
      audioEnabled: true,
      videoEnabled: true,
      isScreenSharing: false,
      isMuted: room.settings.muteOnEntry || false
    };

    room.participants.push(participant);
    console.log(`👥 Participant added. Total participants: ${room.participants.length}`);

    // Log join event
    securityService.logAction(roomId, 'USER_JOINED', {
      userName,
      socketId: socket.id,
      role: userRole,
      timestamp: Date.now()
    });

    // Notify other participants
    socket.to(roomId).emit('user-joined', participant);
    console.log(`📤 Emitted 'user-joined' to room ${roomId}`);

    // Send current participants to new user
    const otherParticipants = room.participants.filter(p => p.socketId !== socket.id);
    socket.emit('room-participants', otherParticipants);
    console.log(`📤 Sent ${otherParticipants.length} existing participants to ${socket.id}`);

    // Send room info to user including security settings
    socket.emit('room-info', {
      name: room.name,
      id: roomId,
      role: userRole,
      isLocked: room.settings.isLocked,
      coHosts: room.coHosts,
      pinnedUsers: room.pinnedUsers,
      spotlightUser: room.spotlightUser,
      complianceMode: room.settings.complianceMode
    });
    console.log(`📤 Sent room-info to ${socket.id}`);
  });

  // Admit user from waiting room
  socket.on('admit-user', ({ roomId, socketId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const waitingRoom = waitingRooms.get(roomId) || [];
    const userIndex = waitingRoom.findIndex(u => u.socketId === socketId);

    if (userIndex !== -1) {
      const user = waitingRoom[userIndex];
      waitingRoom.splice(userIndex, 1);
      waitingRooms.set(roomId, waitingRoom);

      // Get the socket reference
      const admittedSocket = io.sockets.sockets.get(socketId);
      if (admittedSocket) {
        // Join the room directly
        admittedSocket.join(roomId);

        const participant = {
          socketId: socketId,
          userName: user.userName,
          isHost: false,
          audioEnabled: true,
          videoEnabled: true,
          isScreenSharing: false
        };

        room.participants.push(participant);

        // Notify the admitted user
        admittedSocket.emit('admitted-to-room', { roomId, userName: user.userName });

        // Notify existing participants
        admittedSocket.to(roomId).emit('user-joined', participant);

        // Send current participants to admitted user
        admittedSocket.emit('room-participants', room.participants.filter(p => p.socketId !== socketId));

        // Notify host that user was admitted
        io.to(roomId).emit('user-admitted', { socketId });
      }
    }
  });

  // Reject user from waiting room
  socket.on('reject-user', ({ roomId, socketId }) => {
    const waitingRoom = waitingRooms.get(roomId) || [];
    const userIndex = waitingRoom.findIndex(u => u.socketId === socketId);

    if (userIndex !== -1) {
      waitingRoom.splice(userIndex, 1);
      waitingRooms.set(roomId, waitingRoom);

      io.to(socketId).emit('rejected-from-room');
      io.to(roomId).emit('user-rejected', { socketId });
    }
  });

  // WebRTC Signaling
  socket.on('offer', ({ to, offer, type }) => {
    console.log('📤 OFFER relay:', socket.id, '->', to, 'Type:', type);
    socket.to(to).emit('offer', {
      from: socket.id,
      offer,
      type // 'video', 'audio', 'screen'
    });
  });

  socket.on('answer', ({ to, answer }) => {
    console.log('📤 ANSWER relay:', socket.id, '->', to);
    socket.to(to).emit('answer', {
      from: socket.id,
      answer
    });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    console.log('🧊 ICE candidate relay:', socket.id, '->', to, 'Type:', candidate?.candidate?.type || candidate?.type);
    socket.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate
    });
  });

  // Screen sharing
  socket.on('start-screen-share', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.socketId === socket.id);
      if (participant) {
        participant.isScreenSharing = true;
        io.to(roomId).emit('user-screen-sharing', { socketId: socket.id, isSharing: true });
      }
    }
  });

  socket.on('stop-screen-share', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.socketId === socket.id);
      if (participant) {
        participant.isScreenSharing = false;
        io.to(roomId).emit('user-screen-sharing', { socketId: socket.id, isSharing: false });
      }
    }
  });

  // Media controls
  socket.on('toggle-audio', ({ roomId, enabled }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.socketId === socket.id);
      if (participant) {
        participant.audioEnabled = enabled;
        io.to(roomId).emit('user-audio-toggled', { socketId: socket.id, enabled });
      }
    }
  });

  socket.on('toggle-video', ({ roomId, enabled }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.socketId === socket.id);
      if (participant) {
        participant.videoEnabled = enabled;
        io.to(roomId).emit('user-video-toggled', { socketId: socket.id, enabled });
      }
    }
  });

  // Chat messages
  socket.on('chat-message', ({ roomId, message, userName }) => {
    // Profanity filter
    let filteredMessage = message;
    if (securityService.containsProfanity(message)) {
      filteredMessage = securityService.filterProfanity(message);
      securityService.logAction(roomId, 'PROFANITY_FILTERED', {
        userName,
        socketId: socket.id,
        originalMessage: message,
        timestamp: Date.now()
      });
    }

    io.to(roomId).emit('chat-message', {
      socketId: socket.id,
      userName,
      message: filteredMessage,
      timestamp: Date.now()
    });

    // Log chat message
    securityService.logAction(roomId, 'CHAT_MESSAGE', {
      userName,
      socketId: socket.id,
      timestamp: Date.now()
    });
  });

  // Private messages
  socket.on('private-message', ({ roomId, to, message, userName, recipientName }) => {
    console.log(`📨 Private message from ${userName} to ${recipientName}`);

    // Profanity filter
    let filteredMessage = message;
    if (securityService.containsProfanity(message)) {
      filteredMessage = securityService.filterProfanity(message);
      securityService.logAction(roomId, 'PROFANITY_FILTERED', {
        userName,
        socketId: socket.id,
        type: 'private',
        timestamp: Date.now()
      });
    }

    // Send to recipient
    io.to(to).emit('private-message', {
      socketId: socket.id,
      userName,
      message: filteredMessage,
      timestamp: Date.now(),
      recipientName: userName // For recipient, show who sent it
    });

    // Log private message
    securityService.logAction(roomId, 'PRIVATE_MESSAGE', {
      from: userName,
      to: recipientName,
      timestamp: Date.now()
    });
  });

  // Live Translation / Subtitles
  socket.on('send-subtitle', ({ roomId, userName, text, language, timestamp }) => {
    console.log(`💬 Subtitle from ${userName} (${language}): ${text}`);

    // Store transcript if AI recording is active
    if (aiRecordings.get(roomId)) {
      if (!transcripts.has(roomId)) {
        transcripts.set(roomId, []);
      }
      transcripts.get(roomId).push({
        userName,
        text,
        language,
        timestamp,
        socketId: socket.id
      });
    }

    // Broadcast subtitle to all participants except sender
    socket.to(roomId).emit('subtitle-received', {
      userName,
      text,
      language,
      timestamp
    });

    // Broadcast transcript update to all if AI recording
    if (aiRecordings.get(roomId)) {
      io.to(roomId).emit('transcript-update', {
        userName,
        text,
        language,
        timestamp,
        socketId: socket.id
      });
    }
  });

  // AI Assistant - Start Recording
  socket.on('start-ai-recording', ({ roomId }) => {
    console.log(`🤖 AI Recording started in room ${roomId}`);
    aiRecordings.set(roomId, true);
    if (!transcripts.has(roomId)) {
      transcripts.set(roomId, []);
    }
    io.to(roomId).emit('ai-recording-started', { roomId });
  });

  // AI Assistant - Stop Recording
  socket.on('stop-ai-recording', ({ roomId }) => {
    console.log(`🤖 AI Recording stopped in room ${roomId}`);
    aiRecordings.set(roomId, false);
    io.to(roomId).emit('ai-recording-stopped', { roomId });
  });

  // AI Assistant - Generate Summary
  socket.on('generate-ai-summary', async ({ roomId, transcript, userName }) => {
    console.log(`🤖 Generating AI summary for room ${roomId}`);

    try {
      // Get stored transcript or use provided
      const roomTranscript = transcripts.get(roomId) || [];
      const fullTranscript = transcript || roomTranscript
        .map(t => `${t.userName}: ${t.text}`)
        .join('\n');

      // Generate summary using AI service
      const summary = await aiService.generateMeetingSummary(fullTranscript);

      // Extract action items
      const actionItems = await aiService.extractActionItems(fullTranscript);

      // Generate highlights
      const highlights = await aiService.generateHighlights(fullTranscript);

      // Combine all AI insights
      const aiInsights = {
        ...summary,
        actionItems,
        highlights,
        timestamp: Date.now()
      };

      console.log(`✅ AI summary generated with ${actionItems.length} action items`);

      // Broadcast summary to all participants in the room
      io.to(roomId).emit('ai-summary-generated', aiInsights);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      socket.emit('ai-summary-error', {
        error: 'Failed to generate summary. Please try again.'
      });
    }
  });

  // AI Assistant - Send Summary Email
  socket.on('send-summary-email', async ({ roomId, summary, transcript }) => {
    console.log(`📧 Sending summary email for room ${roomId}`);

    try {
      const room = rooms.get(roomId);
      if (!room) {
        console.log('Room not found');
        return;
      }

      // Get participant names
      const participants = [
        room.hostName,
        ...room.participants.map(p => p.userName)
      ];

      // Format email
      const emailContent = aiService.formatAsEmail(
        summary,
        `Meeting ${roomId}`,
        participants
      );

      console.log('📧 Email content prepared:');
      console.log(emailContent);

      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      // For now, just log the email content
      socket.emit('summary-email-sent', {
        success: true,
        message: 'Summary prepared (email service not configured)'
      });

    } catch (error) {
      console.error('Error sending summary email:', error);
      socket.emit('summary-email-error', {
        error: 'Failed to send email. Please try again.'
      });
    }
  });

  // Reactions
  socket.on('send-reaction', ({ roomId, reaction }) => {
    socket.to(roomId).emit('user-reacted', {
      socketId: socket.id,
      reaction
    });
  });

  // Whiteboard drawing
  socket.on('whiteboard-draw', (data) => {
    // Broadcast drawing data to all other users in the room
    socket.to(data.roomId).emit('whiteboard-draw', data);
  });

  // Polls
  socket.on('create-poll', ({ roomId, poll }) => {
    console.log(`📊 Poll created in room ${roomId}:`, poll.question);
    // Broadcast poll to all participants in the room
    io.to(roomId).emit('poll-created', poll);
  });

  socket.on('vote-poll', ({ roomId, pollId, optionIds, voterName }) => {
    console.log(`📊 Vote received for poll ${pollId} from ${voterName}`);

    // In a production app, you'd store this in a database
    // For now, we'll just broadcast to update the UI
    // The client will handle updating the vote counts locally

    // Broadcast vote update to all participants
    socket.to(roomId).emit('poll-vote-update', {
      pollId,
      voterName,
      optionIds
    });
  });

  socket.on('end-poll', ({ roomId, pollId }) => {
    console.log(`📊 Poll ${pollId} ended in room ${roomId}`);
    // Broadcast poll end to all participants
    io.to(roomId).emit('poll-ended', { pollId });
  });

  // Breakout Rooms
  socket.on('create-breakout-rooms', ({ mainRoomId, numberOfRooms, duration, assignmentType }) => {
    console.log(`🚪 Creating ${numberOfRooms} breakout rooms for ${mainRoomId}`);
    const mainRoom = rooms.get(mainRoomId);
    if (!mainRoom) return;

    // Create breakout rooms
    const breakoutConfig = {
      mainRoomId,
      rooms: [],
      timer: {
        duration: duration || 600000, // Default 10 minutes
        startedAt: Date.now(),
        endsAt: Date.now() + (duration || 600000)
      },
      isActive: true
    };

    // Get participants excluding host
    const participants = mainRoom.participants.filter(p => !p.isHost);

    // Create room objects
    for (let i = 0; i < numberOfRooms; i++) {
      breakoutConfig.rooms.push({
        id: `${mainRoomId}-breakout-${i + 1}`,
        name: `Room ${i + 1}`,
        participants: [],
        participantDetails: []
      });
    }

    // Assign participants
    if (assignmentType === 'auto') {
      // Auto-assign evenly
      participants.forEach((participant, index) => {
        const roomIndex = index % numberOfRooms;
        breakoutConfig.rooms[roomIndex].participants.push(participant.socketId);
        breakoutConfig.rooms[roomIndex].participantDetails.push({
          socketId: participant.socketId,
          userName: participant.userName
        });
      });
    }

    // Store breakout configuration
    breakoutRooms.set(mainRoomId, breakoutConfig);

    // Create actual socket rooms
    breakoutConfig.rooms.forEach(room => {
      rooms.set(room.id, {
        id: room.id,
        name: room.name,
        host: mainRoom.host,
        participants: [],
        settings: { ...mainRoom.settings },
        isBreakoutRoom: true,
        mainRoomId: mainRoomId
      });
    });

    // Notify all participants about breakout rooms
    io.to(mainRoomId).emit('breakout-rooms-created', {
      rooms: breakoutConfig.rooms.map(r => ({
        id: r.id,
        name: r.name,
        assignedParticipants: r.participantDetails
      })),
      timer: breakoutConfig.timer,
      assignmentType
    });

    console.log(`✅ Created ${numberOfRooms} breakout rooms`);
  });

  socket.on('join-breakout-room', ({ mainRoomId, breakoutRoomId, userName }) => {
    console.log(`🚪 ${userName} joining breakout room ${breakoutRoomId}`);

    const breakoutConfig = breakoutRooms.get(mainRoomId);
    if (!breakoutConfig) return;

    const breakoutRoom = rooms.get(breakoutRoomId);
    if (!breakoutRoom) return;

    // Leave main room
    socket.leave(mainRoomId);

    // Join breakout room
    socket.join(breakoutRoomId);

    const participant = {
      socketId: socket.id,
      userName,
      isHost: false,
      audioEnabled: true,
      videoEnabled: true,
      isScreenSharing: false
    };

    breakoutRoom.participants.push(participant);

    // Notify others in breakout room
    socket.to(breakoutRoomId).emit('user-joined', participant);

    // Send current participants to new user
    const otherParticipants = breakoutRoom.participants.filter(p => p.socketId !== socket.id);
    socket.emit('room-participants', otherParticipants);

    // Send breakout room info
    socket.emit('breakout-room-joined', {
      roomId: breakoutRoomId,
      roomName: breakoutRoom.name,
      timer: breakoutConfig.timer
    });

    console.log(`✅ ${userName} joined breakout room ${breakoutRoomId}`);
  });

  socket.on('return-to-main-room', ({ mainRoomId, breakoutRoomId, userName }) => {
    console.log(`🔙 ${userName} returning to main room from ${breakoutRoomId}`);

    const breakoutRoom = rooms.get(breakoutRoomId);
    const mainRoom = rooms.get(mainRoomId);

    if (!breakoutRoom || !mainRoom) return;

    // Remove from breakout room
    const index = breakoutRoom.participants.findIndex(p => p.socketId === socket.id);
    if (index !== -1) {
      breakoutRoom.participants.splice(index, 1);
      socket.to(breakoutRoomId).emit('user-left', { socketId: socket.id });
    }

    // Leave breakout room socket
    socket.leave(breakoutRoomId);

    // Join main room
    socket.join(mainRoomId);

    const participant = {
      socketId: socket.id,
      userName,
      isHost: false,
      audioEnabled: true,
      videoEnabled: true,
      isScreenSharing: false
    };

    mainRoom.participants.push(participant);

    // Notify others in main room
    socket.to(mainRoomId).emit('user-joined', participant);

    // Send current participants to returning user
    const otherParticipants = mainRoom.participants.filter(p => p.socketId !== socket.id);
    socket.emit('room-participants', otherParticipants);

    // Notify user they're back in main room
    socket.emit('returned-to-main-room', { roomId: mainRoomId });

    console.log(`✅ ${userName} returned to main room`);
  });

  socket.on('close-breakout-rooms', ({ mainRoomId }) => {
    console.log(`🚪 Closing all breakout rooms for ${mainRoomId}`);

    const breakoutConfig = breakoutRooms.get(mainRoomId);
    if (!breakoutConfig) return;

    const mainRoom = rooms.get(mainRoomId);
    if (!mainRoom) return;

    // Move all participants back to main room
    breakoutConfig.rooms.forEach(breakoutRoom => {
      const room = rooms.get(breakoutRoom.id);
      if (room) {
        room.participants.forEach(participant => {
          const clientSocket = io.sockets.sockets.get(participant.socketId);
          if (clientSocket) {
            clientSocket.leave(breakoutRoom.id);
            clientSocket.join(mainRoomId);

            // Add to main room participants if not already there
            const existsInMain = mainRoom.participants.find(p => p.socketId === participant.socketId);
            if (!existsInMain) {
              mainRoom.participants.push(participant);
            }
          }
        });

        // Delete breakout room
        rooms.delete(breakoutRoom.id);
      }
    });

    // Notify all participants
    io.to(mainRoomId).emit('breakout-rooms-closed');

    // Delete breakout configuration
    breakoutRooms.delete(mainRoomId);

    console.log(`✅ All breakout rooms closed`);
  });

  socket.on('host-join-breakout', ({ mainRoomId, breakoutRoomId, userName }) => {
    console.log(`👑 Host joining breakout room ${breakoutRoomId}`);

    // Host can join any breakout room temporarily
    socket.join(breakoutRoomId);

    const breakoutRoom = rooms.get(breakoutRoomId);
    if (breakoutRoom) {
      const hostParticipant = {
        socketId: socket.id,
        userName,
        isHost: true,
        audioEnabled: true,
        videoEnabled: true,
        isScreenSharing: false
      };

      // Notify breakout room participants
      socket.to(breakoutRoomId).emit('user-joined', hostParticipant);

      // Send current participants to host
      socket.emit('room-participants', breakoutRoom.participants);

      socket.emit('host-joined-breakout', {
        roomId: breakoutRoomId,
        roomName: breakoutRoom.name
      });
    }
  });

  // Recording controls
  socket.on('start-recording', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.settings.recordingEnabled = true;
      io.to(roomId).emit('recording-started');
    }
  });

  socket.on('stop-recording', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.settings.recordingEnabled = false;
      io.to(roomId).emit('recording-stopped');
    }
  });

  // Room settings
  socket.on('update-room-settings', ({ roomId, settings }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.settings = { ...room.settings, ...settings };
      io.to(roomId).emit('room-settings-updated', room.settings);
    }
  });

  // Remove participant
  socket.on('remove-participant', ({ roomId, socketId }) => {
    io.to(socketId).emit('removed-from-room');
    const clientSocket = io.sockets.sockets.get(socketId);
    if (clientSocket) {
      clientSocket.leave(roomId);
    }
  });

  // End meeting for all participants
  socket.on('end-meeting', ({ roomId }) => {
    console.log(`📤 Host ending meeting for room: ${roomId}`);
    const room = rooms.get(roomId);
    if (room) {
      // Notify all participants that meeting has ended
      io.to(roomId).emit('meeting-ended');

      // Remove all participants from the room
      room.participants.forEach(participant => {
        const clientSocket = io.sockets.sockets.get(participant.socketId);
        if (clientSocket) {
          clientSocket.leave(roomId);
        }
      });

      // Delete the room and waiting room
      rooms.delete(roomId);
      waitingRooms.delete(roomId);
      console.log(`✅ Meeting ended and room deleted: ${roomId}`);
    }
  });

  // ====================================
  // SECURITY & MODERATION FEATURES
  // ====================================

  // Meeting Lock/Unlock
  socket.on('lock-meeting', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.hasPermission(userRole, 'manage_participants')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    securityService.lockMeeting(roomId);
    room.settings.isLocked = true;
    io.to(roomId).emit('meeting-locked', { roomId });
    console.log(`🔒 Meeting ${roomId} locked by ${socket.id}`);
  });

  socket.on('unlock-meeting', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.hasPermission(userRole, 'manage_participants')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    securityService.unlockMeeting(roomId);
    room.settings.isLocked = false;
    io.to(roomId).emit('meeting-unlocked', { roomId });
    console.log(`🔓 Meeting ${roomId} unlocked by ${socket.id}`);
  });

  // Co-host Management
  socket.on('assign-cohost', ({ roomId, targetSocketId, targetUserName }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.isHost(userRole)) {
      socket.emit('error', { message: 'Only host can assign co-hosts' });
      return;
    }

    if (!room.coHosts.includes(targetSocketId)) {
      room.coHosts.push(targetSocketId);
      room.roles.set(targetSocketId, 'CO_HOST');

      // Update participant role
      const participant = room.participants.find(p => p.socketId === targetSocketId);
      if (participant) {
        participant.role = 'CO_HOST';
      }

      io.to(roomId).emit('cohost-assigned', {
        socketId: targetSocketId,
        userName: targetUserName
      });

      securityService.logAction(roomId, 'COHOST_ASSIGNED', {
        targetSocketId,
        targetUserName,
        assignedBy: socket.id,
        timestamp: Date.now()
      });

      console.log(`👑 Co-host assigned: ${targetUserName} in room ${roomId}`);
    }
  });

  socket.on('remove-cohost', ({ roomId, targetSocketId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.isHost(userRole)) {
      socket.emit('error', { message: 'Only host can remove co-hosts' });
      return;
    }

    const index = room.coHosts.indexOf(targetSocketId);
    if (index > -1) {
      room.coHosts.splice(index, 1);
      room.roles.set(targetSocketId, 'PARTICIPANT');

      // Update participant role
      const participant = room.participants.find(p => p.socketId === targetSocketId);
      if (participant) {
        participant.role = 'PARTICIPANT';
      }

      io.to(roomId).emit('cohost-removed', { socketId: targetSocketId });

      securityService.logAction(roomId, 'COHOST_REMOVED', {
        targetSocketId,
        removedBy: socket.id,
        timestamp: Date.now()
      });

      console.log(`👤 Co-host removed: ${targetSocketId} in room ${roomId}`);
    }
  });

  // Participant Controls
  socket.on('mute-all-participants', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.hasPermission(userRole, 'manage_participants')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    // Update all participants to muted state
    room.participants.forEach(p => {
      if (!p.isHost && p.role !== 'CO_HOST') {
        p.isMuted = true;
      }
    });

    io.to(roomId).emit('all-participants-muted');

    securityService.logAction(roomId, 'MUTE_ALL', {
      mutedBy: socket.id,
      timestamp: Date.now()
    });

    console.log(`🔇 All participants muted in room ${roomId}`);
  });

  socket.on('mute-participant', ({ roomId, targetSocketId, targetUserName }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.canModerate(userRole)) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    io.to(targetSocketId).emit('force-muted', { mutedBy: socket.id });

    securityService.logAction(roomId, 'PARTICIPANT_MUTED', {
      targetSocketId,
      targetUserName,
      mutedBy: socket.id,
      timestamp: Date.now()
    });

    console.log(`🔇 Participant ${targetUserName} muted in room ${roomId}`);
  });

  // Spotlight User
  socket.on('spotlight-user', ({ roomId, targetSocketId, targetUserName }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.canModerate(userRole)) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    room.spotlightUser = targetSocketId;
    io.to(roomId).emit('user-spotlighted', {
      socketId: targetSocketId,
      userName: targetUserName
    });

    securityService.logAction(roomId, 'USER_SPOTLIGHTED', {
      targetSocketId,
      targetUserName,
      spotlightedBy: socket.id,
      timestamp: Date.now()
    });

    console.log(`⭐ User ${targetUserName} spotlighted in room ${roomId}`);
  });

  socket.on('remove-spotlight', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.canModerate(userRole)) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    room.spotlightUser = null;
    io.to(roomId).emit('spotlight-removed');

    securityService.logAction(roomId, 'SPOTLIGHT_REMOVED', {
      removedBy: socket.id,
      timestamp: Date.now()
    });
  });

  // Pin User
  socket.on('pin-user', ({ roomId, targetSocketId, targetUserName }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (!room.pinnedUsers.includes(targetSocketId)) {
      room.pinnedUsers.push(targetSocketId);
      io.to(roomId).emit('user-pinned', {
        socketId: targetSocketId,
        userName: targetUserName
      });

      securityService.logAction(roomId, 'USER_PINNED', {
        targetSocketId,
        targetUserName,
        pinnedBy: socket.id,
        timestamp: Date.now()
      });
    }
  });

  socket.on('unpin-user', ({ roomId, targetSocketId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const index = room.pinnedUsers.indexOf(targetSocketId);
    if (index > -1) {
      room.pinnedUsers.splice(index, 1);
      io.to(roomId).emit('user-unpinned', { socketId: targetSocketId });

      securityService.logAction(roomId, 'USER_UNPINNED', {
        targetSocketId,
        unpinnedBy: socket.id,
        timestamp: Date.now()
      });
    }
  });

  // Remove/Kick User
  socket.on('remove-participant', ({ roomId, targetSocketId, targetUserName, reason }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.hasPermission(userRole, 'remove_participants')) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    // Remove participant
    const index = room.participants.findIndex(p => p.socketId === targetSocketId);
    if (index > -1) {
      room.participants.splice(index, 1);
      room.roles.delete(targetSocketId);

      // Notify removed user
      io.to(targetSocketId).emit('removed-from-meeting', {
        reason: reason || 'Removed by host'
      });

      // Notify other participants
      socket.to(roomId).emit('user-left', { socketId: targetSocketId });

      securityService.logAction(roomId, 'PARTICIPANT_REMOVED', {
        targetSocketId,
        targetUserName,
        reason,
        removedBy: socket.id,
        timestamp: Date.now()
      });

      console.log(`🚪 Participant ${targetUserName} removed from room ${roomId}`);
    }
  });

  // Block User
  socket.on('block-user', ({ roomId, targetSocketId, targetUserName, reason }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.canModerate(userRole)) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    // Block and remove user
    const blockedBy = room.participants.find(p => p.socketId === socket.id)?.userName || 'Unknown';
    securityService.blockUser(roomId, targetSocketId, targetUserName, reason, blockedBy);

    // Remove from room
    const index = room.participants.findIndex(p => p.socketId === targetSocketId);
    if (index > -1) {
      room.participants.splice(index, 1);
      room.roles.delete(targetSocketId);

      io.to(targetSocketId).emit('blocked-from-meeting', {
        reason: reason || 'Blocked by moderator'
      });

      socket.to(roomId).emit('user-left', { socketId: targetSocketId });
    }

    console.log(`🚫 User ${targetUserName} blocked from room ${roomId}`);
  });

  socket.on('unblock-user', ({ roomId, targetSocketId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.canModerate(userRole)) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    securityService.unblockUser(roomId, targetSocketId);
    console.log(`✅ User ${targetSocketId} unblocked from room ${roomId}`);
  });

  // Report User
  socket.on('report-user', ({ roomId, reportedSocketId, reportedUserName, reason, details }) => {
    const reportedBy = room.participants.find(p => p.socketId === socket.id)?.userName || 'Anonymous';

    const report = securityService.createReport(
      roomId,
      reportedBy,
      reportedUserName,
      reason,
      details
    );

    socket.emit('report-submitted', {
      reportId: report.id,
      message: 'Report submitted successfully'
    });

    // Notify host/moderators
    const room = rooms.get(roomId);
    if (room) {
      room.participants.forEach(p => {
        if (securityService.canModerate(p.role)) {
          io.to(p.socketId).emit('user-reported', {
            reportId: report.id,
            reportedUser: reportedUserName,
            reason
          });
        }
      });
    }

    console.log(`📢 User ${reportedUserName} reported in room ${roomId}`);
  });

  // Audit Logs
  socket.on('get-audit-logs', ({ roomId, limit }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.canModerate(userRole)) {
      socket.emit('error', { message: 'Insufficient permissions' });
      return;
    }

    const logs = securityService.getAuditLogs(roomId, limit);
    socket.emit('audit-logs', { logs });
  });

  socket.on('export-audit-logs', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.isHost(userRole)) {
      socket.emit('error', { message: 'Only host can export audit logs' });
      return;
    }

    const exportedLogs = securityService.exportAuditLogs(roomId);
    socket.emit('audit-logs-exported', exportedLogs);
  });

  // Watermarking
  socket.on('toggle-watermark', ({ roomId, enabled }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.isHost(userRole)) {
      socket.emit('error', { message: 'Only host can toggle watermarking' });
      return;
    }

    room.settings.watermarkEnabled = enabled;
    io.to(roomId).emit('watermark-toggled', { enabled });

    securityService.logAction(roomId, 'WATERMARK_TOGGLED', {
      enabled,
      toggledBy: socket.id,
      timestamp: Date.now()
    });

    console.log(`💧 Watermark ${enabled ? 'enabled' : 'disabled'} in room ${roomId}`);
  });

  socket.on('get-watermark', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.socketId === socket.id);
    if (!participant) return;

    const watermark = securityService.generateWatermark(
      participant.userName,
      socket.id,
      roomId
    );

    socket.emit('watermark-data', watermark);
  });

  // Compliance Settings
  socket.on('get-compliance-settings', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const complianceSettings = securityService.getComplianceSettings(
      room.settings.complianceMode
    );

    socket.emit('compliance-settings', complianceSettings);
  });

  socket.on('set-compliance-mode', ({ roomId, mode }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const userRole = room.roles.get(socket.id);
    if (!securityService.isHost(userRole)) {
      socket.emit('error', { message: 'Only host can set compliance mode' });
      return;
    }

    room.settings.complianceMode = mode;
    const complianceSettings = securityService.getComplianceSettings(mode);

    io.to(roomId).emit('compliance-mode-changed', {
      mode,
      settings: complianceSettings
    });

    securityService.logAction(roomId, 'COMPLIANCE_MODE_CHANGED', {
      mode,
      changedBy: socket.id,
      timestamp: Date.now()
    });

    console.log(`📋 Compliance mode set to ${mode} in room ${roomId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove from all rooms
    rooms.forEach((room, roomId) => {
      const index = room.participants.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        const leavingParticipant = room.participants[index];
        const wasHost = leavingParticipant.isHost;

        room.participants.splice(index, 1);
        io.to(roomId).emit('user-left', { socketId: socket.id });

        // If the host left and there are still participants, transfer host
        if (wasHost && room.participants.length > 0) {
          const newHost = room.participants[0];
          newHost.isHost = true;

          console.log(`👑 Transferring host from ${socket.id} to ${newHost.socketId}`);
          io.to(roomId).emit('host-left', {
            newHostSocketId: newHost.socketId,
            newHostName: newHost.userName
          });
        }

        // Delete room if empty
        if (room.participants.length === 0) {
          rooms.delete(roomId);
          waitingRooms.delete(roomId);
          console.log(`🗑️ Room deleted (empty): ${roomId}`);
        }
      }
    });

    // Remove from waiting rooms
    waitingRooms.forEach((waitingRoom, roomId) => {
      const index = waitingRoom.findIndex(u => u.socketId === socket.id);
      if (index !== -1) {
        waitingRoom.splice(index, 1);
        if (waitingRoom.length === 0) {
          waitingRooms.delete(roomId);
        } else {
          waitingRooms.set(roomId, waitingRoom);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Connect to database and start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  });
};

startServer();