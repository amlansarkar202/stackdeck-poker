import React from 'react';

// Custom Bespoke Vector SVG Crests for Casino & Gaming Avatars
export const AVATAR_CRESTS = [
  {
    id: 'tiger',
    name: 'Apex Tiger',
    tag: 'Predator',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-400/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-400">
        <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 9l5-4 5 4-2 4-3-1-3 1-2-4z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="9" cy="12" r="1" fill="#fff" />
        <circle cx="15" cy="12" r="1" fill="#fff" />
        <path d="M10 16l2 2 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'dragon',
    name: 'Imperial Dragon',
    tag: 'Mythic',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-400">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6c-3 1-5 4-3 7 1.5 2.2 4.5 2 4.5 4s-1.5 2-1.5 2 4-1 4-4c0-2.5-3-3-3-5 0-1.5 1-2.5 3-3-1-1-3-1-4-1z" fill="currentColor" />
        <circle cx="13" cy="9" r="1" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'phoenix',
    name: 'Solar Phoenix',
    tag: 'Reborn',
    color: 'from-red-500 to-orange-600',
    border: 'border-red-400/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-orange-400">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 4c1.5 3 4 5 7 5-3 1.5-4 4-4 7 0-3-2-4.5-3-5-1 0.5-3 2-3 5 0-3-1-5.5-4-7 3 0 5.5-2 7-5z" fill="currentColor" />
        <circle cx="12" cy="11" r="1.5" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'eagle',
    name: 'War Eagle',
    tag: 'Sky Lord',
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-400/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-400">
        <path d="M12 3L2 8l3 11 7 3 7-3 3-11-10-5z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6l-5 4 2 6 3-2 3 2 2-6-5-4z" fill="currentColor" />
        <path d="M10 11l2 2 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'wolf',
    name: 'Shadow Wolf',
    tag: 'Alpha',
    color: 'from-slate-400 to-slate-600',
    border: 'border-slate-300/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-slate-200">
        <path d="M12 2L5 8v8l7 5 7-5V8l-7-6z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8l4 3 4-3-1 6-3 3-3-3-1-6z" fill="currentColor" />
        <circle cx="10" cy="11" r="1" fill="#000" />
        <circle cx="14" cy="11" r="1" fill="#000" />
      </svg>
    ),
  },
  {
    id: 'lion',
    name: 'Golden Lion',
    tag: 'Sovereign',
    color: 'from-yellow-400 to-amber-600',
    border: 'border-yellow-400/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-yellow-400">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 5l2 3h3l-2 3 2 4-4-1-1 3-1-3-4 1 2-4-2-3h3l2-3z" fill="currentColor" />
        <circle cx="10" cy="12" r="1" fill="#000" />
        <circle cx="14" cy="12" r="1" fill="#000" />
      </svg>
    ),
  },
  {
    id: 'shark',
    name: 'Megalodon',
    tag: 'Abyss',
    color: 'from-cyan-500 to-blue-700',
    border: 'border-cyan-400/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-cyan-400">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6c0 3 2 5 5 6-3 0-5 2-6 5 0-3-2-5-5-6 3 0 5-2 6-5z" fill="currentColor" />
        <circle cx="14" cy="10" r="1" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'bull',
    name: 'Raging Bull',
    tag: 'Titan',
    color: 'from-red-600 to-zinc-800',
    border: 'border-red-500/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-red-400">
        <path d="M4 6c3-1 5 1 5 3 0 3 2 6 3 6s3-3 3-6c0-2 2-4 5-3-1 4-4 6-5 7v3l-3 2-3-2v-3C8 12 5 10 4 6z" fill="currentColor" />
        <circle cx="10" cy="12" r="1" fill="#fff" />
        <circle cx="14" cy="12" r="1" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'cobra',
    name: 'King Cobra',
    tag: 'Venom',
    color: 'from-emerald-600 to-green-900',
    border: 'border-emerald-500/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-400">
        <path d="M12 2C7 2 5 6 5 9c0 3 2 5 4 6v4l3 2 3-2v-4c2-1 4-3 4-6 0-3-2-7-7-7z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 5c-2 0-3 2-3 4s2 3 3 3 3-1 3-3-1-4-3-4z" fill="currentColor" />
        <circle cx="10.5" cy="8" r="0.8" fill="#fff" />
        <circle cx="13.5" cy="8" r="0.8" fill="#fff" />
      </svg>
    ),
  },
  {
    id: 'reaper',
    name: 'Cyber Reaper',
    tag: 'Phantom',
    color: 'from-purple-900 to-black',
    border: 'border-purple-500/50',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-purple-400">
        <path d="M12 2a9 9 0 00-9 9c0 5 4 8 5 10h8c1-2 5-5 5-10a9 9 0 00-9-9z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 5c-3 0-5 3-5 6 0 4 3 6 5 6s5-2 5-6c0-3-2-6-5-6z" fill="currentColor" />
        <circle cx="10" cy="10" r="1.2" fill="#000" />
        <circle cx="14" cy="10" r="1.2" fill="#000" />
      </svg>
    ),
  },
  {
    id: 'crown',
    name: 'High Roller',
    tag: 'Royal',
    color: 'from-amber-400 to-yellow-600',
    border: 'border-amber-300/60',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-300">
        <path d="M3 18h18l-2-10-4 4-3-6-3 6-4-4L3 18z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="3" cy="7" r="1.5" fill="currentColor" />
        <circle cx="8.5" cy="6" r="1.5" fill="currentColor" />
        <circle cx="12" cy="5" r="1.5" fill="currentColor" />
        <circle cx="15.5" cy="6" r="1.5" fill="currentColor" />
        <circle cx="21" cy="7" r="1.5" fill="currentColor" />
        <line x1="4" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'ace',
    name: 'Ace of Spades',
    tag: 'Legend',
    color: 'from-slate-700 to-slate-900',
    border: 'border-amber-400/40',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-400">
        <path d="M12 2C10 5 5 10 5 14a7 7 0 0011.8 5l-1.8 3h-6l-1.8-3A7 7 0 0019 14c0-4-5-9-7-12z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="13" r="2" fill="#000" />
      </svg>
    ),
  },
];

export function AvatarIcon({ id, className = "w-6 h-6" }) {
  const match = AVATAR_CRESTS.find(c => c.id === id || c.name === id);
  if (match) {
    return <div className={`flex items-center justify-center ${className}`}>{match.svg}</div>;
  }
  // Fallback: If passed emoji or initials
  return <span className="text-sm sm:text-base font-bold leading-none">{id || '♠'}</span>;
}

export function getRandomAvatarId() {
  return AVATAR_CRESTS[Math.floor(Math.random() * AVATAR_CRESTS.length)].id;
}
