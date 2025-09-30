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

// Connect to database
connectDB();

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

// Store active rooms and participants
const rooms = new Map();
const waitingRooms = new Map();

// Room management
app.post('/api/room/create', roomCreationLimiter, validateRoomName, (req, res) => {
  const roomId = uuidv4();
  const { hostName, roomName } = req.body;

  rooms.set(roomId, {
    id: roomId,
    name: roomName || 'Meeting Room',
    host: hostName,
    participants: [],
    settings: {
      isLocked: false,
      waitingRoomEnabled: true,
      recordingEnabled: false,
      muteOnEntry: false
    },
    createdAt: Date.now()
  });

  res.json({ roomId, message: 'Room created successfully' });
});

app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json(room);
});

// WebRTC Signaling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userName, isHost }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Check if user is already in the room (reconnection scenario)
    const existingParticipant = room.participants.find(p => p.socketId === socket.id);
    if (existingParticipant) {
      console.log(`${userName} already in room ${roomId}, sending current participants`);
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

    const participant = {
      socketId: socket.id,
      userName,
      isHost,
      audioEnabled: true,
      videoEnabled: true,
      isScreenSharing: false
    };

    room.participants.push(participant);

    // Notify other participants
    console.log(`Notifying room ${roomId} about new participant ${participant.userName}`);
    socket.to(roomId).emit('user-joined', participant);

    // Send current participants to new user
    socket.emit('room-participants', room.participants.filter(p => p.socketId !== socket.id));

    console.log(`${userName} joined room ${roomId}`);
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

        console.log(`${user.userName} admitted to room ${roomId}`);
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
    socket.to(to).emit('offer', {
      from: socket.id,
      offer,
      type // 'video', 'audio', 'screen'
    });
  });

  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', {
      from: socket.id,
      answer
    });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
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
    io.to(roomId).emit('chat-message', {
      socketId: socket.id,
      userName,
      message,
      timestamp: Date.now()
    });
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

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove from all rooms
    rooms.forEach((room, roomId) => {
      const index = room.participants.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        room.participants.splice(index, 1);
        io.to(roomId).emit('user-left', { socketId: socket.id });

        // Delete room if empty
        if (room.participants.length === 0) {
          rooms.delete(roomId);
          waitingRooms.delete(roomId);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
});