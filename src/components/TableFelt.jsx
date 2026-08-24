import React from 'react';
import PlayerSeat from './PlayerSeat';
import { Play, Trophy, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function TableFelt({
  gameState,
  currentUserId,
  onPlayerClick,
  onStartHand,
  onShowdownClick,
  isHost,
}) {
  const { tableTheme } = useGame();
  const {
    players = [],
    pots = [],
    totalPot = 0,
    currentStreet = 'PRE_FLOP',
    isHandActive = false,
    smallBlind,
    bigBlind,
    handNumber,
    blindTimerSecondsLeft,
    isTimerRunning,
  } = gameState || {};

  const streetLabels = {
    PRE_FLOP: 'PRE-FLOP',
    FLOP: 'FLOP',
    TURN: 'TURN',
    RIVER: 'RIVER',
    SHOWDOWN: 'SHOWDOWN',
    HAND_OVER: 'HAND OVER',
  };

  const activeCardCount = 
    currentStreet === 'FLOP' ? 3 :
    currentStreet === 'TURN' ? 4 :
    currentStreet === 'RIVER' || currentStreet === 'SHOWDOWN' || currentStreet === 'HAND_OVER' ? 5 : 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const themeClass = 
    tableTheme === 'emerald' 
      ? 'poker-felt-emerald' 
      : tableTheme === 'sapphire' 
      ? 'poker-felt-sapphire' 
      : 'poker-felt-noir';

  const activePlayer = players.find(p => p.isTurn);

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center select-none py-1 sm:py-2 px-1 sm:px-2">
      
      {/* Felt Board Container (Expanded Vertical Spacing for Mobile Portrait) */}
      <div className={`relative w-full aspect-[9/13] xs:aspect-[1/1] sm:aspect-[16/9] md:aspect-[18/9] min-h-[480px] xs:min-h-[500px] sm:min-h-[520px] max-h-[620px] rounded-[36px] sm:rounded-[52px] ${themeClass} flex items-center justify-center p-1 sm:p-6 transition-all duration-300`}>
        
        {/* Table Center Info Deck (Compact to ensure zero overlap on portrait/mobile) */}
        <div className="relative z-10 flex flex-col items-center text-center p-1.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-black/85 backdrop-blur-xl border border-white/10 shadow-2xl max-w-[155px] xs:max-w-[175px] sm:max-w-[260px] w-full">
          
          {/* Hand # & Street Phase Badge */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">#{handNumber}</span>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-amber-300 border border-amber-500/30">
              {streetLabels[currentStreet] || currentStreet}
            </span>
          </div>

          {/* Main Pot & Side Pots Display */}
          <div className="my-0.5">
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pot</div>
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-300 tracking-tight filter drop-shadow">
              ${totalPot.toLocaleString()}
            </div>

            {/* Side Pots breakdown */}
            {pots.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
                {pots.map((pot, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-bold bg-white/5 text-slate-200 px-1.5 py-0.5 rounded border border-white/10"
                  >
                    {pot.name}: ${pot.amount.toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5-Card Community Board Indicators (Light Color Flip Design) */}
          <div className="w-full my-1.5 pt-1.5 border-t border-white/10 flex flex-col items-center">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((cardIdx) => {
                const isRevealed = cardIdx <= activeCardCount;

                return (
                  <div
                    key={cardIdx}
                    className={`relative w-6 h-9 sm:w-10 sm:h-14 rounded-md sm:rounded-lg border transition-all duration-300 flex items-center justify-center shadow-sm overflow-hidden ${
                      isRevealed
                        ? 'bg-gradient-to-b from-[#ffffff] via-[#f8f6f0] to-[#eae5d8] border-amber-400 shadow-md shadow-amber-400/25 scale-102 ring-1 ring-amber-300'
                        : 'bg-black/40 border-dashed border-white/20 opacity-30'
                    }`}
                  >
                    {isRevealed ? (
                      /* Elegant Light Card Graphic */
                      <div className="w-full h-full p-0.5 sm:p-1 flex flex-col items-center justify-center">
                        <div className="w-full h-full border border-amber-500/40 rounded sm:rounded-md flex items-center justify-center bg-gradient-to-br from-amber-50/80 to-amber-100/60 relative">
                          <div className="w-2.5 h-2.5 sm:w-4.5 sm:h-4.5 rotate-45 border-2 border-amber-500/70 flex items-center justify-center bg-amber-200/50 shadow-xs">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-amber-600 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Empty Slot */
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Street Labels */}
            <div className="flex items-center justify-between w-full max-w-[150px] sm:max-w-[220px] mt-1 text-[8px] sm:text-[9px] text-slate-400 font-semibold px-1">
              <span className={activeCardCount >= 3 ? 'text-amber-300 font-bold' : 'opacity-40'}>Flop (3)</span>
              <span className={activeCardCount >= 4 ? 'text-amber-300 font-bold' : 'opacity-40'}>Turn (1)</span>
              <span className={activeCardCount >= 5 ? 'text-amber-300 font-bold' : 'opacity-40'}>River (1)</span>
            </div>
          </div>

          {/* Clean Action Turn Indicator */}
          {isHandActive && currentStreet !== 'SHOWDOWN' && currentStreet !== 'HAND_OVER' && activePlayer && (
            <div className="my-1 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-200 text-[10px] sm:text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>
                {activePlayer.id === currentUserId ? 'Action on you' : `Action: ${activePlayer.name}`}
              </span>
            </div>
          )}

          {/* Blinds & Timer */}
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-300 font-medium">
            <span>${smallBlind} / ${bigBlind}</span>
            {isTimerRunning && blindTimerSecondsLeft > 0 && (
              <span className="flex items-center gap-0.5 text-amber-300 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(blindTimerSecondsLeft)}
              </span>
            )}
          </div>

          {/* Deal / Next Hand Button */}
          {(!isHandActive || currentStreet === 'HAND_OVER') && isHost && (
            <button
              onClick={onStartHand}
              className="mt-2 flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-bold text-xs px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{handNumber === 0 ? 'Deal Hand' : 'Next Hand'}</span>
            </button>
          )}

          {/* Showdown Award Pot Button */}
          {currentStreet === 'SHOWDOWN' && isHandActive && isHost && (
            <button
              onClick={onShowdownClick}
              className="mt-2 flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-xs px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Award Pot</span>
            </button>
          )}
        </div>

        {/* Dynamic Player Seats positioned around the table */}
        {players.map((player, idx) => {
          const totalPlayers = players.length;
          const angle = (idx / totalPlayers) * 2 * Math.PI + Math.PI / 2;
          const radiusX = totalPlayers <= 4 ? 41 : 44;
          const radiusY = totalPlayers <= 4 ? 40 : 43;
          const x = 50 + radiusX * Math.cos(angle);
          const y = 50 + radiusY * Math.sin(angle);

          return (
            <div
              key={player.id}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-20"
            >
              <PlayerSeat
                player={player}
                isSelf={player.id === currentUserId}
                onClick={isHost ? () => onPlayerClick(player) : null}
              />
            </div>
          );
        })}

      </div>

    </div>
  );
}
