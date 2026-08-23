import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useGame } from '../context/GameContext';
import { calculateSettlement, generateSettlementText } from '../utils/settlement';
import { Plus, Trash2, Copy, Check, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function Settlement() {
  const { gameState, currentTheme } = useGame();

  const [players, setPlayers] = useState(() => {
    if (gameState?.players?.length > 0) {
      return gameState.players.map(p => ({
        id: p.id,
        name: p.name,
        buyIn: p.totalBuyIn || 1000,
        cashOut: p.stack || 1000,
      }));
    }
    return [
      { id: '1', name: 'Alice', buyIn: 1000, cashOut: 1500 },
      { id: '2', name: 'Bob', buyIn: 1000, cashOut: 500 },
      { id: '3', name: 'Charlie', buyIn: 1000, cashOut: 1000 },
    ];
  });

  const [copied, setCopied] = useState(false);

  const handleAddPlayer = () => {
    setPlayers(prev => [
      ...prev,
      { id: `custom_${Date.now()}`, name: `Player ${prev.length + 1}`, buyIn: 1000, cashOut: 1000 },
    ]);
  };

  const handleRemovePlayer = (id) => {
    if (players.length <= 2) {
      alert('Must have at least 2 players to settle');
      return;
    }
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: field === 'name' ? value : Number(value) || 0 };
      }
      return p;
    }));
  };

  const handleImportFromGame = () => {
    if (!gameState?.players) {
      alert('No active game session found to import from.');
      return;
    }
    setPlayers(gameState.players.map(p => ({
      id: p.id,
      name: p.name,
      buyIn: p.totalBuyIn || 1000,
      cashOut: p.stack || 0,
    })));
  };

  const settlement = calculateSettlement(players);

  const handleCopy = () => {
    const text = generateSettlementText(settlement);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen ${currentTheme.pageBg} text-slate-100 flex flex-col transition-colors duration-500`}>
      <Navbar showBack={true} title="Cash Game Settlement" />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cash Game Settlement
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Input player buy-ins and final cash-outs to calculate the minimum number of peer-to-peer transfers.
          </p>

          {gameState?.players && (
            <button
              onClick={handleImportFromGame}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Import Stacks From Current Table</span>
            </button>
          )}
        </div>

        {/* Players Ledger Table */}
        <div className={`${currentTheme.cardBg} backdrop-blur-xl rounded-2xl p-5 border shadow-xl mb-6`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <h2 className="font-bold text-white text-base">Player Stacks Ledger</h2>
            <button
              onClick={handleAddPlayer}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs px-3 py-1.5 rounded-lg border border-white/15 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Player</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-white/10">
                  <th className="pb-2.5 px-2">Player</th>
                  <th className="pb-2.5 px-2">Total Buy-in ($)</th>
                  <th className="pb-2.5 px-2">Cash-out ($)</th>
                  <th className="pb-2.5 px-2">Net Profit/Loss</th>
                  <th className="pb-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {players.map((p) => {
                  const net = p.cashOut - p.buyIn;
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleUpdate(p.id, 'name', e.target.value)}
                          className="bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-white font-semibold text-xs sm:text-sm w-full max-w-[140px] focus:outline-none focus:border-amber-400"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={p.buyIn}
                          onChange={(e) => handleUpdate(p.id, 'buyIn', e.target.value)}
                          className="bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-white font-semibold text-xs sm:text-sm w-24 focus:outline-none focus:border-amber-400"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={p.cashOut}
                          onChange={(e) => handleUpdate(p.id, 'cashOut', e.target.value)}
                          className="bg-black/50 border border-white/15 rounded-lg px-2.5 py-1 text-white font-semibold text-xs sm:text-sm w-24 focus:outline-none focus:border-amber-400"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`font-bold text-xs px-2 py-0.5 rounded-md ${
                            net > 0
                              ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
                              : net < 0
                              ? 'text-red-300 bg-red-950/40 border border-red-500/30'
                              : 'text-slate-400 bg-white/5'
                          }`}
                        >
                          {net > 0 ? `+$${net.toLocaleString()}` : net < 0 ? `-$${Math.abs(net).toLocaleString()}` : '$0'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button
                          onClick={() => handleRemovePlayer(p.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove Player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Balance Verification Bar */}
          <div className="mt-5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex gap-5">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Buy-ins</span>
                <span className="text-white text-base font-bold">${settlement.totalBuyIn.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Cash-outs</span>
                <span className="text-white text-base font-bold">${settlement.totalCashOut.toLocaleString()}</span>
              </div>
            </div>

            <div>
              {settlement.isBalanced ? (
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs">
                  <Check className="w-3.5 h-3.5" />
                  <span>Ledger Balanced ($0 diff)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Discrepancy: ${settlement.diff > 0 ? `+${settlement.diff}` : settlement.diff}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Recommended Payments / Minimal Debt Settlement */}
        <div className={`${currentTheme.cardBg} backdrop-blur-xl rounded-2xl p-5 border shadow-xl`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div>
              <h2 className="font-bold text-white text-base">Recommended Settlement Transfers</h2>
              <p className="text-xs text-slate-400">
                Minimum transactions to resolve all player balances
              </p>
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 ${currentTheme.primaryBtn} font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow cursor-pointer`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            {settlement.transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                All players broke even. No payments required.
              </div>
            ) : (
              settlement.transactions.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-white/5 text-slate-300 font-bold text-xs flex items-center justify-center border border-white/10">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <span className="text-red-400 font-bold">{t.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-emerald-400 font-bold">{t.to}</span>
                    </div>
                  </div>
                  
                  <div className={`text-sm font-extrabold ${currentTheme.accentTextLight} bg-black/50 px-2.5 py-0.5 rounded-md border border-white/10`}>
                    ${t.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
