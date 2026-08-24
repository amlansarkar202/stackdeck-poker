import React from 'react';
import { WifiOff } from 'lucide-react';
import { AvatarIcon, AVATAR_CRESTS } from './AvatarIcon';
import { useGame } from '../context/GameContext';

export default function PlayerSeat({ player, isSelf = false, onClick = null }) {
  const { user } = useGame();
  if (!player) return null;

  const isActuallySelf = isSelf || (player.id === user?.id) || (user?.name && player.name && player.name.trim().toLowerCase() === user?.name.trim().toLowerCase());
  const initials = player.name ? player.name.slice(0, 2).toUpperCase() : 'P';
  const crest = AVATAR_CRESTS.find(c => c.id === player.avatar);

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center select-none transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${player.isFolded ? 'opacity-30 grayscale' : 'opacity-100'}`}
    >
      {/* Position Badges (Dealer Button D / SB / BB) */}
      <div className="absolute -top-3 sm:-top-3.5 flex items-center gap-0.5 z-20">
        {player.isDealer && (
          <span
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full bg-amber-300 text-gray-950 font-black text-[9px] sm:text-[10px] flex items-center justify-center shadow border border-amber-100 ring-1 ring-black/80"
            title="Dealer Button"
          >
            D
          </span>
        )}
        {player.isSB && (
          <span
            className="px-1 py-0.5 rounded bg-blue-900/90 text-blue-200 font-bold text-[8px] border border-blue-500/30"
            title="Small Blind"
          >
            SB
          </span>
        )}
        {player.isBB && (
          <span
            className="px-1 py-0.5 rounded bg-amber-900/90 text-amber-200 font-bold text-[8px] border border-amber-500/30"
            title="Big Blind"
          >
            BB
          </span>
        )}
      </div>

      {/* Avatar Container with Glowing Light Ring on Active Turn (Compact for zero overlap) */}
      <div
        className={`relative z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#111620] border-2 transition-all p-1 sm:p-1.5 ${
          player.isTurn
            ? 'border-amber-300 turn-ring-active'
            : isActuallySelf
            ? 'border-emerald-500/80'
            : crest ? crest.border : 'border-white/15'
        }`}
      >
        <AvatarIcon id={player.avatar || initials} className="w-4.5 h-4.5 sm:w-7 sm:h-7" />

        {/* Disconnect indicator */}
        {!player.isConnected && (
          <div
            className="absolute -bottom-1 -right-1 bg-red-600 text-white p-0.5 rounded-full text-[8px] border border-black shadow"
            title="Disconnected"
          >
            <WifiOff className="w-2.5 h-2.5" />
          </div>
        )}

        {/* All-in Badge */}
        {player.isAllIn && !player.isFolded && (
          <span className="absolute -bottom-2 bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow border border-red-300">
            ALL-IN
          </span>
        )}

        {/* Folded Badge */}
        {player.isFolded && (
          <span className="absolute -bottom-2 bg-gray-800 text-gray-400 text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded border border-gray-700">
            FOLD
          </span>
        )}
      </div>

      {/* Player Name & Stack Card (Clean layout, NO OVERLAPPING) */}
      <div className="mt-1.5 flex flex-col items-center max-w-[85px] sm:max-w-[110px] z-10">
        <span
          className={`text-[10px] sm:text-xs truncate w-full text-center px-2 py-0.5 rounded-md font-bold transition-all ${
            player.isTurn
              ? 'bg-amber-400 text-gray-950 shadow-md ring-1 ring-amber-200'
              : isActuallySelf
              ? 'bg-black/70 text-emerald-400 border border-emerald-500/40'
              : 'bg-black/70 text-slate-200 border border-white/10'
          }`}
        >
          {player.name} {isActuallySelf && '(You)'}
        </span>
        <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/80 border border-white/10 shadow mt-0.5">
          <span className="text-[9px] text-amber-400 font-bold">$</span>
          <span className="text-[9px] sm:text-xs font-bold text-white tracking-wide">
            {player.stack.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Active Bet on Felt */}
      {player.roundBet > 0 && (
        <div className="mt-1 flex items-center gap-0.5 bg-amber-400 text-gray-950 font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow border border-amber-200 ring-1 ring-black/60 z-10">
          <span>${player.roundBet.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
