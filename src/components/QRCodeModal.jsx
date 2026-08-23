import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Copy, Check, X, Smartphone } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function QRCodeModal({ isOpen, onClose, roomId }) {
  const { networkInfo } = useGame();
  const [copied, setCopied] = useState(false);

  // Live Invite & QR Join URL (Always uses the exact current domain)
  const joinUrl = `${window.location.origin}/join?code=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111620] border border-white/15 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Join With Smartphone</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Code Badge */}
        <div className="my-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Room Code</span>
          <div className="text-2xl font-extrabold tracking-widest text-amber-300 px-4 py-1 rounded-xl bg-black/60 border border-amber-500/30 inline-block">
            {roomId}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3.5 rounded-xl shadow-lg border-2 border-amber-400/40 mb-3">
          <QRCodeSVG
            value={joinUrl}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
        </div>

        <p className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5 mb-3">
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Scan with camera on local Wi-Fi to join</span>
        </p>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs border border-white/15 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>Copy Invite Link</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
