// packages/bracket-engine/src/modules/find.ts
// Submódulo FIND (inspirado en brackets-manager.js) — Búsqueda de partidas, siguientes rondas y sets de stream

import { OBFDocument, OBFSet } from '../types/obf.js';

export function createFindModule(getDoc: () => OBFDocument) {
  const match = (setID: string): OBFSet | undefined => {
    return getDoc().sets.find((s) => s.setID === setID);
  };

  return {
    match,

    nextMatches(setID: string): { nextWin?: OBFSet; nextLose?: OBFSet } {
      const current = match(setID);
      if (!current) return {};
      return {
        nextWin: current.nextWinSetID ? match(current.nextWinSetID) : undefined,
        nextLose: current.nextLoseSetID ? match(current.nextLoseSetID) : undefined,
      };
    },

    streamMatches(): OBFSet[] {
      return getDoc().sets.filter((s) => Boolean(s.other.isStream));
    },

    matchesByEntrant(entrantID: string): OBFSet[] {
      return getDoc().sets.filter((s) => s.entrant1ID === entrantID || s.entrant2ID === entrantID);
    },

    pendingMatchesByStation(station: string): OBFSet[] {
      return getDoc().sets.filter(
        (s) => s.other.station === station && s.status !== 'COMPLETED'
      );
    },
  };
}
