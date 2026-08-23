export const AVATAR_PRESETS = [
  { id: 'tiger', icon: '🐅', name: 'Bengal Tiger', tag: 'Predator', color: 'from-amber-500 to-orange-600' },
  { id: 'lion', icon: '🦁', name: 'Golden Lion', tag: 'Apex', color: 'from-yellow-500 to-amber-600' },
  { id: 'dragon', icon: '🐉', name: 'Mythic Dragon', tag: 'Immortal', color: 'from-emerald-500 to-teal-600' },
  { id: 'phoenix', icon: '🔥', name: 'Solar Phoenix', tag: 'Reborn', color: 'from-red-500 to-orange-600' },
  { id: 'eagle', icon: '🦅', name: 'War Eagle', tag: 'Sky Lord', color: 'from-blue-500 to-indigo-600' },
  { id: 'wolf', icon: '🐺', name: 'Shadow Wolf', tag: 'Alpha', color: 'from-slate-400 to-slate-600' },
  { id: 'shark', icon: '🦈', name: 'Megalodon', tag: 'Deep Sea', color: 'from-cyan-500 to-blue-700' },
  { id: 'bull', icon: '🐂', name: 'Raging Bull', tag: 'Bruiser', color: 'from-stone-600 to-red-700' },
  { id: 'cobra', icon: '🐍', name: 'King Cobra', tag: 'Venom', color: 'from-emerald-600 to-green-800' },
  { id: 'gorilla', icon: '🦍', name: 'Silverback', tag: 'Titan', color: 'from-gray-700 to-zinc-900' },
  { id: 'reaper', icon: '💀', name: 'Grim Reaper', tag: 'Phantom', color: 'from-purple-900 to-black' },
  { id: 'viking', icon: '⚔️', name: 'Warlord', tag: 'Viking', color: 'from-amber-600 to-stone-800' },
  { id: 'rhino', icon: '🦏', name: 'Iron Rhino', tag: 'Juggernaut', color: 'from-slate-600 to-slate-800' },
  { id: 'falcon', icon: '🪶', name: 'Night Hawk', tag: 'Stealth', color: 'from-sky-400 to-indigo-700' },
  { id: 'scorpion', icon: '🦂', name: 'Deathstalker', tag: 'Stinger', color: 'from-yellow-600 to-amber-900' },
  { id: 'panther', icon: '🐆', name: 'Black Panther', tag: 'Ghost', color: 'from-zinc-800 to-neutral-950' },
];

export function getRandomAvatar() {
  const item = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
  return item.icon;
}
