# Sangam - Virtual Conference Application

A scalable, feature-rich video conferencing application built with WebRTC, Socket.io, React, and Node.js. Sangam provides high-quality video and audio communication with screen sharing, chat, and participant management features.

## Features

### Core Features
- **High-Quality Video/Audio Streaming**: WebRTC-based peer-to-peer video and audio communication
- **Screen Sharing**: Share your screen with other participants
- **Real-time Chat**: Text messaging during meetings
- **Participant Management**: View all participants with their audio/video status
- **Waiting Room**: Host can control who enters the meeting
- **Recording Indicator**: Visual indication when meeting is being recorded
- **Responsive Design**: Works on desktop and mobile devices

### Meeting Controls
- Mute/Unmute audio
- Start/Stop video
- Share screen
- Toggle chat panel
- Toggle participants panel
- Leave meeting
- Remove participants (host only)

### Host Features
- Create new meetings
- Admit users from waiting room
- Remove participants
- Control meeting settings

## Tech Stack

### Backend
- Node.js
- Express.js
- Socket.io (WebRTC signaling)
- UUID (room ID generation)

### Frontend
- React 18
- Socket.io Client
- Simple-peer (WebRTC)
- React Router
- RecordRTC (recording capabilities)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Sangam/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
```bash
# .env file already created with defaults
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Sangam/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Creating a Meeting

1. Open `http://localhost:3000` in your browser
2. Enter your name
3. Optionally enter a meeting name
4. Click "Create Meeting"
5. Share the room ID with participants

### Joining a Meeting

1. Open `http://localhost:3000` in your browser
2. Enter your name
3. Enter the room ID shared by the host
4. Click "Join Meeting"
5. Wait in the waiting room if enabled

### During a Meeting

- **Mute/Unmute**: Click the microphone button
- **Video On/Off**: Click the video camera button
- **Screen Share**: Click the monitor icon
- **Chat**: Click the chat icon to open/close chat panel
- **Participants**: Click the participants icon to view all participants
- **Leave**: Click the red phone icon to leave the meeting

### Host Controls

- **Waiting Room**: Admit users by viewing the waiting room notifications
- **Remove Participant**: Click the X button next to a participant's name
- **Recording**: Control recording from the meeting controls

## Architecture

### WebRTC Signaling Flow

1. User joins room via Socket.io
2. Socket server facilitates WebRTC signaling (offer/answer/ICE candidates)
3. Peer-to-peer connections established between participants
4. Media streams (video/audio/screen) exchanged directly between peers

### Room Management

- Rooms created with unique UUID
- Participant state managed on server
- Settings include waiting room, mute on entry, recording status
- Automatic cleanup when all participants leave

## Scalability Considerations

### Current Implementation
- Peer-to-peer WebRTC connections (mesh topology)
- Socket.io for signaling
- In-memory room storage

### Production Recommendations
1. **Media Server**: Implement SFU (Selective Forwarding Unit) like Mediasoup or Janus for better scalability
2. **Redis**: Use Redis for distributed room state across multiple servers
3. **TURN Server**: Deploy TURN servers for NAT traversal
4. **Load Balancing**: Use nginx or HAProxy for distributing connections
5. **Database**: Store meeting history and user data in PostgreSQL/MongoDB
6. **Cloud Storage**: Store recordings in S3 or similar service
7. **CDN**: Serve static assets via CDN

## Project Structure

```
Sangam/
├── backend/
│   ├── server.js          # Express & Socket.io server
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Room.js           # Main meeting room
│   │   │   ├── VideoGrid.js      # Video grid layout
│   │   │   ├── Controls.js       # Meeting controls
│   │   │   ├── Chat.js           # Chat component
│   │   │   ├── Participants.js   # Participants panel
│   │   │   ├── WaitingRoom.js    # Waiting room UI
│   │   │   └── RecordingIndicator.js
│   │   ├── services/
│   │   │   ├── socket.js         # Socket.io client
│   │   │   └── webrtc.js         # WebRTC service
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   └── App.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json       # Frontend dependencies
└── README.md
```

## Browser Support

- Chrome 74+
- Firefox 66+
- Safari 12.1+
- Edge 79+

WebRTC and modern JavaScript features are required.

## Known Limitations

1. **Mesh Topology**: Current implementation uses mesh topology which limits scalability to ~4-6 participants
2. **No Persistence**: Rooms stored in memory only
3. **No Authentication**: Basic name-based identification
4. **No Actual Recording**: Recording indicator present but actual recording implementation requires server-side processing
5. **No End-to-End Encryption**: Default WebRTC encryption only

## Future Enhancements

- [ ] Implement SFU media server for better scalability
- [ ] Add user authentication and authorization
- [ ] Implement actual recording functionality
- [ ] Add virtual backgrounds
- [ ] Breakout rooms
- [ ] Meeting scheduling
- [ ] Cloud recording storage
- [ ] Mobile app versions
- [ ] Meeting analytics and insights
- [ ] Reactions and hand raising
- [ ] Polls and Q&A

## Contributing

This is a demonstration project. For production use, consider the scalability recommendations and implement proper security measures.

## License

MIT License - Feel free to use this project for learning and development purposes.

## Security Considerations

For production deployment:
1. Implement proper authentication (OAuth, JWT)
2. Use HTTPS and WSS (secure WebSocket)
3. Implement rate limiting
4. Add input validation and sanitization
5. Use environment variables for sensitive data
6. Implement CORS properly
7. Add session management
8. Deploy TURN servers with authentication

## Support

For issues and questions, please refer to the documentation or create an issue in the repository.

---

Built with ❤️ using WebRTC, React, and Node.js