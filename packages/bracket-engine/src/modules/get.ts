// packages/bracket-engine/src/modules/get.ts
// Submódulo GET — Obtención del documento OBF v1.0, Standings con Buchholz y verificación de 3 partidas mínimas

import { OBFDocument, OBFEntrant, StandingsRow } from '../types/obf.js';
import { sortAndBalanceEntrants } from '../formats/generators.js';

export function createGetModule(getDoc: () => OBFDocument) {
  return {
    obf(): OBFDocument {
      return getDoc();
    },

    seeding(): OBFEntrant[] {
      return sortAndBalanceEntrants(getDoc().entrants);
    },

    standings(): StandingsRow[] {
      const doc = getDoc();
      const map = new Map<string, Omit<StandingsRow, 'rank'>>();
      for (const e of doc.entrants) {
        map.set(e.entrantID, {
          entrant: e,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          gamesWon: 0,
          gamesLost: 0,
          gameDifferential: 0,
          buchholzScore: 0,
          guaranteedTargetMet: false,
        });
      }

      for (const s of doc.sets) {
        if (s.status === 'COMPLETED' && s.entrant1ID && s.entrant2ID) {
          const r1 = map.get(s.entrant1ID);
          const r2 = map.get(s.entrant2ID);
          if (r1 && r2) {
            r1.matchesPlayed += 1;
            r2.matchesPlayed += 1;
            r1.gamesWon += s.entrant1Score;
            r1.gamesLost += s.entrant2Score;
            r2.gamesWon += s.entrant2Score;
            r2.gamesLost += s.entrant1Score;
            r1.gameDifferential = r1.gamesWon - r1.gamesLost;
            r2.gameDifferential = r2.gamesWon - r2.gamesLost;

            if (s.winnerID === s.entrant1ID) {
              r1.wins += 1;
              r2.losses += 1;
            } else if (s.winnerID === s.entrant2ID) {
              r2.wins += 1;
              r1.losses += 1;
            }
          }
        }
      }

      for (const [entrantID, row] of map.entries()) {
        const playedSets = doc.sets.filter(
          (s) => s.status === 'COMPLETED' && (s.entrant1ID === entrantID || s.entrant2ID === entrantID)
        );
        let buchholz = 0;
        for (const ps of playedSets) {
          const oppID = ps.entrant1ID === entrantID ? ps.entrant2ID : ps.entrant1ID;
          if (oppID && map.has(oppID)) {
            buchholz += map.get(oppID)!.wins;
          }
        }
        row.buchholzScore = buchholz;
        row.guaranteedTargetMet = row.matchesPlayed >= doc.event.guaranteedMinMatches;
      }

      const sorted = Array.from(map.values()).sort(
        (a, b) =>
          b.wins - a.wins ||
          b.buchholzScore - a.buchholzScore ||
          b.gameDifferential - a.gameDifferential ||
          a.entrant.initialSeed - b.entrant.initialSeed
      );

      return sorted.map((item, idx) => ({
        rank: idx + 1,
        ...item,
      }));
    },
  };
}
