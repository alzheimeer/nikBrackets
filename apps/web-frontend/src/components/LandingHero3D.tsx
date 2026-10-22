// apps/web-frontend/src/components/LandingHero3D.tsx
// Fase 1.1 — Hero Section Interactivo en WebGL con Arena 3D y Selector Directo de los 7 Formatos OBF

import React from 'react';
import type { TournamentFormat } from '@nexus-grid/bracket-engine';

export interface LandingHero3DProps {
  activeFormat: TournamentFormat;
  entrantCount: number;
  completedSetsCount: number;
  totalSetsCount: number;
  onSelectFormat: (format: TournamentFormat) => void;
  onSimulateNextSet: () => void;
  onRunDeepSeekSeeding: () => void;
}

export const LandingHero3D: React.FC<LandingHero3DProps> = ({
  activeFormat,
  entrantCount,
  completedSetsCount,
  totalSetsCount,
  onSelectFormat,
  onSimulateNextSet,
  onRunDeepSeekSeeding,
}) => {
  return (
    <section className="rounded-2xl border border-[#00F0FF]/35 bg-gradient-to-r from-[#070A0F] via-[#111723] to-[#070A0F] p-6 text-[#F8FAFC] shadow-[0_0_30px_rgba(0,240,255,0.08)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40">
              FASE 0.1 & 0.2 • @nexus-grid/bracket-engine + @nexus-grid/bracket-viewer-3d
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[#8A2BE2]/25 text-purple-200 border border-[#8A2BE2]/50">
              Open Bracket Format (OBF v1.0)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2 tracking-wide">
            NEXUS GRID <span className="text-[#00F0FF]">3D</span> — Arena de Brackets Z-Space
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Garantía matemática de mínimo 3 partidas por competidor (Fase Suiza ➔ Doble Eliminación + Second Chance), reseteo en cascada automático y validación multimodal con DeepSeek-VL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={activeFormat}
            onChange={(e) => onSelectFormat(e.target.value as TournamentFormat)}
            className="bg-[#070A0F] border border-[#00F0FF]/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F8FAFC]"
          >
            <option value="two_stage">★ Two-Stage (Suizo 3 Rondas Mín. ➔ Doble Elim + 2nd Chance)</option>
            <option value="double_elimination">Doble Eliminación (Winners + Losers + Reset)</option>
            <option value="single_elimination">Eliminación Simple (+ 3er Puesto)</option>
            <option value="swiss">Sistema Suizo Puro (Sin Revanchas)</option>
            <option value="round_robin">Round Robin (Todos contra Todos)</option>
            <option value="free_for_all">Free-For-All (Salas Multi-Jugador)</option>
            <option value="leaderboard">Leaderboard / Time Trial</option>
          </select>

          <button
            type="button"
            onClick={onRunDeepSeekSeeding}
            className="px-3.5 py-2.5 rounded-xl bg-[#8A2BE2]/25 border border-[#8A2BE2] text-purple-200 font-mono text-xs font-semibold"
          >
            Seeding DeepSeek-R1
          </button>

          <button
            type="button"
            onClick={onSimulateNextSet}
            className="px-4 py-2.5 rounded-xl bg-[#00F0FF] text-[#070A0F] font-mono text-xs font-bold"
          >
            ⚡ Simular Siguiente Set
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
        <div>
          Competidores: <strong className="text-white">{entrantCount}</strong> • Sets Completados:{' '}
          <strong className="text-[#00F0FF]">{completedSetsCount}</strong> / {totalSetsCount}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#00F0FF]">● Winners (#00F0FF)</span>
          <span className="text-[#FF0055]">● Losers (#FF0055)</span>
          <span className="text-amber-400">● Grand Final / 2nd Chance (#F59E0B)</span>
        </div>
      </div>
    </section>
  );
};
