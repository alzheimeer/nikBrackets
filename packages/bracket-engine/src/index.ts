// packages/bracket-engine/src/index.ts
// Fase 0.1 — @nexus-grid/bracket-engine
// Motor modular con submódulos independientes: create, update, reset, get, find, delete + OBF v1.0

export * from './types/obf.js';
export * from './formats/generators.js';

import {
  OBFDocument,
  OBFEntrant,
  OBFEventMetadata,
  OBFSet,
  SetGameSelection,
  StandingsRow,
  TournamentFormat,
} from './types/obf.js';
import { generateSetsByFormat, sortAndBalanceEntrants } from './formats/generators.js';

export class NexusBracketEngine {
  private doc: OBFDocument;
  private listeners: Array<(event: { type: string; setID?: string; format?: TournamentFormat }) => void> = [];

  constructor(initialDoc?: OBFDocument) {
    this.doc = initialDoc || {
      version: '1.0',
      standard: 'Open Bracket Format (OBF)',
      event: {
        id: 'ev-default',
        organizationSlug: 'evo-championship',
        tournamentSlug: 'evo-2026-vegas',
        eventSlug: 'tekken-8-pro',
        name: 'Tekken 8 — 1v1 Pro Circuit',
        date: '2026-10-22',
        gameName: 'Tekken 8',
        gameSlug: 'tekken-8',
        format: 'two_stage',
        numberEntrants: 0,
        guaranteedMinMatches: 3,
        venueFee: 15,
        entryFee: 10,
        prizePool: 25000,
      },
      entrants: [],
      sets: [],
    };
  }

  public on(eventName: 'entity.changed', listener: (event: { type: string; setID?: string; format?: TournamentFormat }) => void) {
    if (eventName === 'entity.changed') {
      this.listeners.push(listener);
    }
  }

  private emitChange(type: string, setID?: string) {
    for (const fn of this.listeners) {
      fn({ type, setID, format: this.doc.event.format });
    }
  }

  // =========================================================================
  // 1. SUBMÓDULO CREATE (create.stage, create.entrant)
  // =========================================================================
  public create = {
    stage: (params: {
      eventMeta?: Partial<OBFEventMetadata>;
      format: TournamentFormat;
      entrants: OBFEntrant[];
    }): OBFDocument => {
      const balanced = sortAndBalanceEntrants(params.entrants);
      this.doc.entrants = balanced;
      this.doc.event = {
        ...this.doc.event,
        ...params.eventMeta,
        format: params.format,
        numberEntrants: balanced.length,
        guaranteedMinMatches: params.format === 'two_stage' || params.format === 'swiss' || params.format === 'round_robin' ? 3 : 2,
      };
      this.doc.sets = generateSetsByFormat(params.format, balanced);
      this.emitChange('stage.created');
      return this.doc;
    },

    entrant: (entrant: OBFEntrant): OBFEntrant[] => {
      this.doc.entrants.push(entrant);
      this.doc.event.numberEntrants = this.doc.entrants.length;
      this.doc.sets = generateSetsByFormat(this.doc.event.format, this.doc.entrants);
      this.emitChange('entrant.added');
      return this.doc.entrants;
    },
  };

  // =========================================================================
  // 2. SUBMÓDULO FIND (find.match, find.nextMatches, find.streamMatches)
  // =========================================================================
  public find = {
    match: (setID: string): OBFSet | undefined => {
      return this.doc.sets.find((s) => s.setID === setID);
    },

    nextMatches: (setID: string): { nextWin?: OBFSet; nextLose?: OBFSet } => {
      const current = this.find.match(setID);
      if (!current) return {};
      return {
        nextWin: current.nextWinSetID ? this.find.match(current.nextWinSetID) : undefined,
        nextLose: current.nextLoseSetID ? this.find.match(current.nextLoseSetID) : undefined,
      };
    },

    streamMatches: (): OBFSet[] => {
      return this.doc.sets.filter((s) => Boolean(s.other.isStream));
    },

    matchesByEntrant: (entrantID: string): OBFSet[] => {
      return this.doc.sets.filter((s) => s.entrant1ID === entrantID || s.entrant2ID === entrantID);
    },
  };

  // =========================================================================
  // 3. SUBMÓDULO UPDATE (update.match, update.forfeit, update.seedingByElo)
  // =========================================================================
  public update = {
    match: (params: {
      setID: string;
      score1: number;
      score2: number;
      games?: SetGameSelection[];
      proofImageUrl?: string;
      aiVerifiedConfidence?: number;
    }): OBFSet | null => {
      const set = this.find.match(params.setID);
      if (!set || !set.entrant1ID || !set.entrant2ID) return null;

      // Si el set ya estaba completado, aplicamos reseteo en cascada antes de aplicar el nuevo marcador
      if (set.status === 'COMPLETED') {
        this.reset.matchCascade(params.setID);
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
        this.propagateWinnerAndLoser(set);
      } else {
        set.status = params.score1 > 0 || params.score2 > 0 ? 'IN_PROGRESS' : 'READY';
        set.winnerID = null;
        set.loserID = null;
      }

      this.emitChange('match.updated', set.setID);
      return set;
    },

    forfeit: (setID: string, forfeitedEntrantID: string): OBFSet | null => {
      const set = this.find.match(setID);
      if (!set || !set.entrant1ID || !set.entrant2ID) return null;
      const isP1 = set.entrant1ID === forfeitedEntrantID;
      set.entrant1Forfeit = isP1;
      set.entrant2Forfeit = !isP1;
      return this.update.match({
        setID,
        score1: isP1 ? 0 : 2,
        score2: isP1 ? 2 : 0,
      });
    },

    confirmSeedingByElo: (): OBFEntrant[] => {
      this.doc.entrants.sort((a, b) => b.eloRating - a.eloRating);
      this.doc.entrants.forEach((e, idx) => {
        e.initialSeed = idx + 1;
      });
      this.doc.sets = generateSetsByFormat(this.doc.event.format, this.doc.entrants);
      this.emitChange('seeding.updated');
      return this.doc.entrants;
    },
  };

  // =========================================================================
  // 4. SUBMÓDULO RESET (reset.matchCascade, reset.stage)
  // =========================================================================
  public reset = {
    matchCascade: (setID: string): number => {
      const set = this.find.match(setID);
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
        const nextW = this.find.match(set.nextWinSetID);
        if (nextW) {
          if (nextW.status === 'COMPLETED' || nextW.status === 'IN_PROGRESS') {
            count += this.reset.matchCascade(nextW.setID);
          }
          if (nextW.entrant1ID === prevWinner) nextW.entrant1ID = null;
          if (nextW.entrant2ID === prevWinner) nextW.entrant2ID = null;
          nextW.status = nextW.entrant1ID && nextW.entrant2ID ? 'READY' : 'WAITING';
        }
      }

      if (set.nextLoseSetID && prevLoser) {
        const nextL = this.find.match(set.nextLoseSetID);
        if (nextL) {
          if (nextL.status === 'COMPLETED' || nextL.status === 'IN_PROGRESS') {
            count += this.reset.matchCascade(nextL.setID);
          }
          if (nextL.entrant1ID === prevLoser) nextL.entrant1ID = null;
          if (nextL.entrant2ID === prevLoser) nextL.entrant2ID = null;
          nextL.status = nextL.entrant1ID && nextL.entrant2ID ? 'READY' : 'WAITING';
        }
      }

      this.emitChange('match.reset_cascade', setID);
      return count;
    },

    stage: (): OBFDocument => {
      this.doc.sets = generateSetsByFormat(this.doc.event.format, this.doc.entrants);
      this.emitChange('stage.reset');
      return this.doc;
    },
  };

  // =========================================================================
  // 5. SUBMÓDULO GET (get.obf, get.standings, get.seeding)
  // =========================================================================
  public get = {
    obf: (): OBFDocument => this.doc,

    seeding: (): OBFEntrant[] => sortAndBalanceEntrants(this.doc.entrants),

    standings: (): StandingsRow[] => {
      const map = new Map<string, Omit<StandingsRow, 'rank'>>();
      for (const e of this.doc.entrants) {
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

      for (const s of this.doc.sets) {
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

      // Calcular Buchholz y meta de 3 partidas mínimas
      for (const [entrantID, row] of map.entries()) {
        const playedSets = this.find.matchesByEntrant(entrantID).filter((s) => s.status === 'COMPLETED');
        let buchholz = 0;
        for (const ps of playedSets) {
          const oppID = ps.entrant1ID === entrantID ? ps.entrant2ID : ps.entrant1ID;
          if (oppID && map.has(oppID)) {
            buchholz += map.get(oppID)!.wins;
          }
        }
        row.buchholzScore = buchholz;
        row.guaranteedTargetMet = row.matchesPlayed >= this.doc.event.guaranteedMinMatches;
      }

      const sorted = Array.from(map.values()).sort(
        (a, b) =>
          b.wins - a.wins ||
          b.buchholzScore - a.buchholzScore ||
          b.gameDifferential - a.gameDifferential ||
          a.entrant.initialSeed - b.entrant.initialSeed
      );

      return sorted.map((item, index) => ({
        rank: index + 1,
        ...item,
      }));
    },
  };

  // =========================================================================
  // 6. SUBMÓDULO DELETE (delete.stage)
  // =========================================================================
  public delete = {
    stage: (): void => {
      this.doc.sets = [];
      this.emitChange('stage.deleted');
    },
  };

  private propagateWinnerAndLoser(set: OBFSet) {
    if (set.nextWinSetID && set.winnerID) {
      const nextW = this.find.match(set.nextWinSetID);
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
      const nextL = this.find.match(set.nextLoseSetID);
      if (nextL) {
        if (!nextL.entrant1ID || nextL.entrant1ID === set.loserID) {
          nextL.entrant1ID = set.loserID;
        } else if (!nextL.entrant2ID && nextL.entrant1ID !== set.loserID) {
          nextL.entrant2ID = set.loserID;
        }
        nextL.status = nextL.entrant1ID && nextL.entrant2ID ? 'READY' : 'WAITING';
      }
    }
  }
}
