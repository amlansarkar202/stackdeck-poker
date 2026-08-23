import React from 'react';
import { History, RotateCcw, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function ActivityLogModal({ isOpen, onClose, isHost }) {
  const { gameState, undoAction } = useGame();
  const { actionLog = [], canUndo = false } = gameState || {};

  if (!isOpen) return null;

  const handleUndo = () => {
    if (window.confirm('Undo the last action?')) {
      undoAction();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111620] border border-white/15 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
            <History className="w-4 h-4 text-amber-400" />
            <span>Table Activity Log</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Log Entries List */}
        <div className="overflow-y-auto my-3 space-y-1.5 pr-1 max-h-[50vh] font-mono text-xs">
          {actionLog.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-sans">
              No actions logged yet in this hand.
            </div>
          ) : (
            actionLog.slice().reverse().map((log, idx) => (
              <div
                key={idx}
                className="bg-black/30 p-2 rounded-lg border border-white/5 text-slate-300"
              >
                {log}
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex gap-2.5 mt-auto">
          {isHost && (
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                canUndo
                  ? 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-md cursor-pointer'
                  : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-40'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Action</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold transition-colors text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
