import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useGame } from '../context/GameContext';
import { LogIn } from 'lucide-react';

export default function JoinGame() {
  const { user, updateUserProfile, joinRoom, currentTheme } = useGame();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState(searchParams.get('code')?.toUpperCase() || '');
  const [name, setName] = useState(user.name || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setErrorMsg('Please enter a 4-letter Room Code');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Please enter your nickname');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    updateUserProfile(cleanName);

    try {
      const roomId = await joinRoom(cleanCode, null, cleanName);
      navigate(`/room/${roomId}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to join room. Please check the room code.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${currentTheme.pageBg} text-slate-100 flex flex-col transition-colors duration-500`}>
      <Navbar showBack={true} title="Join Room" />

      <main className="flex-1 max-w-lg mx-auto px-4 py-8 w-full flex flex-col justify-center">
        <div className={`${currentTheme.cardBg} backdrop-blur-xl rounded-2xl p-5 sm:p-7 border shadow-2xl`}>
          
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Join Poker Room</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter room code and your nickname to take a seat.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Room Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABCD"
                className={`w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-2xl font-extrabold text-center ${currentTheme.accentTextLight} tracking-widest uppercase focus:outline-none focus:border-emerald-400 transition-colors`}
                required
              />
            </div>

            {/* Nickname */}
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
              <p className="text-[10px] text-slate-400 mt-1">
                Entering your existing nickname automatically restores your seat if disconnected.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 ${currentTheme.primaryBtn} font-bold py-3.5 rounded-xl text-sm shadow-xl hover:scale-101 active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer`}
            >
              {loading ? (
                <span>Entering Room...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Enter Table</span>
                </>
              )}
            </button>

          </form>

        </div>
      </main>
    </div>
  );
}
