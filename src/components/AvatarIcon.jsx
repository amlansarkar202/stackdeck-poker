import React from 'react';

// Tasteful Casino Palette for Player Initials
const AVATAR_PALETTES = [
  { bg: 'from-emerald-700 to-emerald-900', border: 'border-emerald-500/40', text: 'text-emerald-200' },
  { bg: 'from-blue-700 to-blue-900', border: 'border-blue-500/40', text: 'text-blue-200' },
  { bg: 'from-amber-700 to-amber-900', border: 'border-amber-500/40', text: 'text-amber-200' },
  { bg: 'from-indigo-700 to-indigo-900', border: 'border-indigo-500/40', text: 'text-indigo-200' },
  { bg: 'from-teal-700 to-teal-900', border: 'border-teal-500/40', text: 'text-teal-200' },
  { bg: 'from-purple-700 to-purple-900', border: 'border-purple-500/40', text: 'text-purple-200' },
  { bg: 'from-rose-700 to-rose-900', border: 'border-rose-500/40', text: 'text-rose-200' },
  { bg: 'from-slate-700 to-slate-900', border: 'border-slate-500/40', text: 'text-slate-200' },
];

function getPaletteForName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function getInitials(name = '') {
  if (!name) return 'P';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export function AvatarIcon({ id, name, className = "w-full h-full" }) {
  const displayName = name || id || 'Player';
  const initials = getInitials(displayName);
  const palette = getPaletteForName(displayName);

  return (
    <div
      className={`w-full h-full rounded-full bg-gradient-to-br ${palette.bg} flex items-center justify-center font-black ${palette.text} select-none leading-none shadow-inner ${className}`}
    >
      <span className="text-[11px] sm:text-xs tracking-wider">{initials}</span>
    </div>
  );
}

export const AVATAR_CRESTS = [];
export function getRandomAvatarId() {
  return '';
}
