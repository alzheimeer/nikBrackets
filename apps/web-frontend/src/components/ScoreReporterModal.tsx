// apps/web-frontend/src/components/ScoreReporterModal.tsx
// Fase 1.5 — Componente de Reporte de Resultados en Pantalla Única con SetGameSelection (Mains & Legal Stages)

import React, { useState } from 'react';
import type { OBFEntrant, OBFSet, SetGameSelection } from '@nexus-grid/bracket-engine';

export interface ScoreReporterModalProps {
  set: OBFSet;
  player1?: OBFEntrant;
  player2?: OBFEntrant;
  availableCharacters: Array<{ slug: string; name: string }>;
  legalStages: Array<{ id: string; name: string; isLegal: boolean }>;
  onConfirmScore: (setID: string, score1: number, score2: number, games: SetGameSelection[]) => void;
  onCascadeReset: (setID: string) => void;
  onVerifyWithDeepSeekVL?: (setID: string, proofImageUrl: string) => void;
}

export const ScoreReporterModal: React.FC<ScoreReporterModalProps> = ({
  set,
  player1,
  player2,
  availableCharacters,
  legalStages,
  onConfirmScore,
  onCascadeReset,
  onVerifyWithDeepSeekVL,
}) => {
  const [score1, setScore1] = useState<number>(set.entrant1Score);
  const [score2, setScore2] = useState<number>(set.entrant2Score);
  const [char1, setChar1] = useState<string>(player1?.mainCharacter || availableCharacters[0]?.name || '');
  const [char2, setChar2] = useState<string>(player2?.mainCharacter || availableCharacters[1]?.name || '');
  const [stage, setStage] = useState<string>(legalStages.find((s) => s.isLegal)?.name || '');
  const [proofUrl, setProofUrl] = useState<string>('');

  const handleConfirm = () => {
    const gameRecord: SetGameSelection = {
      gameNumber: 1,
      character1Slug: char1,
      character2Slug: char2,
      stageSlug: stage,
      winnerEntrantID: score1 > score2 ? set.entrant1ID : set.entrant2ID,
    };
    onConfirmScore(set.setID, score1, score2, [gameRecord]);
  };

  return (
    <div className="rounded-2xl border border-[#00F0FF]/40 bg-[#111723]/95 p-5 text-[#F8FAFC] shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-[#00F0FF]">
            {set.setID} • {set.roundLabel} • Estación {set.other.station || 'EST-01'}
          </span>
          <h3 className="text-lg font-bold mt-0.5">Reporte de Partida & SetGameSelection</h3>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-900 font-mono text-xs text-amber-400">
          Bo{set.bestOf}
        </span>
      </div>

      {/* Controles de Marcador P1 vs P2 */}
      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="rounded-xl bg-[#070A0F] p-3 border border-slate-800">
          <div className="text-sm font-bold truncate">{player1 ? `#${player1.initialSeed} ${player1.entrantTag}` : 'TBD'}</div>
          <div className="flex items-center justify-between mt-3">
            <button type="button" onClick={() => setScore1(Math.max(0, score1 - 1))} className="px-3 py-1 rounded bg-slate-800">-</button>
            <span className="font-mono text-2xl font-bold text-[#00F0FF]">{score1}</span>
            <button type="button" onClick={() => setScore1(score1 + 1)} className="px-3 py-1 rounded bg-[#00F0FF]/20 text-[#00F0FF]">+</button>
          </div>
        </div>

        <div className="rounded-xl bg-[#070A0F] p-3 border border-slate-800">
          <div className="text-sm font-bold truncate">{player2 ? `#${player2.initialSeed} ${player2.entrantTag}` : 'TBD'}</div>
          <div className="flex items-center justify-between mt-3">
            <button type="button" onClick={() => setScore2(Math.max(0, score2 - 1))} className="px-3 py-1 rounded bg-slate-800">-</button>
            <span className="font-mono text-2xl font-bold text-[#FF0055]">{score2}</span>
            <button type="button" onClick={() => setScore2(score2 + 1)} className="px-3 py-1 rounded bg-[#FF0055]/20 text-[#FF0055]">+</button>
          </div>
        </div>
      </div>

      {/* Selección de Personajes (Mains) y Escenario Legal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 text-xs font-mono">
        <div>
          <label className="text-slate-400 block mb-1">Main P1 (GameCharacter)</label>
          <select value={char1} onChange={(e) => setChar1(e.target.value)} className="w-full bg-[#070A0F] border border-slate-800 rounded-lg p-2">
            {availableCharacters.map((c) => (
              <option key={c.slug} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Main P2 (GameCharacter)</label>
          <select value={char2} onChange={(e) => setChar2(e.target.value)} className="w-full bg-[#070A0F] border border-slate-800 rounded-lg p-2">
            {availableCharacters.map((c) => (
              <option key={c.slug} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Escenario Legal (GameStage)</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full bg-[#070A0F] border border-slate-800 rounded-lg p-2 text-emerald-300">
            {legalStages.filter((s) => s.isLegal).map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Verificación Opcional por Visión Multimodal DeepSeek-VL */}
      {onVerifyWithDeepSeekVL && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="URL de captura de victoria para verificación DeepSeek-VL..."
            className="flex-1 bg-[#070A0F] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono"
          />
          <button
            type="button"
            onClick={() => onVerifyWithDeepSeekVL(set.setID, proofUrl)}
            className="px-3 py-1.5 rounded-lg bg-[#8A2BE2]/25 border border-[#8A2BE2] text-purple-200 text-xs font-mono"
          >
            Validar con DeepSeek-VL
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 py-2.5 rounded-xl bg-[#00F0FF] text-[#070A0F] font-bold text-xs uppercase tracking-wider"
        >
          Confirmar Resultado & Avanzar Llave
        </button>
        <button
          type="button"
          onClick={() => onCascadeReset(set.setID)}
          className="px-4 py-2.5 rounded-xl bg-[#FF0055]/20 border border-[#FF0055]/50 text-rose-300 font-mono text-xs"
        >
          Reset en Cascada
        </button>
      </div>
    </div>
  );
};
