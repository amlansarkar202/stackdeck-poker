import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { XCircle, CheckCircle2, ArrowUpRight, X, CreditCard } from 'lucide-react';

export default function ActionControls() {
  const { gameState, user, sendAction, takeLoan } = useGame();
  const {
    players = [],
    currentTurnIndex,
    currentBet = 0,
    minRaise = 20,
    totalPot = 0,
    isHandActive = false,
    startingStack = 1000,
  } = gameState || {};

  const myPlayer = players.find(p => p.id === user.id);
  const isMyTurn = myPlayer && myPlayer.isTurn && isHandActive && !myPlayer.isFolded && !myPlayer.isAllIn && !myPlayer.isSittingOut;

  // Calculate needed call amount & stack math
  const playerRoundBet = myPlayer ? myPlayer.roundBet : 0;
  const playerStack = myPlayer ? myPlayer.stack : 0;
  const callNeeded = Math.max(0, currentBet - playerRoundBet);
  const canCheck = callNeeded === 0;
  const actualCallAmount = Math.min(playerStack, callNeeded);

  // Target Bet Bounds
  const minTargetBet = currentBet === 0 ? minRaise : currentBet + minRaise;
  const maxTargetBet = playerRoundBet + playerStack; // Maximum possible bet (all-in)
  const canRaise = playerStack > callNeeded && maxTargetBet > currentBet;

  // Raise mode state & input
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(minTargetBet);
  const [typedInput, setTypedInput] = useState(String(minTargetBet));
  const inputRef = useRef(null);

  // Reset when turn switches to user
  useEffect(() => {
    if (isMyTurn) {
      const initial = Math.min(minTargetBet, maxTargetBet);
      setRaiseAmount(initial);
      setTypedInput(String(initial));
      setIsRaiseOpen(false);
    }
  }, [isMyTurn, minTargetBet, maxTargetBet]);

  // Focus input when raise drawer is opened
  useEffect(() => {
    if (isRaiseOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRaiseOpen]);

  // Update raise amount cleanly
  const updateRaise = (val) => {
    const clamped = Math.max(minTargetBet, Math.min(Number(val) || 0, maxTargetBet));
    setRaiseAmount(clamped);
    setTypedInput(String(clamped));
  };

  const handleInputChange = (e) => {
    const raw = e.target.value;
    setTypedInput(raw);
    const parsed = Number(raw);
    if (!isNaN(parsed) && parsed > 0) {
      setRaiseAmount(Math.min(parsed, maxTargetBet));
    }
  };

  const handleInputBlur = () => {
    updateRaise(typedInput);
  };

  const handleConfirmRaise = () => {
    const finalAmount = Math.max(minTargetBet, Math.min(Number(typedInput) || raiseAmount, maxTargetBet));
    sendAction('raise', finalAmount);
    setIsRaiseOpen(false);
  };

  const handleDirectAllIn = () => {
    sendAction('raise', maxTargetBet);
    setIsRaiseOpen(false);
  };

  // Sitting Out with Loan Active
  if (myPlayer?.isSittingOut && myPlayer?.loanRoundsRemaining > 0) {
    return (
      <div className="w-full bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 p-3.5 text-center flex flex-col items-center gap-1">
        <span className="text-xs font-bold text-amber-300">
          Sitting Out (Loan Stack Active)
        </span>
        <span className="text-[11px] text-slate-400">
          You will automatically rejoin the table next hand with your ${myPlayer.stack.toLocaleString()} stack.
        </span>
      </div>
    );
  }

  // Zero Balance Loan Option
  if (myPlayer && myPlayer.stack === 0 && (!isHandActive || myPlayer.isFolded)) {
    return (
      <div className="w-full bg-[#0e131e]/95 backdrop-blur-md border-t border-white/15 p-3.5 sm:p-4 text-center flex flex-col items-center gap-1.5 animate-fade-in">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm">
          <CreditCard className="w-4 h-4" />
          <span>Out of Chips? Request a Loan Stack</span>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-md">
          Take an initial loan of <strong className="text-white">${startingStack.toLocaleString()}</strong>. You will sit out the next round, and automatically repay once your stack reaches <strong className="text-amber-300">${(startingStack * 2).toLocaleString()}</strong>.
        </p>
        <button
          type="button"
          onClick={() => takeLoan(myPlayer.id, startingStack)}
          className="mt-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>Take ${startingStack.toLocaleString()} Loan Stack</span>
        </button>
      </div>
    );
  }

  // Spectating / Waiting States
  if (!isHandActive) {
    return (
      <div className="w-full bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 p-3 text-center">
        <span className="text-xs font-semibold text-slate-400">
          Hand complete. Waiting for Host to deal next hand...
        </span>
      </div>
    );
  }

  if (!myPlayer || myPlayer.isFolded) {
    return (
      <div className="w-full bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 p-3 text-center">
        <span className="text-xs font-semibold text-slate-400">
          {myPlayer?.isFolded ? 'Folded • Spectating table' : 'Spectating table'}
        </span>
      </div>
    );
  }

  if (myPlayer.isAllIn) {
    return (
      <div className="w-full bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 p-3 text-center">
        <span className="text-xs font-bold text-amber-400 tracking-wide">
          ALL-IN (${myPlayer.roundBet}) • Waiting for showdown
        </span>
      </div>
    );
  }

  if (!isMyTurn) {
    const activePlayer = players[currentTurnIndex];
    return (
      <div className="w-full bg-[#0d1117]/95 backdrop-blur-md border-t border-white/10 p-3 text-center flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="text-xs font-medium text-slate-300">
          Waiting for <strong className="text-white">{activePlayer?.name || 'player'}</strong> to act...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#090c10]/95 backdrop-blur-xl border-t border-white/15 p-2.5 sm:p-4 shadow-2xl animate-fade-in relative">
      <div className="max-w-xl mx-auto flex flex-col gap-2">

        {/* MINIMALIST RAISE SELECTOR (Appears only on Raise click) */}
        {isRaiseOpen && canRaise && (
          <div className="bg-[#111620] p-3 rounded-2xl border border-blue-400/40 shadow-2xl flex flex-col gap-2.5 animate-slide-up mb-1">
            
            {/* Header with Title and Close X */}
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {currentBet === 0 ? 'Bet Amount' : 'Raise Amount'}
              </span>
              <button
                type="button"
                onClick={() => setIsRaiseOpen(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clean Preset Row: Min | -10 | +10 | Max */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => updateRaise(minTargetBet)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                Min (${minTargetBet})
              </button>
              <button
                type="button"
                onClick={() => updateRaise(raiseAmount - 10)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300 hover:text-blue-200 border border-white/10 font-bold transition-colors cursor-pointer"
                title="Decrease by $10"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => updateRaise(raiseAmount + 10)}
                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-300 hover:text-blue-200 border border-white/10 font-bold transition-colors cursor-pointer"
                title="Increase by $10"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => updateRaise(maxTargetBet)}
                className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-colors cursor-pointer"
              >
                Max (${maxTargetBet})
              </button>
            </div>

            {/* Direct Number Input */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-extrabold text-blue-400">$</span>
              <input
                ref={inputRef}
                type="number"
                min={minTargetBet}
                max={maxTargetBet}
                step="1"
                value={typedInput}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmRaise();
                }}
                className="w-full bg-black/70 border border-blue-400/50 focus:border-blue-400 rounded-xl py-2 pl-9 pr-4 text-2xl font-black text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
            </div>

            {/* Smooth Slider */}
            <div className="flex items-center gap-2 px-1">
              <input
                type="range"
                min={minTargetBet}
                max={maxTargetBet}
                step={Math.max(1, Math.floor(minRaise / 2))}
                value={raiseAmount}
                onChange={(e) => updateRaise(e.target.value)}
                className="flex-1 accent-blue-400 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
              />
            </div>

            {/* Confirm Raise Button */}
            <button
              type="button"
              onClick={handleConfirmRaise}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Confirm {currentBet === 0 ? 'Bet' : 'Raise'} to ${raiseAmount.toLocaleString()}</span>
            </button>

          </div>
        )}

        {/* PRIMARY ACTION BUTTONS: FOLD (Red) | CHECK/CALL (Green) | RAISE (Blue) | ALL-IN (Yellow-Orange) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          
          {/* 1. FOLD (Red) */}
          <button
            type="button"
            onClick={() => sendAction('fold')}
            className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1.5 rounded-xl bg-gradient-to-b from-red-800 to-red-950 border border-red-500/50 hover:border-red-400 text-red-100 font-bold shadow active:scale-98 transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-red-400 mb-0.5" />
            <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold">Fold</span>
          </button>

          {/* 2. CHECK / CALL (Green) */}
          {canCheck ? (
            <button
              type="button"
              onClick={() => sendAction('check')}
              className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1.5 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-750 border border-emerald-400/60 hover:border-emerald-300 text-white font-bold shadow active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200 mb-0.5" />
              <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold">Check</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => sendAction('call')}
              className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1.5 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-750 border border-emerald-400/60 hover:border-emerald-300 text-white font-bold shadow active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200 mb-0.5" />
              <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold">
                Call ${actualCallAmount.toLocaleString()}
              </span>
            </button>
          )}

          {/* 3. RAISE / BET (Blue) */}
          {canRaise ? (
            <button
              type="button"
              onClick={() => setIsRaiseOpen(!isRaiseOpen)}
              className={`flex flex-col items-center justify-center py-3 sm:py-3.5 px-1.5 rounded-xl font-extrabold shadow active:scale-98 transition-all cursor-pointer border ${
                isRaiseOpen
                  ? 'bg-blue-500 text-white border-white ring-2 ring-blue-300'
                  : 'bg-gradient-to-b from-blue-600 to-blue-750 hover:from-blue-500 hover:to-blue-600 text-white border-blue-400/60'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 mb-0.5 text-blue-200" />
              <span className="text-xs sm:text-sm uppercase tracking-wider">
                {currentBet === 0 ? 'Bet...' : 'Raise...'}
              </span>
            </button>
          ) : (
            <button
              disabled
              className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1.5 rounded-xl bg-gray-900 text-gray-600 font-bold text-xs border border-white/5 cursor-not-allowed opacity-40"
            >
              <ArrowUpRight className="w-4 h-4 mb-0.5 opacity-30" />
              <span className="text-xs uppercase tracking-wider">Raise</span>
            </button>
          )}

          {/* 4. ALL-IN (Yellow-Orange) */}
          <button
            type="button"
            onClick={handleDirectAllIn}
            className="flex flex-col items-center justify-center py-3 sm:py-3.5 px-1.5 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 border border-amber-300 text-gray-950 font-black shadow active:scale-98 transition-all cursor-pointer"
          >
            <span className="text-xs sm:text-sm uppercase tracking-wider font-black">
              All-In
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-900 opacity-90 leading-tight">
              ${maxTargetBet.toLocaleString()}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}
