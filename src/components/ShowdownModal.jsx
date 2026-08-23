import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Check, X, Users } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AvatarIcon } from './AvatarIcon';

export default function ShowdownModal({ isOpen, onClose }) {
  const { gameState, awardPots } = useGame();
  const { pots = [], players = [] } = gameState || {};

  // Track selected winners per pot: { [potIndex]: Set([playerId, ...]) }
  const [selectedWinners, setSelectedWinners] = useState({});

  useEffect(() => {
    // Initialize with empty sets
    const initial = {};
    pots.forEach((_, idx) => {
      initial[idx] = new Set();
    });
    setSelectedWinners(initial);
  }, [pots.length, isOpen]);

  if (!isOpen) return null;

  const toggleWinner = (potIndex, playerId) => {
    setSelectedWinners(prev => {
      const nextSet = new Set(prev[potIndex] || []);
      if (nextSet.has(playerId)) {
        nextSet.delete(playerId);
      } else {
        nextSet.add(playerId);
      }
      return { ...prev, [potIndex]: nextSet };
    });
  };

  const handleConfirm = () => {
    // Validate that every pot with amount > 0 has at least 1 winner selected
    const potWinners = pots.map((pot, idx) => {
      const winnerIds = Array.from(selectedWinners[idx] || []);
      return { potIndex: idx, winnerIds };
    });

    const unassignedPots = potWinners.filter((pw, idx) => pots[idx].amount > 0 && pw.winnerIds.length === 0);
    if (unassignedPots.length > 0) {
      alert('Please select at least one winner for each pot before confirming.');
      return;
    }

    // Trigger victory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    awardPots(potWinners);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0e131d] border border-white/15 rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-black text-lg">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Award Pot Winners</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Tap the winner(s) of each pot. Select multiple players to split the pot equally.
        </p>

        {/* Pots Selection List */}
        <div className="overflow-y-auto my-3 space-y-3.5 pr-1">
          {pots.map((pot, potIdx) => {
            const winnersForThisPot = selectedWinners[potIdx] || new Set();
            const eligiblePlayers = players.filter(p => pot.eligiblePlayerIds.includes(p.id));
            const isSidePot = potIdx > 0;

            const splitShare = winnersForThisPot.size > 0 
              ? Math.floor(pot.amount / winnersForThisPot.size) 
              : 0;

            return (
              <div
                key={potIdx}
                className={`rounded-2xl p-3.5 sm:p-4 border flex flex-col gap-2.5 transition-all ${
                  isSidePot
                    ? 'bg-blue-950/20 border-blue-500/30'
                    : 'bg-black/40 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm sm:text-base">{pot.name}</span>
                      {isSidePot && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.2 rounded-md font-bold uppercase">
                          Side Pot
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      {winnersForThisPot.size === 0 ? (
                        <span className="text-amber-400 font-semibold">Select winner below</span>
                      ) : winnersForThisPot.size === 1 ? (
                        <span className="text-emerald-400 font-bold">1 Winner (${pot.amount.toLocaleString()})</span>
                      ) : (
                        <span className="text-amber-300 font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Split {winnersForThisPot.size} ways: ${splitShare.toLocaleString()} each
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xl font-black text-amber-400">
                    ${pot.amount.toLocaleString()}
                  </span>
                </div>

                {/* Eligible Player Cards (Highlighting Nickname) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {eligiblePlayers.map(player => {
                    const isSelected = winnersForThisPot.has(player.id);
                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => toggleWinner(potIdx, player.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-400/50 shadow-md scale-102'
                            : 'bg-black/50 border-white/10 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center p-1 shrink-0">
                          <AvatarIcon id={player.avatar || player.name?.slice(0, 2).toUpperCase()} className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`text-xs truncate ${isSelected ? 'font-black text-emerald-200' : 'font-bold text-white'}`}>
                            {player.name}
                          </span>
                          {isSelected ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Winner
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Select</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold transition-colors text-xs sm:text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-xs sm:text-sm shadow-xl active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            <span>Award Chips</span>
          </button>
        </div>

      </div>
    </div>
  );
}
