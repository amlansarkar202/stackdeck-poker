import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useGame } from '../context/GameContext';
import { AVATAR_CRESTS } from '../components/AvatarIcon';
import { LogIn } from 'lucide-react';

export default function JoinGame() {
  const { user, updateUserProfile, joinRoom, currentTheme } = useGame();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [code, setCode] = useState(searchParams.get('code')?.toUpperCase() || '');
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || 'dragon');
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, [searchParams]);

  // Fetch room players & taken avatars
  useEffect(() => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length >= 3) {
      fetch(`/api/room/${cleanCode}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.players) {
            setRoomPlayers(data.players);
          } else {
            setRoomPlayers([]);
          }
        })
        .catch(() => setRoomPlayers([]));
    } else {
      setRoomPlayers([]);
    }
  }, [code]);

  // Auto-switch avatar if current default is already taken in this room
  useEffect(() => {
    if (roomPlayers.length > 0) {
      const cleanName = name.trim().toLowerCase();
      const takenSet = new Set(
        roomPlayers
          .filter(p => !cleanName || p.name.trim().toLowerCase() !== cleanName)
          .map(p => p.avatar)
      );

      if (takenSet.has(avatar)) {
        const firstAvailable = AVATAR_CRESTS.find(c => !takenSet.has(c.id));
        if (firstAvailable) setAvatar(firstAvailable.id);
      }
    }
  }, [roomPlayers, name]);

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

    updateUserProfile(cleanName, avatar);

    try {
      const roomId = await joinRoom(cleanCode, null, cleanName, avatar);
      navigate(`/room/${roomId}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to join room. Please check the room code.');
      setLoading(false);
    }
  };

  const selectedCrest = AVATAR_CRESTS.find(c => c.id === avatar) || AVATAR_CRESTS[0];

  return (
    <div className={`min-h-screen ${currentTheme.pageBg} text-slate-100 flex flex-col transition-colors duration-500`}>
      <Navbar showBack={true} title="Join Room" />

      <main className="flex-1 max-w-lg mx-auto px-4 py-8 w-full flex flex-col justify-center">
        <div className={`${currentTheme.cardBg} backdrop-blur-xl rounded-2xl p-5 sm:p-7 border shadow-2xl`}>
          
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Join Poker Room</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter room code, nickname, and choose your crest.
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
                className={`w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-2xl font-extrabold text-center ${currentTheme.accentTextLight} tracking-widest uppercase focus:outline-none focus:border-amber-400 transition-colors`}
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
                className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2 text-white font-medium focus:outline-none focus:border-amber-400 text-sm transition-colors"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Entering your existing nickname automatically restores your seat if disconnected.
              </p>
            </div>

            {/* Vector Insignia / Crest Picker (Taken Avatars Darkened Out) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Player Crest
                </label>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <span>{selectedCrest.name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-semibold">{selectedCrest.tag}</span>
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-black/50 p-2.5 rounded-xl border border-white/10">
                {AVATAR_CRESTS.map((crest) => {
                  const isSelected = avatar === crest.id;
                  const existingOwner = roomPlayers.find(p => p.avatar === crest.id);
                  const isMyOwnCrest = existingOwner && name.trim() && existingOwner.name.trim().toLowerCase() === name.trim().toLowerCase();
                  const isTaken = !!existingOwner && !isMyOwnCrest;

                  return (
                    <button
                      type="button"
                      key={crest.id}
                      disabled={isTaken}
                      onClick={isTaken ? undefined : () => setAvatar(crest.id)}
                      className={`relative p-2 rounded-xl border transition-all flex flex-col items-center justify-center ${
                        isTaken
                          ? 'bg-black/90 border-white/5 opacity-25 grayscale cursor-not-allowed'
                          : isSelected
                          ? `bg-black/80 ${crest.border} ring-2 ring-amber-400/80 scale-105 shadow-lg cursor-pointer`
                          : 'bg-black/30 border-white/10 hover:border-white/20 hover:scale-102 opacity-75 hover:opacity-100 cursor-pointer'
                      }`}
                      title={isTaken ? `${crest.name} (Taken by ${existingOwner.name})` : `${crest.name} (${crest.tag})`}
                    >
                      {isTaken && (
                        <span className="absolute -top-1 -right-1 bg-red-950 text-red-400 text-[7px] font-bold px-1 rounded border border-red-500/30">
                          Taken
                        </span>
                      )}
                      <div className="w-8 h-8 flex items-center justify-center">
                        {crest.svg}
                      </div>
                      <span className="text-[9px] font-semibold text-slate-300 truncate w-full text-center mt-1">
                        {crest.name.split(' ')[1] || crest.name}
                      </span>
                    </button>
                  );
                })}
              </div>
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
