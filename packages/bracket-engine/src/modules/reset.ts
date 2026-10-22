// packages/bracket-engine/src/modules/reset.ts
// Submódulo RESET (inspirado en bracket-maker & brackets-manager.js) — Reseteo en cascada recursivo al editar marcadores

import { OBFDocument } from '../types/obf.js';
import { generateSetsByFormat } from '../formats/generators.js';

export function createResetModule(
  getDoc: () => OBFDocument,
  emitChange: (type: string, setID?: string) => void
) {
  const matchCascade = (setID: string): number => {
    const doc = getDoc();
    const set = doc.sets.find((s) => s.setID === setID);
    if (!set) return 0;

    let count = 1;
    const prevWinner = set.winnerID;
    const prevLoser = set.loserID;

    set.entrant1Score = 0;
    set.entrant2Score = 0;
    set.entrant1Forfeit = false;
    set.entrant2Forfeit = false;
    set.winnerID = null;
    set.loserID = null;
    set.games = [];
    set.status = set.entrant1ID && set.entrant2ID ? 'READY' : 'WAITING';

    if (set.nextWinSetID && prevWinner) {
      const nextW = doc.sets.find((s) => s.setID === set.nextWinSetID);
      if (nextW) {
        if (nextW.status === 'COMPLETED' || nextW.status === 'IN_PROGRESS') {
          count += matchCascade(nextW.setID);
        }
        if (nextW.entrant1ID === prevWinner) nextW.entrant1ID = null;
        if (nextW.entrant2ID === prevWinner) nextW.entrant2ID = null;
        nextW.status = nextW.entrant1ID && nextW.entrant2ID ? 'READY' : 'WAITING';
      }
    }

    if (set.nextLoseSetID && prevLoser) {
      const nextL = doc.sets.find((s) => s.setID === set.nextLoseSetID);
      if (nextL) {
        if (nextL.status === 'COMPLETED' || nextL.status === 'IN_PROGRESS') {
          count += matchCascade(nextL.setID);
        }
        if (nextL.entrant1ID === prevLoser) nextL.entrant1ID = null;
        if (nextL.entrant2ID === prevLoser) nextL.entrant2ID = null;
        nextL.status = nextL.entrant1ID && nextL.entrant2ID ? 'READY' : 'WAITING';
      }
    }

    emitChange('match.reset_cascade', setID);
    return count;
  };

  return {
    matchCascade,

    stage(): OBFDocument {
      const doc = getDoc();
      doc.sets = generateSetsByFormat(doc.event.format, doc.entrants);
      emitChange('stage.reset');
      return doc;
    },
  };
}
