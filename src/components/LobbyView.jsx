import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useGame } from '../context/GameContext';
import { Play, Users, ArrowUp, ArrowDown, UserX, Copy, Check, QrCode, Shield, UserPlus } from 'lucide-react';
import { AvatarIcon } from './AvatarIcon';

export default function LobbyView() {
  const { gameState, user, startGame, reorderPlayers, kickPlayer, addTestPlayer, networkInfo } = useGame();
  const { roomId, hostId, players = [], smallBlind, bigBlind, ante, startingStack, blindTimerMinutes } = gameState || {};

  const isHost = hostId === user.id;
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [addingBot, setAddingBot] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Invite & QR Join URL (Always uses the exact current domain)
  const joinUrl = `${window.location.origin}/join?code=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBot = async () => {
    if (!isHost) return;
    setAddingBot(true);
    setErrorMsg('');
    try {
      await addTestPlayer();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add test player');
    } finally {
      setAddingBot(false);
    }
  };

  const handleMove = (index, direction) => {
    if (!isHost) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= players.length) return;

    const newOrder = [...players];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    reorderPlayers(newOrder.map(p => p.id));
  };

  const handleStart = async () => {
    if (!isHost) return;
    if (players.length < 2) {
      setErrorMsg('At least 2 players must join before starting the game');
      return;
    }
    setStarting(true);
    setErrorMsg('');
    try {
      await startGame();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start game');
      setStarting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5 animate-fade-in">
      
      {/* Top Banner: Room Code & Game Info */}
      <div className="bg-[#111620]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
        
        {/* Left: Room & Blinds info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pre-Game Lobby</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Room Code: <span className="text-amber-300 font-mono tracking-wider">{roomId}</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Share code or QR code with players. Host can arrange table seats below.
          </p>

          <div className="flex flex-wrap gap-2 mt-3 text-xs font-semibold text-slate-300">
            <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg">
              Blinds: ${smallBlind} / ${bigBlind}
            </span>
            <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg">
              Starting Stack: ${startingStack}
            </span>
            {ante > 0 && (
              <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg">
                Ante: ${ante}
              </span>
            )}
            {blindTimerMinutes > 0 && (
              <span className="bg-black/40 border border-white/10 px-3 py-1 rounded-lg">
                Timer: {blindTimerMinutes}m
              </span>
            )}
          </div>
        </div>

        {/* Right: QR Code & Copy Button */}
        <div className="flex flex-col items-center gap-2 bg-black/50 p-3 rounded-xl border border-white/10">
          <div className="bg-white p-1.5 rounded-lg">
            <QRCodeSVG value={joinUrl} size={96} />
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>

      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold text-center">
          {errorMsg}
        </div>
      )}

      {/* Main Seating Arrangement Panel */}
      <div className="bg-[#111620]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl flex flex-col gap-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Seating Arrangement ({players.length} Seated)
            </h2>
          </div>
          
          {isHost && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddBot}
                disabled={addingBot}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                title="Add a test player"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Test Player</span>
              </button>
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                Arrange seats with ⬆️ ⬇️
              </span>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="space-y-2">
          {players.map((player, idx) => {
            const isMe = player.id === user.id;
            const isPlayerHost = player.id === hostId;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-black/40 border-amber-400/50 shadow-sm ring-1 ring-amber-400/30'
                    : 'bg-black/25 border-white/10 hover:bg-black/35'
                }`}
              >
                {/* Left: Seat Number + Avatar + Name */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-black/60 border border-white/10 text-[11px] font-bold text-slate-400 flex items-center justify-center">
                    #{idx + 1}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center p-1">
                    <AvatarIcon id={player.avatar || player.name?.slice(0, 2).toUpperCase()} className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {player.name} {isMe && '(You)'}
                      </span>
                      {isPlayerHost && (
                        <span className="text-[9px] font-bold uppercase bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                          Host
                        </span>
                      )}
                      {idx === 0 && (
                        <span className="text-[9px] font-bold uppercase bg-white/10 text-slate-300 px-1.5 py-0.5 rounded border border-white/20">
                          First Dealer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Stack: ${player.stack.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Right: Host Reorder & Kick Controls */}
                {isHost ? (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move Seat Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === players.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move Seat Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    {!isPlayerHost && (
                      <button
                        onClick={() => kickPlayer(player.id)}
                        className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 transition-colors ml-1"
                        title="Remove Player"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 font-medium">
                    Seat #{idx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start Game Action */}
        <div className="pt-3 border-t border-white/10 flex flex-col items-center">
          {isHost ? (
            <button
              onClick={handleStart}
              disabled={players.length < 2 || starting}
              className={`w-full py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
                players.length >= 2 && !starting
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 hover:scale-101 active:scale-99 cursor-pointer'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {starting
                  ? 'Starting Table...'
                  : players.length < 2
                  ? 'Waiting for at least 1 more player...'
                  : 'Start Game & Lock Room'}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 py-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Waiting for host to start game...</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
