// apps/web-frontend/src/components/StreamObsOverlay.tsx
// Fase 2 — Overlay Gráfico Ligero 1920x1080 para OBS Studio / Stream Deck sincronizado por WebSockets (< 5ms)

import React from 'react';
import type { OBFEntrant, OBFSet } from '@nexus-grid/bracket-engine';

export interface StreamObsOverlayProps {
  streamSet: OBFSet;
  player1?: OBFEntrant;
  player2?: OBFEntrant;
  casterNarrative?: string;
  onQuickScoreDelta?: (player: 1 | 2, delta: number) => void;
}

export const StreamObsOverlay: React.FC<StreamObsOverlayProps> = ({
  streamSet,
  player1,
  player2,
  casterNarrative,
  onQuickScoreDelta,
}) => {
  return (
    <div className="w-full rounded-2xl border-2 border-[#00F0FF]/60 bg-[#070A0F]/95 p-4 text-[#F8FAFC] shadow-[0_0_30px_rgba(0,240,255,0.2)]">
      <div className="grid grid-cols-11 items-center gap-3">
        {/* Jugador 1 */}
        <div className="col-span-4 flex items-center justify-between rounded-xl bg-[#111723] px-4 py-2.5 border-l-4 border-[#00F0FF]">
          <div>
            <div className="font-bold text-base">{player1?.entrantTag || 'TBD'}</div>
            <div className="text-xs font-mono text-[#00F0FF]">
              Main: {player1?.mainCharacter || 'N/A'} ({player1?.country || 'CO'})
            </div>
          </div>
          <span className="font-mono text-2xl font-bold text-[#00F0FF]">{streamSet.entrant1Score}</span>
        </div>

        {/* Centro: Ronda y Estación */}
        <div className="col-span-3 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            {streamSet.roundLabel}
          </span>
          <span className="mt-1 rounded-full bg-[#8A2BE2]/30 border border-[#8A2BE2]/60 px-3 py-0.5 font-mono text-xs">
            {streamSet.other.station || 'EST-01'} • Bo{streamSet.bestOf}
          </span>
        </div>

        {/* Jugador 2 */}
        <div className="col-span-4 flex items-center justify-between rounded-xl bg-[#111723] px-4 py-2.5 border-r-4 border-[#FF0055]">
          <span className="font-mono text-2xl font-bold text-[#FF0055]">{streamSet.entrant2Score}</span>
          <div className="text-right">
            <div className="font-bold text-base">{player2?.entrantTag || 'TBD'}</div>
            <div className="text-xs font-mono text-[#FF0055]">
              Main: {player2?.mainCharacter || 'N/A'} ({player2?.country || 'KR'})
            </div>
          </div>
        </div>
      </div>

      {casterNarrative && (
        <div className="mt-3 rounded-xl border border-[#8A2BE2]/50 bg-[#111723]/80 px-4 py-2 text-xs font-mono text-purple-200">
          {casterNarrative}
        </div>
      )}

      {onQuickScoreDelta && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onQuickScoreDelta(1, 1)}
            className="rounded-lg bg-[#00F0FF]/20 border border-[#00F0FF]/50 px-3 py-1 text-xs font-mono text-[#00F0FF]"
          >
            +1 P1 (Stream Deck)
          </button>
          <button
            type="button"
            onClick={() => onQuickScoreDelta(2, 1)}
            className="rounded-lg bg-[#FF0055]/20 border border-[#FF0055]/50 px-3 py-1 text-xs font-mono text-[#FF0055]"
          >
            +1 P2 (Stream Deck)
          </button>
        </div>
      )}
    </div>
  );
};
