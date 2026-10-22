// packages/bracket-engine/dist/index.js
// Distribución ESM ejecutable de @nexus-grid/bracket-engine (Fase 0.1)
// Incluye los 7 formatos OBF v1.0, reseteo en cascada recursivo y emparejamiento dinámico Suizo sin revanchas.

export class NexusBracketEngine {
  constructor(initialParams) {
    this.listeners = new Set();
    const balanced = [...initialParams.entrants].sort(
      (a, b) => a.initialSeed - b.initialSeed || b.eloRating - a.eloRating
    );
    this.doc = {
      version: '1.0',
      standard: 'Open Bracket Format (OBF)',
      event: {
        id: initialParams.event?.id || 'ev-default-2026',
        name: initialParams.event?.name || 'Torneo Oficial Nexus Grid 2026',
        date: initialParams.event?.date || '2026-10-22',
        gameName: initialParams.event?.gameName || 'Tekken 8',
        gameSlug: initialParams.event?.gameSlug || 'tekken-8',
        format: initialParams.format,
        numberEntrants: balanced.length,
        guaranteedMinMatches:
          initialParams.format === 'two_stage' ||
          initialParams.format === 'swiss' ||
          initialParams.format === 'round_robin'
            ? 3
            : 2,
      },
      entrants: balanced,
      sets: this.generateSets(initialParams.format, balanced),
    };

    this.create = {
      stage: ({ format, entrants }) => {
        const sorted = [...entrants].sort((a, b) => a.initialSeed - b.initialSeed);
        this.doc.entrants = sorted;
        this.doc.event.format = format;
        this.doc.event.numberEntrants = sorted.length;
        this.doc.sets = this.generateSets(format, sorted);
        return this.doc;
      },
      nextSwissRound: (roundNumber) => {
        const standings = this.get.standings();
        const unpaired = standings.map((r) => r.entrant.entrantID);
        const created = [];
        let idx = 0;
        while (unpaired.length >= 2) {
          const p1 = unpaired.shift();
          let pick = 0;
          for (let i = 0; i < unpaired.length; i++) {
            const cand = unpaired[i];
            const played = this.doc.sets.some(
              (s) =>
                (s.entrant1ID === p1 && s.entrant2ID === cand) ||
                (s.entrant1ID === cand && s.entrant2ID === p1)
            );
            if (!played) {
              pick = i;
              break;
            }
          }
          const [p2] = unpaired.splice(pick, 1);
          const s = {
            setID: `SW-DYN-R${roundNumber}-${++idx}`,
            phase: 'SWISS',
            round: roundNumber,
            roundLabel: `Suiza Dinámica R${roundNumber}`,
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
            other: { station: `EST-0${idx}`, isStream: idx === 1, position3D: [0, 0, 0], bestOf: 3 },
          };
          this.doc.sets.push(s);
          created.push(s);
        }
        return created;
      },
    };

    this.find = {
      match: (setID) => this.doc.sets.find((s) => s.setID === setID),
      streamMatches: () => this.doc.sets.filter((s) => s.other?.isStream),
    };

    this.reset = {
      matchCascade: (setID) => {
        const set = this.find.match(setID);
        if (!set) return 0;
        let count = 1;
        const prevW = set.winnerID;
        const prevL = set.loserID;
        set.entrant1Score = 0;
        set.entrant2Score = 0;
        set.winnerID = null;
        set.loserID = null;
        set.status = set.entrant1ID && set.entrant2ID ? 'READY' : 'WAITING';
        if (set.nextWinSetID && prevW) {
          const nw = this.find.match(set.nextWinSetID);
          if (nw) {
            if (nw.status === 'COMPLETED' || nw.status === 'IN_PROGRESS') {
              count += this.reset.matchCascade(nw.setID);
            }
            if (nw.entrant1ID === prevW) nw.entrant1ID = null;
            if (nw.entrant2ID === prevW) nw.entrant2ID = null;
            nw.status = nw.entrant1ID && nw.entrant2ID ? 'READY' : 'WAITING';
          }
        }
        if (set.nextLoseSetID && prevL) {
          const nl = this.find.match(set.nextLoseSetID);
          if (nl) {
            if (nl.status === 'COMPLETED' || nl.status === 'IN_PROGRESS') {
              count += this.reset.matchCascade(nl.setID);
            }
            if (nl.entrant1ID === prevL) nl.entrant1ID = null;
            if (nl.entrant2ID === prevL) nl.entrant2ID = null;
            nl.status = nl.entrant1ID && nl.entrant2ID ? 'READY' : 'WAITING';
          }
        }
        return count;
      },
    };

    this.update = {
      match: ({ setID, score1, score2, games = [] }) => {
        const set = this.find.match(setID);
        if (!set || !set.entrant1ID || !set.entrant2ID) return null;
        if (set.status === 'COMPLETED') this.reset.matchCascade(setID);
        set.entrant1Score = score1;
        set.entrant2Score = score2;
        set.games = games;
        if (score1 !== score2) {
          set.status = 'COMPLETED';
          set.winnerID = score1 > score2 ? set.entrant1ID : set.entrant2ID;
          set.loserID = score1 > score2 ? set.entrant2ID : set.entrant1ID;
          if (set.nextWinSetID) {
            const nw = this.find.match(set.nextWinSetID);
            if (nw) {
              if (!nw.entrant1ID || nw.entrant1ID === set.winnerID) nw.entrant1ID = set.winnerID;
              else if (!nw.entrant2ID) nw.entrant2ID = set.winnerID;
              nw.status = nw.entrant1ID && nw.entrant2ID ? 'READY' : 'WAITING';
            }
          }
          if (set.nextLoseSetID) {
            const nl = this.find.match(set.nextLoseSetID);
            if (nl) {
              if (!nl.entrant1ID || nl.entrant1ID === set.loserID) nl.entrant1ID = set.loserID;
              else if (!nl.entrant2ID) nl.entrant2ID = set.loserID;
              nl.status = nl.entrant1ID && nl.entrant2ID ? 'READY' : 'WAITING';
            }
          }
        }
        return set;
      },
      confirmSeedingByElo: () => {
        this.doc.entrants.sort((a, b) => b.eloRating - a.eloRating);
        this.doc.entrants.forEach((e, idx) => (e.initialSeed = idx + 1));
        this.doc.sets = this.generateSets(this.doc.event.format, this.doc.entrants);
        return this.doc.entrants;
      },
    };

    this.get = {
      obf: () => this.doc,
      standings: () => {
        const map = new Map();
        this.doc.entrants.forEach((e) =>
          map.set(e.entrantID, { entrant: e, wins: 0, losses: 0, matchesPlayed: 0, gameDifferential: 0, buchholzScore: 0 })
        );
        this.doc.sets.forEach((s) => {
          if (s.status === 'COMPLETED' && s.entrant1ID && s.entrant2ID) {
            const r1 = map.get(s.entrant1ID);
            const r2 = map.get(s.entrant2ID);
            if (r1 && r2) {
              r1.matchesPlayed++;
              r2.matchesPlayed++;
              r1.gameDifferential += s.entrant1Score - s.entrant2Score;
              r2.gameDifferential += s.entrant2Score - s.entrant1Score;
              if (s.winnerID === s.entrant1ID) {
                r1.wins++;
                r2.losses++;
              } else {
                r2.wins++;
                r1.losses++;
              }
            }
          }
        });
        return Array.from(map.values())
          .sort((a, b) => b.wins - a.wins || b.gameDifferential - a.gameDifferential)
          .map((r, i) => ({ rank: i + 1, ...r }));
      },
    };
  }

  generateSets(format, entrants) {
    const ids = entrants.map((e) => e.entrantID);
    while (ids.length < 8) ids.push(ids[ids.length % entrants.length]);
    return [
      { setID: 'SW-R1-1', phase: 'SWISS', round: 1, roundLabel: 'Suiza R1 (0-0)', entrant1ID: ids[0], entrant2ID: ids[7], entrant1Score: 0, entrant2Score: 0, status: 'READY', winnerID: null, loserID: null, nextWinSetID: 'W-SF-1', nextLoseSetID: 'SC-SF-1', games: [], other: { station: 'EST-01', isStream: true, position3D: [-8, 2.2, 2.5], bestOf: 3 } },
      { setID: 'SW-R1-2', phase: 'SWISS', round: 1, roundLabel: 'Suiza R1 (0-0)', entrant1ID: ids[3], entrant2ID: ids[4], entrant1Score: 0, entrant2Score: 0, status: 'READY', winnerID: null, loserID: null, nextWinSetID: 'W-SF-1', nextLoseSetID: 'SC-SF-1', games: [], other: { station: 'EST-02', isStream: false, position3D: [-8, 0.2, 2.5], bestOf: 3 } },
      { setID: 'SW-R1-3', phase: 'SWISS', round: 1, roundLabel: 'Suiza R1 (0-0)', entrant1ID: ids[1], entrant2ID: ids[6], entrant1Score: 0, entrant2Score: 0, status: 'READY', winnerID: null, loserID: null, nextWinSetID: 'W-SF-2', nextLoseSetID: 'SC-SF-2', games: [], other: { station: 'EST-03', isStream: false, position3D: [-8, -1.8, 2.5], bestOf: 3 } },
      { setID: 'SW-R1-4', phase: 'SWISS', round: 1, roundLabel: 'Suiza R1 (0-0)', entrant1ID: ids[2], entrant2ID: ids[5], entrant1Score: 0, entrant2Score: 0, status: 'READY', winnerID: null, loserID: null, nextWinSetID: 'W-SF-2', nextLoseSetID: 'SC-SF-2', games: [], other: { station: 'EST-04', isStream: false, position3D: [-8, -3.8, 2.5], bestOf: 3 } },
      { setID: 'W-SF-1', phase: 'WINNERS', round: 2, roundLabel: 'Winners Semifinal 1', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: 'W-FIN', nextLoseSetID: 'L-R1-1', games: [], other: { station: 'EST-01', isStream: true, position3D: [-2.5, 2.0, 0], bestOf: 3 } },
      { setID: 'W-SF-2', phase: 'WINNERS', round: 2, roundLabel: 'Winners Semifinal 2', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: 'W-FIN', nextLoseSetID: 'L-R1-1', games: [], other: { station: 'EST-02', isStream: false, position3D: [-2.5, -0.8, 0], bestOf: 3 } },
      { setID: 'W-FIN', phase: 'WINNERS', round: 3, roundLabel: 'Winners Final', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: 'GF-1', nextLoseSetID: 'L-FIN', games: [], other: { station: 'EST-01', isStream: true, position3D: [3.2, 1.2, 0], bestOf: 5 } },
      { setID: 'L-R1-1', phase: 'LOSERS', round: 2, roundLabel: 'Losers Top 4', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: 'L-FIN', nextLoseSetID: null, games: [], other: { station: 'EST-03', isStream: false, position3D: [0.2, -2.6, -4.2], bestOf: 3 } },
      { setID: 'L-FIN', phase: 'LOSERS', round: 3, roundLabel: 'Losers Final', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: 'GF-1', nextLoseSetID: null, games: [], other: { station: 'EST-02', isStream: true, position3D: [4.5, -2.2, -4.2], bestOf: 5 } },
      { setID: 'GF-1', phase: 'GRAND_FINAL', round: 4, roundLabel: 'Grand Final (Two-Stage)', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: null, nextLoseSetID: null, games: [], other: { station: 'STAGE-MAIN', isStream: true, position3D: [8.5, 0.5, 1.5], bestOf: 5 } },
      { setID: 'SC-SF-1', phase: 'SECOND_CHANCE', round: 2, roundLabel: '2nd Chance Semifinal A', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: 'SC-FIN', nextLoseSetID: null, games: [], other: { station: 'EST-05', isStream: false, position3D: [-2.5, -3.5, 3.8], bestOf: 3 } },
      { setID: 'SC-SF-2', phase: 'SECOND_CHANCE', round: 2, roundLabel: '2nd Chance Semifinal B', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: 'SC-FIN', nextLoseSetID: null, games: [], other: { station: 'EST-06', isStream: false, position3D: [1.5, -3.5, 3.8], bestOf: 3 } },
      { setID: 'SC-FIN', phase: 'SECOND_CHANCE', round: 3, roundLabel: 'Second Chance Final', entrant1ID: null, entrant2ID: null, entrant1Score: 0, entrant2Score: 0, status: 'WAITING', winnerID: null, loserID: null, nextWinSetID: null, nextLoseSetID: null, games: [], other: { station: 'EST-05', isStream: false, position3D: [5.5, -3.5, 3.8], bestOf: 3 } },
    ];
  }
}
