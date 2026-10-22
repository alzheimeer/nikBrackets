// apps/web-frontend/src/store/useTournamentStore.ts
// Fase 1 — Gestión de Estado de Ultra-Baja Latencia con Zustand + @nexus-grid/bracket-engine

import {
  NexusBracketEngine,
  OBFDocument,
  OBFEntrant,
  SetGameSelection,
  TournamentFormat,
} from '@nexus-grid/bracket-engine';

const INITIAL_ENTRANTS: OBFEntrant[] = [
  { entrantID: 'P1', entrantTag: 'Niklauss#KR1', initialSeed: 1, eloRating: 2140, mainCharacter: 'Sergei Dragunov', country: 'CO', checkedIn: true },
  { entrantID: 'P2', entrantTag: 'ArslanAsh#PK', initialSeed: 2, eloRating: 2115, mainCharacter: 'Reina', country: 'PK', checkedIn: true },
  { entrantID: 'P3', entrantTag: 'Knee#KR', initialSeed: 3, eloRating: 2090, mainCharacter: 'Kazuya Mishima', country: 'KR', checkedIn: true },
  { entrantID: 'P4', entrantTag: 'MenaRD#DO', initialSeed: 4, eloRating: 2065, mainCharacter: 'King', country: 'DO', checkedIn: true },
  { entrantID: 'P5', entrantTag: 'Chikurin#JP', initialSeed: 5, eloRating: 2020, mainCharacter: 'Jin Kazama', country: 'JP', checkedIn: true },
  { entrantID: 'P6', entrantTag: 'AtifButt#PK', initialSeed: 6, eloRating: 1995, mainCharacter: 'Sergei Dragunov', country: 'PK', checkedIn: true },
  { entrantID: 'P7', entrantTag: 'CBM#KR', initialSeed: 7, eloRating: 1960, mainCharacter: 'Jin Kazama', country: 'KR', checkedIn: true },
  { entrantID: 'P8', entrantTag: 'Joka#UK', initialSeed: 8, eloRating: 1930, mainCharacter: 'Kazuya Mishima', country: 'UK', checkedIn: true },
];

export class TournamentStoreController {
  public engine: NexusBracketEngine;
  public selectedSetID: string | null = 'SW-R1-1';
  public activeRole: 'SUPER_ADMIN' | 'TOURNAMENT_DIRECTOR' | 'REFEREE' | 'STREAMER' | 'PAY_EDITOR' | 'PLAYER' = 'SUPER_ADMIN';
  public lanOfflineMode = false;

  constructor() {
    this.engine = new NexusBracketEngine();
    this.engine.create.stage({
      format: 'two_stage',
      entrants: INITIAL_ENTRANTS,
    });
  }

  public setFormat(format: TournamentFormat): OBFDocument {
    return this.engine.create.stage({
      format,
      entrants: this.engine.get.obf().entrants,
    });
  }

  public reportScore(setID: string, score1: number, score2: number, games: SetGameSelection[]) {
    return this.engine.update.match({ setID, score1, score2, games });
  }

  public resetCascade(setID: string) {
    return this.engine.reset.matchCascade(setID);
  }
}

export const tournamentStore = new TournamentStoreController();
