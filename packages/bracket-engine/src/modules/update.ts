// packages/bracket-engine/src/modules/update.ts
// Submódulo UPDATE — Actualización de marcadores, selección de personajes/escenarios (SetGameSelection), Forfeits y Seeding por Elo

import { OBFDocument, OBFEntrant, OBFSet, SetGameSelection } from '../types/obf.js';
import { generateSetsByFormat } from '../formats/generators.js';

export function createUpdateModule(
  getDoc: () => OBFDocument,
  resetCascade: (setID: string) => number,
  emitChange: (type: string, setID?: string) => void
) {
  const propagateAdvancement = (set: OBFSet) => {
    const doc = getDoc();
    if (set.nextWinSetID && set.winnerID) {
      const nextW = doc.sets.find((s) => s.setID === set.nextWinSetID);
      if (nextW) {
        if (!nextW.entrant1ID || nextW.entrant1ID === set.winnerID) {
          nextW.entrant1ID = set.winnerID;
        } else if (!nextW.entrant2ID && nextW.entrant1ID !== set.winnerID) {
          nextW.entrant2ID = set.winnerID;
        }
        nextW.status = nextW.entrant1ID && nextW.entrant2ID ? 'READY' : 'WAITING';
      }
    }

    if (set.nextLoseSetID && set.loserID) {
      const nextL = doc.sets.find((s) => s.setID === set.nextLoseSetID);
      if (nextL) {
        if (!nextL.entrant1ID || nextL.entrant1ID === set.loserID) {
          nextL.entrant1ID = set.loserID;
        } else if (!nextL.entrant2ID && nextL.entrant1ID !== set.loserID) {
          nextL.entrant2ID = set.loserID;
        }
        nextL.status = nextL.entrant1ID && nextL.entrant2ID ? 'READY' : 'WAITING';
      }
    }
  };

  return {
    match(params: {
      setID: string;
      score1: number;
      score2: number;
      games?: SetGameSelection[];
      proofImageUrl?: string;
      aiVerifiedConfidence?: number;
    }): OBFSet | null {
      const doc = getDoc();
      const set = doc.sets.find((s) => s.setID === params.setID);
      if (!set || !set.entrant1ID || !set.entrant2ID) return null;

      if (set.status === 'COMPLETED') {
        resetCascade(params.setID);
      }

      set.entrant1Score = params.score1;
      set.entrant2Score = params.score2;
      if (params.games) set.games = params.games;
      if (params.proofImageUrl) set.other.proofImageUrl = params.proofImageUrl;
      if (params.aiVerifiedConfidence !== undefined) {
        set.other.aiVerifiedConfidence = params.aiVerifiedConfidence;
      }

      if (params.score1 !== params.score2) {
        set.status = 'COMPLETED';
        set.winnerID = params.score1 > params.score2 ? set.entrant1ID : set.entrant2ID;
        set.loserID = params.score1 > params.score2 ? set.entrant2ID : set.entrant1ID;
        propagateAdvancement(set);
      } else {
        set.status = params.score1 > 0 || params.score2 > 0 ? 'IN_PROGRESS' : 'READY';
        set.winnerID = null;
        set.loserID = null;
      }

      emitChange('match.updated', set.setID);
      return set;
    },

    forfeit(setID: string, forfeitedEntrantID: string): OBFSet | null {
      const doc = getDoc();
      const set = doc.sets.find((s) => s.setID === setID);
      if (!set || !set.entrant1ID || !set.entrant2ID) return null;
      const isP1 = set.entrant1ID === forfeitedEntrantID;
      set.entrant1Forfeit = isP1;
      set.entrant2Forfeit = !isP1;
      return this.match({
        setID,
        score1: isP1 ? 0 : 2,
        score2: isP1 ? 2 : 0,
      });
    },

    confirmSeedingByElo(): OBFEntrant[] {
      const doc = getDoc();
      doc.entrants.sort((a, b) => b.eloRating - a.eloRating);
      doc.entrants.forEach((e, idx) => {
        e.initialSeed = idx + 1;
      });
      doc.sets = generateSetsByFormat(doc.event.format, doc.entrants);
      emitChange('seeding.updated');
      return doc.entrants;
    },
  };
}
