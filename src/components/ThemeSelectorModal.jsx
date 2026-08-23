import React from 'react';
import { Palette, Check, X } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function ThemeSelectorModal({ isOpen, onClose }) {
  const { tableTheme, setTableTheme } = useGame();

  if (!isOpen) return null;

  const themes = [
    {
      id: 'cyberpunk',
      name: 'Executive Noir',
      desc: 'Matte obsidian felt with champagne gold & brushed aluminum accents',
      badge: 'Obsidian & Gold',
      bgClass: 'from-[#151a23] to-[#0d1117] border-amber-500/30 text-amber-300',
    },
    {
      id: 'emerald',
      name: 'Monaco Emerald',
      desc: 'Deep classic European casino felt with mahogany leather rail',
      badge: 'Classic Green',
      bgClass: 'from-[#103822] to-[#0b2517] border-emerald-500/40 text-emerald-300',
    },
    {
      id: 'sapphire',
      name: 'High Roller Navy',
      desc: 'Royal midnight navy felt with brushed platinum trim',
      badge: 'Midnight Navy',
      bgClass: 'from-[#132238] to-[#0c1524] border-blue-500/40 text-blue-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111620] border border-white/15 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Select Table Felt Theme</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Options */}
        <div className="space-y-2.5 my-4">
          {themes.map((t) => {
            const isSelected = tableTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTableTheme(t.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between bg-gradient-to-r ${t.bgClass} ${
                  isSelected
                    ? 'ring-2 ring-white/60 scale-101 shadow-lg'
                    : 'opacity-85 hover:opacity-100 hover:scale-101'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{t.name}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/50 border border-white/10 text-slate-300">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{t.desc}</p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold transition-colors text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
