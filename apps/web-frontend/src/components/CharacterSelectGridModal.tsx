// apps/web-frontend/src/components/CharacterSelectGridModal.tsx
// Selector Visual Arcade de Personajes inspirado en la pantalla oficial de selección de Tekken 8
// Incluye:
//  -Los 43 personajes de Tekken 8 (32 Base + Season 1 + Season 2 + Season 3) + casilla central "?" (Random)
//  - Búsqueda instantánea por texto y filtro rápido por inicial (A-Z)
//  - Selección por clic con cursores P1 (#00F0FF) y P2 (#FF0055) sobre tarjetas inclinadas tipo arcade

import React, { useMemo, useState } from 'react';
import { TEKKEN_8_FULL_ROSTER, TekkenCharacter } from '@nexus-grid/bracket-engine/src/data/tekken8Roster.js';

export interface CharacterSelectGridModalProps {
  isOpen: boolean;
  activeSlot: 'P1' | 'P2';
  selectedP1: string;
  selectedP2: string;
  onSelectCharacter: (slot: 'P1' | 'P2', characterName: string) => void;
  onClose: () => void;
}

export const CharacterSelectGridModal: React.FC<CharacterSelectGridModalProps> = ({
  isOpen,
  activeSlot: initialSlot,
  selectedP1,
  selectedP2,
  onSelectCharacter,
  onClose,
}) => {
  const [activeSlot, setActiveSlot] = useState<'P1' | 'P2'>(initialSlot);
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState<string>('ALL');
  const [seasonFilter, setSeasonFilter] = useState<'ALL' | 'BASE' | 'SEASON_1' | 'SEASON_2' | 'SEASON_3'>('ALL');

  const alphabet = useMemo(() => {
    const letters = new Set(TEKKEN_8_FULL_ROSTER.map((c) => c.name[0].toUpperCase()));
    return ['ALL', ...Array.from(letters).sort()];
  }, []);

  const filteredCharacters = useMemo(() => {
    return TEKKEN_8_FULL_ROSTER.filter((c) => {
      if (seasonFilter !== 'ALL' && c.season !== seasonFilter) return false;
      if (letterFilter !== 'ALL' && !c.name.toUpperCase().startsWith(letterFilter)) return false;
      if (
        searchQuery.trim() &&
        !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !c.archetype.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [searchQuery, letterFilter, seasonFilter]);

  if (!isOpen) return null;

  const pickRandomCharacter = () => {
    const pool = filteredCharacters.length > 0 ? filteredCharacters : TEKKEN_8_FULL_ROSTER;
    const randomChar = pool[Math.floor(Math.random() * pool.length)];
    onSelectCharacter(activeSlot, randomChar.name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-[#00F0FF]/50 bg-[#070A0F] p-5 text-[#F8FAFC] shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col gap-4 max-h-[92vh]">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40">
              TEKKEN 8 CHARACTER SELECT • 43 FIGHTERS (32 BASE + S1 + S2 + S3)
            </span>
            <h3 className="text-xl font-bold mt-1">
              Selecciona Personaje con 1 Clic o Filtra por Letra / Temporada
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSlot('P1')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold border transition ${
                activeSlot === 'P1'
                  ? 'bg-[#00F0FF] text-[#070A0F] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                  : 'bg-[#111723] text-[#00F0FF] border-[#00F0FF]/40'
              }`}
            >
              CURSOR P1: {selectedP1}
            </button>
            <button
              type="button"
              onClick={() => setActiveSlot('P2')}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold border transition ${
                activeSlot === 'P2'
                  ? 'bg-[#FF0055] text-white border-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.5)]'
                  : 'bg-[#111723] text-[#FF0055] border-[#FF0055]/40'
              }`}
            >
              CURSOR P2: {selectedP2}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-mono text-white hover:bg-slate-700"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* SEARCH + SEASON TABS + LETTER BAR */}
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Buscar personaje (ej. Reina, Dragunov, Clive, Armor King, Kunimitsu)..."
              className="flex-1 min-w-[240px] bg-[#111723] border border-slate-700 focus:border-[#00F0FF] rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
            />
            {(['ALL', 'BASE', 'SEASON_1', 'SEASON_2', 'SEASON_3'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeasonFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold border ${
                  seasonFilter === s
                    ? 'bg-[#8A2BE2]/30 text-purple-200 border-[#8A2BE2]'
                    : 'bg-[#111723] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {s === 'ALL'
                  ? 'Todos (43)'
                  : s === 'BASE'
                  ? 'Base (32)'
                  : s.replace('_', ' ')}
              </button>
            ))}
            <button
              type="button"
              onClick={pickRandomCharacter}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-xs font-bold hover:bg-amber-500/30"
            >
              ? Random Select
            </button>
          </div>

          {/* A-Z QUICK FILTER */}
          <div className="flex flex-wrap items-center gap-1">
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setLetterFilter(letter)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition ${
                  letterFilter === letter
                    ? 'bg-[#00F0FF] text-[#070A0F]'
                    : 'bg-[#111723] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {letter === 'ALL' ? 'A-Z (Todos)' : letter}
              </button>
            ))}
          </div>
        </div>

        {/* ARCADE PORTRAIT GRID (INSPIRED BY TEKKEN 8 SELECT SCREEN) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2 overflow-y-auto pr-1 py-1">
          {filteredCharacters.map((char: TekkenCharacter) => {
            const isP1 = selectedP1 === char.name;
            const isP2 = selectedP2 === char.name;
            return (
              <button
                key={char.slug}
                type="button"
                onClick={() => {
                  onSelectCharacter(activeSlot, char.name);
                  if (activeSlot === 'P1') setActiveSlot('P2');
                }}
                className={`group relative rounded-xl p-2 flex flex-col items-center justify-between border-2 transition-all transform hover:-translate-y-1 -skew-x-6 ${
                  isP1 && isP2
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_18px_rgba(245,158,11,0.5)]'
                    : isP1
                    ? 'border-[#00F0FF] bg-[#00F0FF]/20 shadow-[0_0_18px_rgba(0,240,255,0.45)]'
                    : isP2
                    ? 'border-[#FF0055] bg-[#FF0055]/20 shadow-[0_0_18px_rgba(255,0,85,0.45)]'
                    : 'border-slate-800 bg-[#111723]/90 hover:border-[#00F0FF]/60'
                }`}
              >
                {/* P1 / P2 BADGE */}
                {(isP1 || isP2) && (
                  <span
                    className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold ${
                      isP1 && isP2
                        ? 'bg-amber-400 text-black'
                        : isP1
                        ? 'bg-[#00F0FF] text-black'
                        : 'bg-[#FF0055] text-white'
                    }`}
                  >
                    {isP1 && isP2 ? 'P1•P2' : isP1 ? 'P1' : 'P2'}
                  </span>
                )}

                {/*DLC BADGE*/}
                {char.season !== 'BASE' && (
                  <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-purple-900/80 text-[8px] font-mono text-purple-200 border border-purple-500/40">
                    {char.season.replace('SEASON_', 'S')}
                  </span>
                )}

                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-inner mt-2 skew-x-6"
                  style={{
                    background: `linear-gradient(135deg, ${char.accentColor}44, #070A0F)`,
                    border: `1px solid ${char.accentColor}`,
                  }}
                >
                  {char.badgeText}
                </div>

                <div className="mt-1.5 text-center skew-x-6 w-full">
                  <div className="text-[11px] font-bold text-white truncate">{char.shortName}</div>
                  <div className="text-[9px] font-mono text-slate-400 truncate">{char.country}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
