// apps/web-frontend/src/App.tsx
// Aplicación Principal NEXUS GRID 3D que integra en orden:
// Fase 0 (@nexus-grid/bracket-engine, @nexus-grid/bracket-viewer-3d, authLive) -> Fase 1 -> Fase 2 -> Fase 3

import React, { useState } from 'react';
import { BracketCanvas3D, BracketViewer2D } from '@nexus-grid/bracket-viewer-3d';
import type { TournamentFormat } from '@nexus-grid/bracket-engine';
import { tournamentStore } from './store/useTournamentStore.js';
import { ScoreReporterModal } from './components/ScoreReporterModal.js';
import { PlayerHolographicCard3D } from './components/PlayerHolographicCard3D.js';

export default function App() {
  const [obfDoc, setObfDoc] = useState(tournamentStore.engine.get.obf());
  const [selectedSetID, setSelectedSetID] = useState<string>('SW-R1-1');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const activeSet = tournamentStore.engine.find.match(selectedSetID) || obfDoc.sets[0];
  const p1 = obfDoc.entrants.find((e) => e.entrantID === activeSet?.entrant1ID);
  const p2 = obfDoc.entrants.find((e) => e.entrantID === activeSet?.entrant2ID);

  const handleFormatChange = (format: TournamentFormat) => {
    const updated = tournamentStore.setFormat(format);
    setObfDoc({ ...updated });
    setSelectedSetID(updated.sets[0]?.setID || '');
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#F8FAFC] p-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wider">
            NEXUS GRID <span className="text-[#00F0FF]">3D</span> — Esports Platform 2026
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Fase 0: @nexus-grid/bracket-engine (7 Formatos OBF) + @nexus-grid/bracket-viewer-3d + authLive
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={obfDoc.event.format}
            onChange={(e) => handleFormatChange(e.target.value as TournamentFormat)}
            className="bg-[#111723] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
          >
            <option value="two_stage">Two-Stage (Suizo 3 Sets Mín. ➔ Doble Elim + 2nd Chance)</option>
            <option value="double_elimination">Doble Eliminación</option>
            <option value="single_elimination">Eliminación Simple</option>
            <option value="swiss">Sistema Suizo</option>
            <option value="round_robin">Round Robin</option>
            <option value="free_for_all">Free-For-All (FFA)</option>
            <option value="leaderboard">Leaderboard / Time Trial</option>
          </select>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="px-4 py-2 rounded-xl bg-[#00F0FF] text-[#070A0F] font-bold text-xs"
          >
            Modo: {viewMode.toUpperCase()}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {viewMode === '3d' ? (
            <BracketCanvas3D
              obfDocument={obfDoc}
              selectedSetID={selectedSetID}
              onSelectSet={(id) => setSelectedSetID(id)}
            />
          ) : (
            <BracketViewer2D
              obfDocument={obfDoc}
              selectedSetID={selectedSetID}
              onSelectSet={(id) => setSelectedSetID(id)}
            />
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          {activeSet && (
            <ScoreReporterModal
              set={activeSet}
              player1={p1}
              player2={p2}
              availableCharacters={[
                { slug: 'dragunov', name: 'Sergei Dragunov' },
                { slug: 'kazuya', name: 'Kazuya Mishima' },
                { slug: 'jin', name: 'Jin Kazama' },
                { slug: 'reina', name: 'Reina' },
              ]}
              legalStages={[
                { id: 'st-yakushima', name: 'Yakushima (Infinite)', isLegal: true },
                { id: 'st-arena', name: 'Arena (Octagon)', isLegal: true },
              ]}
              onConfirmScore={(setID, s1, s2, games) => {
                tournamentStore.reportScore(setID, s1, s2, games);
                setObfDoc({ ...tournamentStore.engine.get.obf() });
              }}
              onCascadeReset={(setID) => {
                tournamentStore.resetCascade(setID);
                setObfDoc({ ...tournamentStore.engine.get.obf() });
              }}
            />
          )}

          <PlayerHolographicCard3D
            gamertag="Niklauss#KR1"
            eloRating={2140}
            mainCharacter="Sergei Dragunov"
            country="CO"
            assignedStation="EST-01"
            guaranteedMinMatches={obfDoc.event.guaranteedMinMatches}
          />
        </div>
      </div>
    </div>
  );
}
