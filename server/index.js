import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { GameManager } from './GameManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const gameManager = new GameManager(io);

// Get Local Network IP for Phone Access
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/network-info', (req, res) => {
  const ip = getLocalIpAddress();
  res.json({
    localIp: ip,
    port: process.env.PORT || 3001,
    frontendPort: 5173,
    phoneJoinUrl: `http://${ip}:5173`,
  });
});

app.get('/api/room/:roomId', (req, res) => {
  const room = gameManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    roomId: room.id,
    name: room.name,
    status: room.status,
    playerCount: room.engine.players.length,
    smallBlind: room.engine.smallBlind,
    bigBlind: room.engine.bigBlind,
    startingStack: room.engine.startingStack,
  });
});

// Socket.io Real-Time Handlers
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Create Room
  socket.on('create_room', ({ hostData, config }, callback) => {
    try {
      const room = gameManager.createRoom(hostData, config);
      socket.join(room.id);
      gameManager.socketToRoom.set(socket.id, { roomId: room.id, playerId: hostData.id });
      
      const initialState = {
        roomId: room.id,
        hostId: room.hostId,
        name: room.name,
        status: room.status,
        isLocked: room.isLocked,
        blindTimerMinutes: room.blindTimerMinutes,
        blindTimerSecondsLeft: room.blindTimerSecondsLeft,
        isTimerRunning: room.isTimerRunning,
        ...room.engine.getState(),
      };

      callback({ success: true, roomId: room.id, state: initialState });
      gameManager.broadcastState(room.id, 'JOIN');
    } catch (err) {
      console.error('Error creating room:', err);
      callback({ success: false, error: err.message });
    }
  });

  // Join Room (handles new player or reconnecting existing player by nickname)
  socket.on('join_room', ({ roomId, playerData }, callback) => {
    try {
      const { room, activePlayer } = gameManager.joinRoom(roomId, playerData, socket.id);
      socket.join(room.id);

      const isReconnected = activePlayer.id !== playerData.id || activePlayer.name.trim().toLowerCase() === (playerData.name || '').trim().toLowerCase();

      const fullState = {
        roomId: room.id,
        hostId: room.hostId,
        name: room.name,
        status: room.status,
        isLocked: room.isLocked,
        blindTimerMinutes: room.blindTimerMinutes,
        blindTimerSecondsLeft: room.blindTimerSecondsLeft,
        isTimerRunning: room.isTimerRunning,
        ...room.engine.getState(),
      };

      callback({
        success: true,
        roomId: room.id,
        playerId: activePlayer.id,
        playerName: activePlayer.name,
        isReconnected: isReconnected,
        state: fullState
      });
      gameManager.broadcastState(room.id, 'JOIN');
    } catch (err) {
      console.error('Error joining room:', err);
      callback({ success: false, error: err.message });
    }
  });

  // Host Action: Add Test Player / Bot
  socket.on('add_test_player', ({ roomId }, callback) => {
    try {
      gameManager.addTestPlayer(roomId);
      gameManager.broadcastState(roomId, 'JOIN');
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Add test player error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Host Action: Rearrange / Reorder Players in Pre-game Lobby
  socket.on('reorder_players', ({ roomId, orderedPlayerIds }, callback) => {
    try {
      gameManager.reorderPlayers(roomId, orderedPlayerIds);
      gameManager.broadcastState(roomId);
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Reorder players error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Host Action: Start Game from Lobby
  socket.on('start_game', ({ roomId }, callback) => {
    try {
      gameManager.startGame(roomId);
      gameManager.broadcastState(roomId, 'DEAL');
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Start game error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Start Next Hand (when active hand finishes)
  socket.on('start_hand', ({ roomId }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');
      room.engine.startHand();
      gameManager.broadcastState(room.id, 'DEAL');
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Start hand error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Player Actions: Fold, Check, Call, Raise
  socket.on('player_action', ({ roomId, playerId, action, amount }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      switch (action) {
        case 'fold':
          room.engine.fold(playerId);
          gameManager.broadcastState(room.id, 'FOLD');
          break;
        case 'check':
          room.engine.check(playerId);
          gameManager.broadcastState(room.id, 'CHECK');
          break;
        case 'call':
          room.engine.call(playerId);
          gameManager.broadcastState(room.id, 'CHIPS');
          break;
        case 'raise':
        case 'bet':
        case 'all-in':
          room.engine.raise(playerId, amount);
          gameManager.broadcastState(room.id, 'CHIPS');
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Player action error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Showdown: Award Pots
  socket.on('award_pots', ({ roomId, potWinners }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      room.engine.awardPots(potWinners);
      gameManager.broadcastState(room.id, 'WIN');
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Award pots error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Host Action: Undo
  socket.on('undo_action', ({ roomId }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      const ok = room.engine.undo();
      if (!ok) throw new Error('No actions to undo in history');

      gameManager.broadcastState(room.id, 'UNDO');
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Undo error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Host Action: Rebuy
  socket.on('rebuy', ({ roomId, playerId, amount }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      room.engine.rebuy(playerId, amount);
      gameManager.broadcastState(room.id, 'CHIPS');
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Rebuy error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Host Action: Edit Stack
  socket.on('edit_stack', ({ roomId, playerId, newStack }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      room.engine.editStack(playerId, newStack);
      gameManager.broadcastState(room.id);
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Edit stack error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Player / Host Action: Take Loan Stack
  socket.on('take_loan', ({ roomId, playerId, amount }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      room.engine.takeLoan(playerId, amount);
      gameManager.broadcastState(room.id);
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Take loan error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Player / Host Action: Repay Loan
  socket.on('repay_loan', ({ roomId, playerId, amount }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      room.engine.repayLoan(playerId, amount);
      gameManager.broadcastState(room.id);
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Repay loan error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Host Action: Kick Player
  socket.on('kick_player', ({ roomId, playerId }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      room.engine.removePlayer(playerId);
      io.to(room.id).emit('player_kicked', { playerId });
      gameManager.broadcastState(room.id);
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Kick player error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Host Action: Update Blind Timer
  socket.on('toggle_blind_timer', ({ roomId, action }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      if (!room) throw new Error('Room not found');

      if (action === 'start') {
        gameManager.startBlindTimer(roomId);
      } else {
        gameManager.pauseBlindTimer(roomId);
      }
      if (callback) callback({ success: true });
    } catch (err) {
      console.error('Timer toggle error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket.id);
  });
});

// Production Static Serving
const distPath = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' || fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIpAddress();
  console.log(`\n======================================================`);
  console.log(`♠️♥️ PokerChip Server Running on Port ${PORT} ♣️♦️`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Network: http://${ip}:${PORT}`);
  console.log(`======================================================\n`);
});
