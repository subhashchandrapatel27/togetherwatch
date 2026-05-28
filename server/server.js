import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

/* ── Handle malformed / abrupt client connections without triggering
   the "error already emitted" Node warning.
   By the time clientError fires the socket is already in an error state,
   so destroy() is the only safe call — end() can re-emit the error.  ── */
httpServer.on('clientError', (_err, socket) => {
  socket.destroy();
});

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// rooms: Map<roomId, Map<socketId, { name, isHost }>>
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  return rooms.get(roomId);
}

function getPeer(roomId, excludeId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  for (const [sid, data] of room) {
    if (sid !== excludeId) return { sid, ...data };
  }
  return null;
}

/* Allow browser fetches from any origin (Vite dev + LAN phones) */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
};

app.get('/health', (_, res) => res.set(corsHeaders).json({ ok: true, rooms: rooms.size }));

/* Room existence check — called by the Join flow before connecting */
app.get('/room/:id', (req, res) => {
  const id   = req.params.id.toUpperCase();
  const room = rooms.get(id);
  const exists = !!(room && room.size > 0);
  const full   = !!(room && room.size >= 2);
  res.set(corsHeaders).json({ exists, full });
});

io.on('connection', (socket) => {
  let joinedRoom = null;
  let joinedName = null;

  socket.on('join-room', ({ roomId, name }) => {
    const room = getRoom(roomId);
    if (room.size >= 2) { socket.emit('room-full'); return; }

    // First person in the room becomes the host
    const isHost = room.size === 0;
    joinedRoom = roomId;
    joinedName = name;
    room.set(socket.id, { name, isHost });
    socket.join(roomId);

    const peer = getPeer(roomId, socket.id);
    socket.emit('room-joined', {
      isHost,
      peer: peer ? { name: peer.name, socketId: peer.sid } : null,
    });
    if (peer) {
      io.to(peer.sid).emit('peer-joined', { name, socketId: socket.id });
    }
    console.log(`[room:${roomId}] ${name} joined as ${isHost ? 'HOST' : 'PARTNER'} (${room.size}/2)`);
  });

  socket.on('disconnect', () => {
    if (!joinedRoom) return;
    const room = rooms.get(joinedRoom);
    if (!room) return;
    room.delete(socket.id);
    if (room.size === 0) rooms.delete(joinedRoom);
    socket.to(joinedRoom).emit('peer-left', { name: joinedName });
    console.log(`[room:${joinedRoom}] ${joinedName} left`);
  });

  // Video sync + screenshot relay
  for (const ev of ['play', 'pause', 'seek', 'speed', 'chat', 'screenshot']) {
    socket.on(ev, (payload) => {
      if (joinedRoom) socket.to(joinedRoom).emit(ev, payload);
    });
  }

  // Movie-loaded notification: host → partner
  socket.on('movie-loaded', (payload) => {
    if (joinedRoom) socket.to(joinedRoom).emit('movie-loaded', payload);
  });

  // State sync (for late-joining partner)
  socket.on('request-state', () => {
    if (joinedRoom) socket.to(joinedRoom).emit('state-requested', { from: socket.id });
  });
  socket.on('send-state', ({ to, ...rest }) => {
    io.to(to).emit('state-received', rest);
  });

  // WebRTC signaling relay
  socket.on('offer',  ({ sdp, to }) => io.to(to).emit('offer',  { sdp, from: socket.id }));
  socket.on('answer', ({ sdp, to }) => io.to(to).emit('answer', { sdp, from: socket.id }));
  socket.on('ice',    ({ candidate, to }) => io.to(to).emit('ice', { candidate, from: socket.id }));
});

/* Serve the built React app in production */
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`TogetherWatch server on :${PORT}`));