// packages/bracket-viewer-3d/src/components/BracketViewer2D.tsx
// Visualizador 2D Híbrido con soporte para todas las fases OBF (Suiza, Winners, Losers, Second Chance, Grand Final)

import React from 'react';
import type { OBFDocument, OBFSet } from '@nexus-grid/bracket-engine';

export interface BracketViewer2DProps {
  obfDocument: OBFDocument;
  selectedSetID?: string | null;
  phaseFilter?: string;
  onSelectSet?: (setID: string) => void;
}

export const BracketViewer2D: React.FC<BracketViewer2DProps> = ({
  obfDocument,
  selectedSetID,
  phaseFilter = 'ALL',
  onSelectSet,
}) => {
  const entrantMap = new Map(obfDocument.entrants.map((e) => [e.entrantID, e]));
  const phases = ['SWISS', 'ROUND_ROBIN', 'WINNERS', 'LOSERS', 'SECOND_CHANCE', 'GRAND_FINAL'] as const;

  return (
    <div className="flex flex-col gap-6">
      {phases.map((phaseKey) => {
        if (phaseFilter !== 'ALL' && phaseFilter !== phaseKey) return null;
        const phaseSets = obfDocument.sets.filter((s: OBFSet) => s.phase === phaseKey);
        if (phaseSets.length === 0) return null;

        return (
          <div key={phaseKey} className="rounded-2xl border border-slate-800 bg-[#070A0F]/80 p-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F0FF] mb-3">
              Fase: {phaseKey} ({phaseSets.length} Sets)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {phaseSets.map((set: OBFSet) => {
                const p1 = set.entrant1ID ? entrantMap.get(set.entrant1ID) : undefined;
                const p2 = set.entrant2ID ? entrantMap.get(set.entrant2ID) : undefined;
                const isSelected = selectedSetID === set.setID;

                return (
                  <div
                    key={set.setID}
                    onClick={() => onSelectSet?.(set.setID)}
                    className={`rounded-xl p-3 border cursor-pointer transition ${
                      isSelected ? 'border-[#00F0FF] bg-[#111723]' : 'border-slate-800 bg-[#111723]/70'
                    }`}
                  >
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-2">
                      <span>{set.setID} • {set.roundLabel}</span>
                      <span>{set.other.station || 'EST-01'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-white py-1">
                      <span>{p1 ? `#${p1.initialSeed} ${p1.entrantTag}` : 'TBD'}</span>
                      <span className="font-mono text-[#00F0FF]">{set.entrant1Score}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 py-1">
                      <span>{p2 ? `#${p2.initialSeed} ${p2.entrantTag}` : 'TBD'}</span>
                      <span className="font-mono text-[#FF0055]">{set.entrant2Score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
