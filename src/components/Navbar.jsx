import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Calculator, ArrowLeft, Palette } from 'lucide-react';
import { useGame } from '../context/GameContext';
import ThemeSelectorModal from './ThemeSelectorModal';

export default function Navbar({ showBack = false, title = null }) {
  const { soundEnabled, toggleSound, currentTheme, gameState } = useGame();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isTable = location.pathname.startsWith('/room');

  const handleBack = () => {
    if (gameState?.roomId) {
      navigate(`/room/${gameState.roomId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <nav className="w-full bg-[#090c10]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand / Back */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <Link to="/" className="flex items-center gap-2">
                <span className="text-xl">♠️</span>
                <span className="font-extrabold text-base tracking-tight text-white">
                  Stack<span className={currentTheme.accentText}>Deck</span>
                </span>
              </Link>
            )}

            {title && (
              <span className="hidden sm:inline-block text-xs text-slate-400 border-l border-white/15 pl-3 font-medium">
                {title}
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            
            {/* Cash Game Settlement Calculator Link */}
            {!isTable && (
              <Link
                to="/settlement"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>Settlement</span>
              </Link>
            )}

            {/* Theme Selector Button */}
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Change Table Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className={`w-4 h-4 ${currentTheme.accentText}`} /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
    </>
  );
}
