import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Navbar from '../components/Navbar';
import LobbyView from '../components/LobbyView';
import TableFelt from '../components/TableFelt';
import ActionControls from '../components/ActionControls';
import ShowdownModal from '../components/ShowdownModal';
import HostMenuModal from '../components/HostMenuModal';
import ActivityLogModal from '../components/ActivityLogModal';
import QRCodeModal from '../components/QRCodeModal';
import ThemeSelectorModal from '../components/ThemeSelectorModal';
import { QrCode, History, Settings, Play, Palette, Volume2, VolumeX, CheckCircle } from 'lucide-react';

export default function Table() {
  const { id: routeRoomId } = useParams();
  const navigate = useNavigate();
  const { gameState, user, connected, startHand, joinRoom, soundEnabled, toggleSound, reconnectAlert, currentTheme } = useGame();

  const [showQR, setShowQR] = useState(false);
  const [showHostMenu, setShowHostMenu] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showShowdown, setShowShowdown] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const roomId = gameState?.roomId || routeRoomId?.toUpperCase();
  const isHost = gameState?.hostId === user.id;

  // Auto-open Showdown modal for host when street hits SHOWDOWN
  useEffect(() => {
    if (gameState?.currentStreet === 'SHOWDOWN' && isHost) {
      setShowShowdown(true);
    }
  }, [gameState?.currentStreet, isHost]);

  // Auto-join if user refreshed or navigated directly
  useEffect(() => {
    if (connected && routeRoomId && (!gameState || gameState.roomId !== routeRoomId.toUpperCase())) {
      joinRoom(routeRoomId.toUpperCase(), 1000).catch(() => {
        // if join fails, redirect to join screen
        navigate(`/join?code=${routeRoomId}`);
      });
    }
  }, [connected, routeRoomId, gameState?.roomId]);

  if (!gameState) {
    return (
      <div className={`min-h-screen ${currentTheme.pageBg} flex flex-col items-center justify-center p-4`}>
        <div className="text-3xl mb-2 animate-bounce">♠️</div>
        <h2 className="text-lg font-bold text-white mb-1">Connecting to Table {routeRoomId}...</h2>
        <p className="text-xs text-slate-400">Loading game state</p>
      </div>
    );
  }

  const handlePlayerClick = (player) => {
    if (isHost) {
      setSelectedPlayer(player);
      setShowHostMenu(true);
    }
  };

  const isLobby = gameState.status === 'LOBBY';

  return (
    <div className={`min-h-screen ${currentTheme.pageBg} flex flex-col justify-between overflow-x-hidden transition-colors duration-500`}>
      
      {/* Reconnection Alert Banner */}
      {reconnectAlert && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-3 text-center flex items-center justify-center gap-1.5 shadow-md animate-fade-in z-50">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{reconnectAlert}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="w-full bg-[#090c10]/95 backdrop-blur-md border-b border-white/10 px-2 sm:px-6 py-2 flex items-center justify-between z-30">
        
        {/* Left: Brand + Room Code */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link to="/" className="text-base sm:text-lg">♠️</Link>
          
          {/* Room Code Badge */}
          <button
            onClick={() => setShowQR(true)}
            className={`flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/15 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-extrabold ${currentTheme.accentTextLight} transition-all cursor-pointer`}
            title="View Join QR Code & Link"
          >
            <QrCode className="w-3 h-3" />
            <span>{roomId}</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          
          {/* Theme Switcher Button */}
          <button
            onClick={() => setShowThemeModal(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Change Theme"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className={`w-3.5 h-3.5 ${currentTheme.accentText}`} /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Activity Log Button */}
          {!isLobby && (
            <button
              onClick={() => setShowLog(true)}
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Activity Log"
            >
              <History className={`w-3.5 h-3.5 ${currentTheme.accentText}`} />
              <span className="hidden xs:inline">Log</span>
            </button>
          )}

          {/* Host Controls Button */}
          {isHost && !isLobby && (
            <button
              onClick={() => {
                setSelectedPlayer(null);
                setShowHostMenu(true);
              }}
              className={`flex items-center gap-1 ${currentTheme.accentBg} ${currentTheme.accentBorder} ${currentTheme.accentTextLight} px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Host</span>
            </button>
          )}

        </div>

      </header>

      {/* Main Content Area */}
      {isLobby ? (
        /* PHASE 1: PRE-GAME LOBBY & SEATING ARRANGEMENT */
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full">
          <LobbyView />
        </main>
      ) : (
        /* PHASE 2: ACTIVE LIVE POKER FELT TABLE */
        <>
          <main className="flex-1 flex flex-col items-center justify-center p-1 sm:p-4 w-full">
            <TableFelt
              gameState={gameState}
              currentUserId={user.id}
              onPlayerClick={handlePlayerClick}
              onStartHand={startHand}
              onShowdownClick={() => setShowShowdown(true)}
              isHost={isHost}
            />
          </main>

          {/* Bottom Action Deck */}
          <footer className="w-full sticky bottom-0 z-30">
            <ActionControls />
          </footer>
        </>
      )}

      {/* Modals */}
      <ShowdownModal
        isOpen={showShowdown}
        onClose={() => setShowShowdown(false)}
      />

      <HostMenuModal
        isOpen={showHostMenu}
        onClose={() => setShowHostMenu(false)}
        selectedPlayer={selectedPlayer}
      />

      <ActivityLogModal
        isOpen={showLog}
        onClose={() => setShowLog(false)}
        isHost={isHost}
      />

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        roomId={roomId}
      />

      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

    </div>
  );
}
