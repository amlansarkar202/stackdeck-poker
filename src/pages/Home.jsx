import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useGame } from '../context/GameContext';
import { Calculator, ArrowRight, Play, Users, Smartphone, Zap, Shield, RotateCcw, Sparkles } from 'lucide-react';

export default function Home() {
  const { currentTheme } = useGame();

  const features = [
    {
      title: 'Physical Deck, Digital Chips',
      desc: 'Deal real cards on the table. Use smartphones as instantaneous chip stacks and betting controllers.',
    },
    {
      title: 'Zero Latency WebSockets',
      desc: 'Action bets, calls, checks, raises, and side pot calculations synchronize with sub-second response times.',
    },
    {
      title: 'Authoritative Poker Engine',
      desc: 'Automatic dealer rotation, blind posting, multi-way side pots, all-in thresholds, and street progression.',
    },
    {
      title: 'Instant Seat Reconnect',
      desc: 'Accidentally closed your tab? Rejoining with your room code and nickname instantly restores your exact seat.',
    },
    {
      title: 'One-Click Action Undo',
      desc: 'Made an accidental fold or misclick? The host can instantly rewind the state history by 1 action.',
    },
    {
      title: 'Cash Game Settlement',
      desc: 'Automatically computes the minimum number of peer-to-peer transfers to settle cash game debts at session end.',
    },
  ];

  return (
    <div className={`min-h-screen ${currentTheme.pageBg} text-slate-100 flex flex-col transition-colors duration-500`}>
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-24 w-full flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 mb-6">
            <span className={`w-2 h-2 rounded-full ${currentTheme.accentBg} ${currentTheme.accentText}`} />
            <span>Digital Poker Chips Manager</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            Digital Poker Chips for Home Games
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
            Eliminate bulky chip sets. Use your smartphone to manage stacks, bets, side pots, and settlements with real cards.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-sm">
            <Link
              to="/create"
              className={`w-full sm:w-auto flex-1 ${currentTheme.primaryBtn} font-bold py-3.5 px-6 rounded-xl shadow-lg text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-99 cursor-pointer`}
            >
              <span>Create Table</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="/join"
              className="w-full sm:w-auto flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3.5 px-6 rounded-xl border border-white/15 text-sm sm:text-base flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-99 cursor-pointer"
            >
              <span>Join Room</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, idx) => (
              <div
                key={idx}
                className={`${currentTheme.cardBg} backdrop-blur-md rounded-2xl p-5 border hover:border-white/20 transition-all flex flex-col justify-between`}
              >
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement Link Card */}
        <div className="mt-12 w-full max-w-2xl">
          <div className={`${currentTheme.cardBg} backdrop-blur-md rounded-2xl p-6 border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Cash Game Settlement Calculator
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Calculate the optimal minimum payments to settle all player buy-ins and cash-outs.
              </p>
            </div>
            <Link
              to="/settlement"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-slate-100 font-semibold py-2.5 px-4 rounded-xl text-xs border border-white/15 transition-all whitespace-nowrap cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Launch Calculator</span>
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>StackDeck — Digital Poker Chips & Table Engine</p>
      </footer>
    </div>
  );
}
