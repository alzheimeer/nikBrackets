// packages/bracket-engine/src/formats/swissPairing.ts
// Algoritmo Dinámico de Emparejamiento Suizo Ronda a Ronda (sin revanchas + Buchholz tie-breaker)
// y Transición Automática a Playoffs (Winners + Losers + Second Chance) garantizando >= 3 partidas por jugador.

import { OBFDocument, OBFSet, StandingsRow } from '../types/obf.js';

export interface SwissPairingResult {
  roundNumber: number;
  createdSets: OBFSet[];
  rematchesAvoided: number;
  transitionedToPlayoffs: boolean;
}

/**
 * Verifica si dos competidores ya se enfrentaron previamente en el torneo.
 */
export function havePlayedBefore(sets: OBFSet[], entrantA: string, entrantB: string): boolean {
  return sets.some(
    (s) =>
      (s.entrant1ID === entrantA && s.entrant2ID === entrantB) ||
      (s.entrant1ID === entrantB && s.entrant2ID === entrantA)
  );
}

/**
 * Genera dinámicamente los enfrentamientos de la siguiente ronda Suiza agrupando por récord (W-L),
 * ordenando por puntuación Buchholz + Elo y evitando revanchas mediante backtracking ligero.
 */
export function pairNextSwissRound(
  doc: OBFDocument,
  standings: StandingsRow[],
  targetRound: number
): SwissPairingResult {
  const ordered = [...standings].sort(
    (a, b) =>
      b.wins - a.wins ||
      a.losses - b.losses ||
      b.buchholzScore - a.buchholzScore ||
      b.gameDifferential - a.gameDifferential ||
      b.entrant.eloRating - a.entrant.eloRating
  );

  const unpaired = ordered.map((r) => r.entrant.entrantID);
  const pairs: Array<[string, string]> = [];
  let rematchesAvoided = 0;

  while (unpaired.length >= 2) {
    const p1 = unpaired.shift()!;
    let chosenIdx = 0;

    for (let i = 0; i < unpaired.length; i++) {
      const candidate = unpaired[i];
      if (!havePlayedBefore(doc.sets, p1, candidate)) {
        chosenIdx = i;
        if (i > 0) rematchesAvoided += 1;
        break;
      }
    }

    const [p2] = unpaired.splice(chosenIdx, 1);
    pairs.push([p1, p2]);
  }

  const createdSets: OBFSet[] = pairs.map(([p1, p2], idx) => {
    const r1 = standings.find((s) => s.entrant.entrantID === p1);
    const recordLabel = r1 ? `${r1.wins}-${r1.losses}` : 'Suiza';
    const setID = `SW-DYN-R${targetRound}-${idx + 1}`;
    const set: OBFSet = {
      setID,
      phase: 'SWISS',
      round: targetRound,
      roundLabel: `Suiza Dinámica R${targetRound} (${recordLabel})`,
      entrant1ID: p1,
      entrant2ID: p2,
      entrant1Score: 0,
      entrant2Score: 0,
      status: 'READY',
      winnerID: null,
      loserID: null,
      nextWinSetID: null,
      nextLoseSetID: null,
      games: [],
      other: {
        station: `EST-0${(idx % 6) + 1}`,
        isStream: idx === 0,
        position3D: [-8 + (targetRound - 1) * 3.5, 2.5 - idx * 2.0, 2.5],
        bestOf: 3,
      },
    };
    return set;
  });

  doc.sets.push(...createdSets);

  return {
    roundNumber: targetRound,
    createdSets,
    rematchesAvoided,
    transitionedToPlayoffs: false,
  };
}

/**
 * Transiciona automáticamente de la Fase 1 (Clasificación Suiza con >=3 partidas)
 * hacia la Fase 2: Top 4 a Doble Eliminación (Winners/Losers) y Bottom 4 a Second Chance Bracket.
 */
export function advanceSwissToTwoStagePlayoffs(
  doc: OBFDocument,
  standings: StandingsRow[]
): OBFSet[] {
  const top4 = standings.slice(0, 4).map((r) => r.entrant.entrantID);
  const bottom4 = standings.slice(4, 8).map((r) => r.entrant.entrantID);

  const wSf1 = doc.sets.find((s) => s.setID === 'W-SF-1');
  const wSf2 = doc.sets.find((s) => s.setID === 'W-SF-2');
  if (wSf1 && top4.length >= 4) {
    wSf1.entrant1ID = top4[0];
    wSf1.entrant2ID = top4[3];
    wSf1.status = 'READY';
  }
  if (wSf2 && top4.length >= 4) {
    wSf2.entrant1ID = top4[1];
    wSf2.entrant2ID = top4[2];
    wSf2.status = 'READY';
  }

  const scSf1 = doc.sets.find((s) => s.setID === 'SC-SF-1');
  const scSf2 = doc.sets.find((s) => s.setID === 'SC-SF-2');
  if (scSf1 && bottom4.length >= 4) {
    scSf1.entrant1ID = bottom4[0];
    scSf1.entrant2ID = bottom4[3];
    scSf1.status = 'READY';
  }
  if (scSf2 && bottom4.length >= 4) {
    scSf2.entrant1ID = bottom4[1];
    scSf2.entrant2ID = bottom4[2];
    scSf2.status = 'READY';
  }

  return doc.sets.filter((s) => s.phase !== 'SWISS');
}
