import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { sounds } from '../sound/audioEffects';
import { THEMES } from '../utils/theme';

const GameContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || (
  window.location.port === '5173' 
    ? `http://${window.location.hostname}:3001` 
    : window.location.origin
);

export function GameProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [error, setError] = useState(null);
  const [reconnectAlert, setReconnectAlert] = useState(null);

  // Table Theme: 'cyberpunk' (default) | 'emerald' | 'sapphire'
  const [tableTheme, setTableThemeState] = useState(() => {
    return localStorage.getItem('poker_table_theme') || 'cyberpunk';
  });

  const setTableTheme = (themeName) => {
    setTableThemeState(themeName);
    localStorage.setItem('poker_table_theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tableTheme);
  }, [tableTheme]);

  const currentTheme = THEMES[tableTheme] || THEMES.cyberpunk;

  // Local User Identity per Browser Tab (Enables multiple tabs to be separate players)
  const [user, setUser] = useState(() => {
    const savedId = sessionStorage.getItem('poker_user_id') || `user_${Math.random().toString(36).substr(2, 9)}`;
    const savedName = sessionStorage.getItem('poker_user_name') || '';
    const savedAvatar = sessionStorage.getItem('poker_user_avatar') || 'tiger';
    sessionStorage.setItem('poker_user_id', savedId);
    return { id: savedId, name: savedName, avatar: savedAvatar };
  });

  const updateUserProfile = (name, avatar) => {
    const updated = { ...user, name, avatar };
    setUser(updated);
    sessionStorage.setItem('poker_user_name', name);
    sessionStorage.setItem('poker_user_avatar', avatar);
  };

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.toggleSound(next);
  };

  // Fetch Network Info for Mobile QR Code
  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(data => setNetworkInfo(data))
      .catch(() => {
        setNetworkInfo({
          localIp: window.location.hostname,
          phoneJoinUrl: window.location.origin,
        });
      });
  }, []);

  // Initialize Socket.io
  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to server');
      setConnected(true);
      setError(null);
    });

    s.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setConnected(false);
    });

    s.on('game_state_update', (state) => {
      setGameState(state);
      if (state.soundEffect) {
        sounds.playEffect(state.soundEffect);
      }
      
      // Check if it's currently this user's turn
      const myPlayer = state.players?.find(p => p.id === user.id);
      if (myPlayer?.isTurn && state.isHandActive) {
        sounds.playTurnAlert();
      }
    });

    s.on('player_kicked', ({ playerId }) => {
      if (playerId === user.id) {
        setGameState(null);
        setError('You were removed from the table by the host.');
        window.location.href = '/';
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user.id]);

  // --- ACTIONS ---
  const createRoom = (config) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected'));
      socket.emit('create_room', { hostData: user, config }, (res) => {
        if (res.success) {
          const profile = { id: user.id, name: user.name, avatar: user.avatar };
          localStorage.setItem(`poker_player_${res.roomId}`, JSON.stringify(profile));
          sessionStorage.setItem(`poker_player_${res.roomId}`, JSON.stringify(profile));
          if (res.state) setGameState(res.state);
          resolve(res.roomId);
        } else {
          setError(res.error);
          reject(new Error(res.error));
        }
      });
    });
  };

  const joinRoom = (roomId, initialStack, customName = null, customAvatar = null) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected'));
      const cleanCode = roomId.toUpperCase();
      const activeName = customName || user.name;
      const activeAvatar = customAvatar || user.avatar;

      socket.emit('join_room', {
        roomId: cleanCode,
        playerData: { ...user, name: activeName, avatar: activeAvatar, stack: initialStack }
      }, (res) => {
        if (res.success) {
          if (res.playerId) {
            const profile = { id: res.playerId, name: res.playerName || activeName, avatar: activeAvatar };
            setUser(profile);
            sessionStorage.setItem('poker_user_id', res.playerId);
            sessionStorage.setItem('poker_user_name', profile.name);
            sessionStorage.setItem('poker_user_avatar', profile.avatar);
            localStorage.setItem(`poker_player_${cleanCode}`, JSON.stringify(profile));
            sessionStorage.setItem(`poker_player_${cleanCode}`, JSON.stringify(profile));
          }
          if (res.isReconnected) {
            setReconnectAlert(`Welcome back, ${res.playerName}! Reconnected to your seat.`);
            setTimeout(() => setReconnectAlert(null), 4000);
          }
          setGameState(res.state);
          resolve(res.roomId);
        } else {
          setError(res.error);
          reject(new Error(res.error));
        }
      });
    });
  };

  const addTestPlayer = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !gameState) return reject(new Error('Socket not connected'));
      socket.emit('add_test_player', { roomId: gameState.roomId }, (res) => {
        if (res.success) {
          resolve(true);
        } else {
          setError(res.error);
          reject(new Error(res.error));
        }
      });
    });
  };

  const startGame = () => {
    return new Promise((resolve, reject) => {
      if (!socket || !gameState) return reject(new Error('Socket not connected'));
      socket.emit('start_game', { roomId: gameState.roomId }, (res) => {
        if (res.success) {
          resolve(true);
        } else {
          setError(res.error);
          reject(new Error(res.error));
        }
      });
    });
  };

  const reorderPlayers = (orderedPlayerIds) => {
    return new Promise((resolve, reject) => {
      if (!socket || !gameState) return reject(new Error('Socket not connected'));
      socket.emit('reorder_players', { roomId: gameState.roomId, orderedPlayerIds }, (res) => {
        if (res.success) {
          resolve(true);
        } else {
          setError(res.error);
          reject(new Error(res.error));
        }
      });
    });
  };

  const startHand = () => {
    if (!socket || !gameState) return;
    socket.emit('start_hand', { roomId: gameState.roomId }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const sendAction = (action, amount = 0, explicitPlayerId = null) => {
    if (!socket || !gameState) return;
    const targetPlayer = gameState.players?.find(p => p.id === user.id || (user.name && p.name && p.name.trim().toLowerCase() === user.name.trim().toLowerCase()));
    const activePlayerId = explicitPlayerId || targetPlayer?.id || user.id;

    socket.emit('player_action', {
      roomId: gameState.roomId,
      playerId: activePlayerId,
      action,
      amount,
    }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const awardPots = (potWinners) => {
    if (!socket || !gameState) return;
    socket.emit('award_pots', {
      roomId: gameState.roomId,
      potWinners,
    }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const undoAction = () => {
    if (!socket || !gameState) return;
    socket.emit('undo_action', { roomId: gameState.roomId }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const rebuy = (playerId, amount) => {
    if (!socket || !gameState) return;
    socket.emit('rebuy', { roomId: gameState.roomId, playerId, amount }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const editStack = (playerId, newStack) => {
    if (!socket || !gameState) return;
    socket.emit('edit_stack', { roomId: gameState.roomId, playerId, newStack }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const kickPlayer = (playerId) => {
    if (!socket || !gameState) return;
    socket.emit('kick_player', { roomId: gameState.roomId, playerId }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const toggleBlindTimer = (action) => {
    if (!socket || !gameState) return;
    socket.emit('toggle_blind_timer', { roomId: gameState.roomId, action }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const takeLoan = (playerId = null, amount = null) => {
    if (!socket || !gameState) return;
    const targetPlayer = gameState.players?.find(p => p.id === user.id || (user.name && p.name && p.name.trim().toLowerCase() === user.name.trim().toLowerCase()));
    const activePlayerId = playerId || targetPlayer?.id || user.id;

    socket.emit('take_loan', { roomId: gameState.roomId, playerId: activePlayerId, amount }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const repayLoan = (playerId = null, amount = null) => {
    if (!socket || !gameState) return;
    const targetPlayer = gameState.players?.find(p => p.id === user.id || (user.name && p.name && p.name.trim().toLowerCase() === user.name.trim().toLowerCase()));
    const activePlayerId = playerId || targetPlayer?.id || user.id;

    socket.emit('repay_loan', { roomId: gameState.roomId, playerId: activePlayerId, amount }, (res) => {
      if (!res.success) setError(res.error);
    });
  };

  const value = {
    socket,
    connected,
    gameState,
    user,
    soundEnabled,
    tableTheme,
    currentTheme,
    reconnectAlert,
    setReconnectAlert,
    setTableTheme,
    networkInfo,
    error,
    setError,
    updateUserProfile,
    toggleSound,
    createRoom,
    joinRoom,
    addTestPlayer,
    startGame,
    reorderPlayers,
    startHand,
    sendAction,
    awardPots,
    undoAction,
    rebuy,
    editStack,
    kickPlayer,
    toggleBlindTimer,
    takeLoan,
    repayLoan,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
