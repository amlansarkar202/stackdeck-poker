import { PokerEngine } from './PokerEngine.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomId -> RoomObject
    this.socketToRoom = new Map(); // socketId -> { roomId, playerId }
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(hostData, config = {}) {
    let roomId = this.generateRoomCode();
    while (this.rooms.has(roomId)) {
      roomId = this.generateRoomCode();
    }

    const engine = new PokerEngine({
      smallBlind: config.smallBlind || 10,
      bigBlind: config.bigBlind || 20,
      ante: config.ante || 0,
      startingStack: config.startingStack || 1000,
    });

    const room = {
      id: roomId,
      hostId: hostData.id,
      name: config.roomName || `${hostData.name}'s Game`,
      status: 'LOBBY', // 'LOBBY' | 'ACTIVE'
      isLocked: false,
      createdAt: Date.now(),
      engine: engine,
      blindTimerMinutes: Number(config.blindTimerMinutes) || 0,
      blindTimerSecondsLeft: (Number(config.blindTimerMinutes) || 0) * 60,
      isTimerRunning: false,
      timerInterval: null,
      passcode: config.passcode || null,
    };

    // Add Host as first player
    engine.addPlayer({
      id: hostData.id,
      name: hostData.name || 'Host',
      avatar: hostData.avatar || '👑',
      stack: config.startingStack || 1000,
    });

    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId?.toUpperCase());
  }

  joinRoom(roomId, playerData, socketId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const inputName = (playerData.name || '').trim();

    // Cancel any scheduled room cleanup timer
    if (room.cleanupTimeout) {
      clearTimeout(room.cleanupTimeout);
      room.cleanupTimeout = null;
    }

    // Check if player already exists in room by ID OR case-insensitive nickname matching
    let existingPlayer = room.engine.players.find(
      p => p.id === playerData.id || (inputName && p.name.trim().toLowerCase() === inputName.toLowerCase())
    );

    let activePlayer;
    if (existingPlayer) {
      // Reconnect / resume existing seat seamlessly
      existingPlayer.isConnected = true;
      if (playerData.avatar) existingPlayer.avatar = playerData.avatar;
      activePlayer = existingPlayer;
      room.engine.logAction(`🔄 ${existingPlayer.name} reconnected to table`);
    } else {
      // If game has already started and locked, prevent new random entries
      if (room.isLocked || room.status === 'ACTIVE') {
        throw new Error('This game has already started and is locked to new players. Only existing players can reconnect.');
      }

      // New Player Entry
      activePlayer = room.engine.addPlayer({
        id: playerData.id,
        name: inputName,
        avatar: playerData.avatar,
        stack: playerData.stack || room.engine.startingStack,
      });
    }

    this.socketToRoom.set(socketId, { roomId: room.id, playerId: activePlayer.id });
    return { room, activePlayer };
  }

  addTestPlayer(roomId) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    const botAvatars = ['tiger', 'dragon', 'phoenix', 'eagle', 'wolf', 'lion', 'shark', 'reaper', 'crown', 'ace'];
    const botNames = ['Apex Bengal', 'Draco', 'Solar Phoenix', 'War Eagle', 'Shadow Wolf', 'Golden Leo', 'Megalodon', 'Reaper', 'High Roller', 'Ace'];
    const idx = room.engine.players.length;
    const name = botNames[(idx - 1) % botNames.length] || `Beast ${idx + 1}`;
    const avatar = botAvatars[(idx - 1) % botAvatars.length] || 'tiger';
    
    return room.engine.addPlayer({
      id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name,
      avatar,
      stack: room.engine.startingStack,
    });
  }

  reorderPlayers(roomId, orderedPlayerIds) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    room.engine.reorderPlayers(orderedPlayerIds);
  }

  startGame(roomId) {
    const room = this.getRoom(roomId);
    if (!room) throw new Error('Room not found');
    if (room.engine.players.length < 2) {
      throw new Error('At least 2 players are needed to start the game');
    }

    room.status = 'ACTIVE';
    room.isLocked = true; // Lock room to new entries
    room.engine.startHand();

    if (room.blindTimerMinutes > 0 && !room.isTimerRunning) {
      this.startBlindTimer(roomId);
    }
  }

  handleDisconnect(socketId) {
    const session = this.socketToRoom.get(socketId);
    if (!session) return;

    const { roomId, playerId } = session;
    const room = this.getRoom(roomId);
    if (room) {
      const player = room.engine.players.find(p => p.id === playerId);
      if (player) {
        player.isConnected = false;
        room.engine.logAction(`${player.name} disconnected`);
      }
      this.broadcastState(roomId);

      // If all human players are disconnected, schedule room cleanup in 30 minutes
      const hasActiveHumans = room.engine.players.some(p => !p.id.startsWith('bot_') && p.isConnected);
      if (!hasActiveHumans) {
        if (room.cleanupTimeout) clearTimeout(room.cleanupTimeout);
        room.cleanupTimeout = setTimeout(() => {
          console.log(`[Room Cleanup] Deleting abandoned room ${roomId}`);
          this.pauseBlindTimer(roomId);
          this.rooms.delete(roomId);
        }, 30 * 60 * 1000);
      }
    }
    this.socketToRoom.delete(socketId);
  }

  broadcastState(roomId, soundEffect = null) {
    const room = this.getRoom(roomId);
    if (!room) return;

    const state = {
      roomId: room.id,
      hostId: room.hostId,
      name: room.name,
      status: room.status,
      isLocked: room.isLocked,
      blindTimerMinutes: room.blindTimerMinutes,
      blindTimerSecondsLeft: room.blindTimerSecondsLeft,
      isTimerRunning: room.isTimerRunning,
      soundEffect: soundEffect,
      ...room.engine.getState(),
    };

    if (this.io) {
      this.io.to(room.id).emit('game_state_update', state);
    }
  }

  startBlindTimer(roomId) {
    const room = this.getRoom(roomId);
    if (!room || room.blindTimerMinutes <= 0 || room.isTimerRunning) return;

    room.isTimerRunning = true;
    room.timerInterval = setInterval(() => {
      if (room.blindTimerSecondsLeft > 0) {
        room.blindTimerSecondsLeft--;
        if (room.blindTimerSecondsLeft === 0) {
          // Double blinds
          room.engine.smallBlind *= 2;
          room.engine.bigBlind *= 2;
          room.engine.logAction(`⏰ Blinds increased to $${room.engine.smallBlind} / $${room.engine.bigBlind}`);
          room.blindTimerSecondsLeft = room.blindTimerMinutes * 60;
          this.broadcastState(roomId, 'BLIND_ALERT');
          return;
        }
        // Broadcast timer tick every 10 seconds or when under 10 seconds
        if (room.blindTimerSecondsLeft % 10 === 0 || room.blindTimerSecondsLeft <= 10) {
          this.broadcastState(roomId);
        }
      }
    }, 1000);
  }

  pauseBlindTimer(roomId) {
    const room = this.getRoom(roomId);
    if (!room || !room.isTimerRunning) return;
    clearInterval(room.timerInterval);
    room.isTimerRunning = false;
    this.broadcastState(roomId);
  }
}
