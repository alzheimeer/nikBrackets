// packages/bracket-engine/src/data/tekken8Roster.ts
// Roster Oficial Completo de Tekken 8 (43 Personajes: 32 Base + Season 1 + Season 2 + Season 3)

export interface TekkenCharacter {
  slug: string;
  name: string;
  shortName: string;
  season: 'BASE' | 'SEASON_1' | 'SEASON_2' | 'SEASON_3';
  archetype: string;
  country: string;
  accentColor: string;
  badgeText: string;
}

export const TEKKEN_8_FULL_ROSTER: TekkenCharacter[] = [
  // ================= ROSTER BASE (32 PERSONAJES) =================
  { slug: 'alisa', name: 'Alisa Bosconovitch', shortName: 'Alisa', season: 'BASE', archetype: 'Chainsaw / Pokers & Mobility', country: 'RU', accentColor: '#F472B6', badgeText: 'AL' },
  { slug: 'asuka', name: 'Asuka Kazama', shortName: 'Asuka', season: 'BASE', archetype: 'Defensive / Parries', country: 'JP', accentColor: '#38BDF8', badgeText: 'AS' },
  { slug: 'azucena', name: 'Azucena Ortiz', shortName: 'Azucena', season: 'BASE', archetype: 'Libertador Stance / Mixup', country: 'PE', accentColor: '#FBBF24', badgeText: 'AZ' },
  { slug: 'bryan', name: 'Bryan Fury', shortName: 'Bryan', season: 'BASE', archetype: 'Counter-Hit / Taunt Jet Upper', country: 'US', accentColor: '#94A3B8', badgeText: 'BR' },
  { slug: 'claudio', name: 'Claudio Serafino', shortName: 'Claudio', season: 'BASE', archetype: 'Starburst / Keepout', country: 'IT', accentColor: '#60A5FA', badgeText: 'CL' },
  { slug: 'devil-jin', name: 'Devil Jin', shortName: 'Devil Jin', season: 'BASE', archetype: 'Mishima / Mourning Crow', country: 'JP', accentColor: '#A855F7', badgeText: 'DJ' },
  { slug: 'feng', name: 'Feng Wei', shortName: 'Feng', season: 'BASE', archetype: 'Evasive / Kenpo Pokes', country: 'CN', accentColor: '#EF4444', badgeText: 'FW' },
  { slug: 'hwoarang', name: 'Hwoarang', shortName: 'Hwoarang', season: 'BASE', archetype: 'Taekwondo / Flamingo Rushdown', country: 'KR', accentColor: '#F97316', badgeText: 'HW' },
  { slug: 'jack-8', name: 'Jack-8', shortName: 'Jack-8', season: 'BASE', archetype: 'Gamma Howl / Big Body', country: 'RU', accentColor: '#DC2626', badgeText: 'J8' },
  { slug: 'jin', name: 'Jin Kazama', shortName: 'Jin', season: 'BASE', archetype: 'All-Rounder / Karate', country: 'JP', accentColor: '#EF4444', badgeText: 'JN' },
  { slug: 'jun', name: 'Jun Kazama', shortName: 'Jun', season: 'BASE', archetype: 'Kazama Style / Health Resource', country: 'JP', accentColor: '#E2E8F0', badgeText: 'JU' },
  { slug: 'kazuya', name: 'Kazuya Mishima', shortName: 'Kazuya', season: 'BASE', archetype: 'Mishima / 50-50 Vortex & EWGF', country: 'JP', accentColor: '#8B5CF6', badgeText: 'KZ' },
  { slug: 'king', name: 'King', shortName: 'King', season: 'BASE', archetype: 'Grappler / Chain Throws', country: 'MX', accentColor: '#F59E0B', badgeText: 'KG' },
  { slug: 'kuma', name: 'Kuma', shortName: 'Kuma', season: 'BASE', archetype: 'Heihachi Bear / High Damage', country: 'JP', accentColor: '#B45309', badgeText: 'KM' },
  { slug: 'lars', name: 'Lars Alexandersson', shortName: 'Lars', season: 'BASE', archetype: 'Dynamic Entry / Stance Rush', country: 'SE', accentColor: '#3B82F6', badgeText: 'LR' },
  { slug: 'lee', name: 'Lee Chaolan', shortName: 'Lee', season: 'BASE', archetype: 'Marvelous Counter-Hit / Just Frames', country: 'JP', accentColor: '#C084FC', badgeText: 'LE' },
  { slug: 'leo', name: 'Leo Kliesen', shortName: 'Leo', season: 'BASE', archetype: 'Baji Quan / Balanced Mixup', country: 'DE', accentColor: '#2DD4BF', badgeText: 'LO' },
  { slug: 'leroy', name: 'Leroy Smith', shortName: 'Leroy', season: 'BASE', archetype: 'Wing Chun / Hermit Parries', country: 'US', accentColor: '#FDE047', badgeText: 'LY' },
  { slug: 'lili', name: 'Lili Rochefort', shortName: 'Lili', season: 'BASE', archetype: 'Sidestep / Dew Glide Gymnastics', country: 'MC', accentColor: '#F9A8D4', badgeText: 'LI' },
  { slug: 'xiaoyu', name: 'Ling Xiaoyu', shortName: 'Xiaoyu', season: 'BASE', archetype: 'Art of Phoenix / Evasive Mixup', country: 'CN', accentColor: '#FB923C', badgeText: 'XY' },
  { slug: 'law', name: 'Marshall Law', shortName: 'Law', season: 'BASE', archetype: 'Dragon Charge / Nunchaku Pressure', country: 'US', accentColor: '#FACC15', badgeText: 'LW' },
  { slug: 'nina', name: 'Nina Williams', shortName: 'Nina', season: 'BASE', archetype: 'Assassin Rushdown / Dual Pistols', country: 'IE', accentColor: '#A78BFA', badgeText: 'NI' },
  { slug: 'panda', name: 'Panda', shortName: 'Panda', season: 'BASE', archetype: 'Bear Style / Shooting Star', country: 'CN', accentColor: '#10B981', badgeText: 'PD' },
  { slug: 'paul', name: 'Paul Phoenix', shortName: 'Paul', season: 'BASE', archetype: 'Deathfist / Demolition Man', country: 'US', accentColor: '#EF4444', badgeText: 'PL' },
  { slug: 'raven', name: 'Raven', shortName: 'Raven', season: 'BASE', archetype: 'Ninjutsu / Shadow Clones', country: 'UN', accentColor: '#6366F1', badgeText: 'RV' },
  { slug: 'reina', name: 'Reina', shortName: 'Reina', season: 'BASE', archetype: 'Taido + Mishima / Sentai Stance', country: 'JP', accentColor: '#A855F7', badgeText: 'RN' },
  { slug: 'dragunov', name: 'Sergei Dragunov', shortName: 'Dragunov', season: 'BASE', archetype: 'Commando Sambo / Plus Frames', country: 'RU', accentColor: '#00F0FF', badgeText: 'DR' },
  { slug: 'shaheen', name: 'Shaheen', shortName: 'Shaheen', season: 'BASE', archetype: 'Military CQC / Stealth Step', country: 'SA', accentColor: '#34D399', badgeText: 'SH' },
  { slug: 'steve', name: 'Steve Fox', shortName: 'Steve', season: 'BASE', archetype: 'Boxing / Lionheart & B1 Counter', country: 'GB', accentColor: '#60A5FA', badgeText: 'ST' },
  { slug: 'victor', name: 'Victor Chevalier', shortName: 'Victor', season: 'BASE', archetype: 'Iaido Teleport / Perfumer', country: 'FR', accentColor: '#38BDF8', badgeText: 'VC' },
  { slug: 'yoshimitsu', name: 'Yoshimitsu', shortName: 'Yoshimitsu', season: 'BASE', archetype: 'Manji Ninjutsu / Flash Sword', country: 'JP', accentColor: '#22D3EE', badgeText: 'YO' },
  { slug: 'zafina', name: 'Zafina', shortName: 'Zafina', season: 'BASE', archetype: 'Azazel Power / Scarecrow & Tarantula', country: 'EG', accentColor: '#C084FC', badgeText: 'ZF' },

  // ================= SEASON 1 DLC (4 PERSONAJES) =================
  { slug: 'eddy', name: 'Eddy Gordo', shortName: 'Eddy', season: 'SEASON_1', archetype: 'Capoeira / Mandinga & Negativa', country: 'BR', accentColor: '#22C55E', badgeText: 'ED' },
  { slug: 'lidia', name: 'Lidia Sobieska', shortName: 'Lidia', season: 'SEASON_1', archetype: 'Shotokan Karate / Heaven & Earth', country: 'PL', accentColor: '#F43F5E', badgeText: 'LD' },
  { slug: 'heihachi', name: 'Heihachi Mishima', shortName: 'Heihachi', season: 'SEASON_1', archetype: 'Mishima / Warrior Instinct', country: 'JP', accentColor: '#F59E0B', badgeText: 'HH' },
  { slug: 'clive', name: 'Clive Rosfield', shortName: 'Clive', season: 'SEASON_1', archetype: 'FFXVI Guest / Eikonic Phoenix & Ifrit', country: 'FF', accentColor: '#FF0055', badgeText: 'CV' },

  // ================= SEASON 2 DLC (4 PERSONAJES) =================
  { slug: 'anna', name: 'Anna Williams', shortName: 'Anna', season: 'SEASON_2', archetype: 'Chaos Judgment / High-Risk 50-50', country: 'IE', accentColor: '#E11D48', badgeText: 'AN' },
  { slug: 'fahkumram', name: 'Fahkumram', shortName: 'Fahkumram', season: 'SEASON_2', archetype: 'Muay Thai / Guard Break Range', country: 'TH', accentColor: '#F97316', badgeText: 'FK' },
  { slug: 'armor-king', name: 'Armor King', shortName: 'Armor King', season: 'SEASON_2', archetype: 'Dark Upper / Hybrid Grappler', country: 'MX', accentColor: '#A3E635', badgeText: 'AK' },
  { slug: 'miary-zo', name: 'Miary Zo', shortName: 'Miary Zo', season: 'SEASON_2', archetype: 'Moraingy / Agile Striker', country: 'MG', accentColor: '#EC4899', badgeText: 'MZ' },

  // ================= SEASON 3 DLC (3 PERSONAJES) =================
  { slug: 'kunimitsu-ii', name: 'Kunimitsu II', shortName: 'Kunimitsu II', season: 'SEASON_3', archetype: 'Kunai Teleport / Urban Ninja', country: 'JP', accentColor: '#A855F7', badgeText: 'KN' },
  { slug: 'bob', name: 'Bob (Robert Richards)', shortName: 'Bob', season: 'SEASON_3', archetype: 'Speed and Weight / Freestyle Karate', country: 'US', accentColor: '#FBBF24', badgeText: 'BB' },
  { slug: 'roger-jr', name: 'Roger Jr.', shortName: 'Roger Jr.', season: 'SEASON_3', archetype: 'Commando Wrestling Kangaroo', country: 'AU', accentColor: '#FB923C', badgeText: 'RJ' },
];
