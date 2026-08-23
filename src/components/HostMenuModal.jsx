import React, { useState } from 'react';
import { Settings, PlusCircle, Edit3, UserX, Clock, Play, Pause, X, CreditCard } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function HostMenuModal({ isOpen, onClose, selectedPlayer = null }) {
  const { gameState, rebuy, editStack, kickPlayer, toggleBlindTimer, takeLoan, repayLoan } = useGame();
  const { players = [], isTimerRunning, blindTimerMinutes, startingStack = 1000 } = gameState || {};

  const [activeTab, setActiveTab] = useState('players');
  const [targetPlayerId, setTargetPlayerId] = useState(selectedPlayer?.id || players[0]?.id);
  const [rebuyAmount, setRebuyAmount] = useState(500);
  const [newStackAmount, setNewStackAmount] = useState(1000);

  if (!isOpen) return null;

  const targetPlayer = players.find(p => p.id === targetPlayerId) || players[0];

  const handleRebuy = () => {
    if (!targetPlayerId || rebuyAmount <= 0) return;
    rebuy(targetPlayerId, rebuyAmount);
  };

  const handleEditStack = () => {
    if (!targetPlayerId || newStackAmount < 0) return;
    editStack(targetPlayerId, newStackAmount);
  };

  const handleKick = (playerId, name) => {
    if (window.confirm(`Remove ${name} from the table?`)) {
      kickPlayer(playerId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111620] border border-white/15 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Host Controls</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-3 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              activeTab === 'players' ? 'bg-amber-400 text-gray-950 font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Chips & Stacks
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              activeTab === 'timer' ? 'bg-amber-400 text-gray-950 font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Blind Timer
          </button>
        </div>

        {/* Tab 1: Chips & Stacks */}
        {activeTab === 'players' && (
          <div className="overflow-y-auto space-y-3.5 pr-1 text-xs">
            
            {/* Select Target Player */}
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Select Player</label>
              <select
                value={targetPlayerId}
                onChange={(e) => setTargetPlayerId(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg p-2 font-medium text-white focus:outline-none focus:border-amber-400"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: ${p.stack.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Rebuy */}
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex flex-col gap-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> Add Chips / Rebuy
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={rebuyAmount}
                  onChange={(e) => setRebuyAmount(Number(e.target.value))}
                  className="flex-1 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  placeholder="Amount"
                />
                <button
                  onClick={handleRebuy}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Edit Exact Stack */}
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex flex-col gap-2">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5" /> Set Exact Stack Balance
              </span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newStackAmount}
                  onChange={(e) => setNewStackAmount(Number(e.target.value))}
                  className="flex-1 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-bold"
                  placeholder="New Stack"
                />
                <button
                  onClick={handleEditStack}
                  className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Loan Stack Controls */}
            <div className="bg-black/30 p-3 rounded-xl border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 flex items-center gap-1 text-xs">
                  <CreditCard className="w-3.5 h-3.5" /> Loan Stack & Debt
                </span>
                {targetPlayer?.loanAmount > 0 && (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                    Debt: ${targetPlayer.loanAmount.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => takeLoan(targetPlayerId, startingStack)}
                  className="flex-1 bg-blue-600/80 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Issue Loan (${startingStack})
                </button>
                {targetPlayer?.loanAmount > 0 && (
                  <button
                    onClick={() => repayLoan(targetPlayerId)}
                    className="bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Repay Debt
                  </button>
                )}
              </div>
            </div>

            {/* Table Roster */}
            <div className="bg-black/30 p-3 rounded-xl border border-white/10">
              <span className="font-bold text-slate-300 block mb-1.5">Table Roster</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {players.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg text-xs">
                    <span className="font-semibold text-slate-200">{p.name} (${p.stack.toLocaleString()})</span>
                    {p.id !== gameState.hostId && (
                      <button
                        onClick={() => handleKick(p.id, p.name)}
                        className="text-red-400 hover:text-red-300 p-1 bg-red-950/30 rounded hover:bg-red-900/50 cursor-pointer"
                        title="Remove Player"
                      >
                        <UserX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Blind Timer */}
        {activeTab === 'timer' && (
          <div className="space-y-3 my-3">
            <div className="bg-black/30 p-4 rounded-xl border border-white/10 text-center flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-amber-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Automatic Blind Increase</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interval: {blindTimerMinutes > 0 ? `${blindTimerMinutes} minutes` : 'Disabled'}
                </p>
              </div>

              {blindTimerMinutes > 0 && (
                <div className="flex gap-2 mt-2">
                  {isTimerRunning ? (
                    <button
                      onClick={() => toggleBlindTimer('pause')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleBlindTimer('start')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Start Timer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 mt-auto">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold transition-colors text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
