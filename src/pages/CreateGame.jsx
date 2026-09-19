import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useGame } from '../context/GameContext';
import { Play } from 'lucide-react';

export default function CreateGame() {
  const { user, updateUserProfile, createRoom, currentTheme } = useGame();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name || '');
  const [smallBlind, setSmallBlind] = useState(10);
  const [bigBlind, setBigBlind] = useState(20);
  const [startingStack, setStartingStack] = useState(1000);
  const [ante, setAnte] = useState(0);
  const [blindTimer, setBlindTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Please enter your nickname');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    updateUserProfile(cleanName);

    try {
      const roomId = await createRoom({
        smallBlind: Number(smallBlind),
        bigBlind: Number(bigBlind),
        startingStack: Number(startingStack),
        ante: Number(ante),
        blindTimerMinutes: Number(blindTimer),
        roomName: `${cleanName}'s Game`,
      }, { name: cleanName });

      navigate(`/room/${roomId}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create room');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${currentTheme.pageBg} text-slate-100 flex flex-col transition-colors duration-500`}>
      <Navbar showBack={true} title="Create Table" />

      <main className="flex-1 max-w-lg mx-auto px-4 py-8 w-full flex flex-col justify-center">
        <div className={`${currentTheme.cardBg} backdrop-blur-xl rounded-2xl p-5 sm:p-7 border shadow-2xl`}>
          
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Configure New Table</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Set your table rules, blinds, and starting chips.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Host Nickname */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Nickname
              </label>
              <input
                type="text"
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maverick"
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-400 text-sm transition-colors"
                required
              />
            </div>

            {/* Blinds Configuration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Small Blind ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={smallBlind}
                  onChange={(e) => {
                    const sb = Number(e.target.value);
                    setSmallBlind(sb);
                    setBigBlind(sb * 2);
                  }}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-semibold text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Big Blind ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={bigBlind}
                  onChange={(e) => setBigBlind(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-semibold text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Starting Stack & Ante */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Starting Stack ($)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={startingStack}
                  onChange={(e) => setStartingStack(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-semibold text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ante ($ / Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={ante}
                  onChange={(e) => setAnte(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-semibold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Blind Timer */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Automatic Blind Increase Timer
              </label>
              <select
                value={blindTimer}
                onChange={(e) => setBlindTimer(Number(e.target.value))}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-slate-200 font-medium text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              >
                <option value={0}>Disabled (Constant Blinds)</option>
                <option value={5}>Every 5 minutes (Turbo)</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes (Standard)</option>
                <option value={20}>Every 20 minutes (Deep Stack)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 ${currentTheme.primaryBtn} font-bold py-3.5 rounded-xl text-sm shadow-xl hover:scale-101 active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer`}
            >
              {loading ? (
                <span>Launching...</span>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Create Table</span>
                </>
              )}
            </button>

          </form>

        </div>
      </main>
    </div>
  );
}
