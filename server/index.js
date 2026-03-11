const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/sessions', require('./routes/sessions'));
app.use('/ai', require('./routes/ai'));

app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Active rooms: { roomId: { participants: [], scenario: '', messages: [] } }
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a practice room
  socket.on('join_room', ({ roomId, userId, userName, role }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { participants: [], messages: [] };

    const participant = { socketId: socket.id, userId, userName, role };
    rooms[roomId].participants.push(participant);

    // Notify all in room
    io.to(roomId).emit('user_joined', { participant, participants: rooms[roomId].participants });
    console.log(`${userName} (${role}) joined room ${roomId}`);
  });

  // Send a message
  socket.on('send_message', ({ roomId, userId, userName, content, symbols }) => {
    const message = {
      id: Date.now(),
      userId,
      userName,
      content,
      symbols: symbols || [],
      timestamp: new Date().toISOString(),
    };
    if (rooms[roomId]) rooms[roomId].messages.push(message);
    io.to(roomId).emit('new_message', message);
  });

  // Therapist sends a prompt/nudge
  socket.on('therapist_prompt', ({ roomId, prompt }) => {
    io.to(roomId).emit('therapist_prompt', { prompt, timestamp: new Date().toISOString() });
  });

  // Leave room
  socket.on('leave_room', ({ roomId, userId }) => {
    socket.leave(roomId);
    if (rooms[roomId]) {
      rooms[roomId].participants = rooms[roomId].participants.filter(p => p.userId !== userId);
      io.to(roomId).emit('user_left', { userId, participants: rooms[roomId].participants });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`CommBridge server running on port ${PORT}`));
