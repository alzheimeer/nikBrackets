// packages/bracket-engine/src/types/obf.ts
// Especificación completa del estándar Open Bracket Format (OBF v1.0) extendida para NEXUS GRID 3D (2026)

export type TournamentFormat =
  | 'two_stage'           // Fase 1: Clasificación Suiza (3 rondas mín.) ➔ Fase 2: Doble Eliminación + Second Chance
  | 'double_elimination'  // Winners Bracket + Losers Bracket + Grand Final (con Bracket Reset)
  | 'single_elimination'  // Eliminación directa + Partido por el 3er Puesto
  | 'swiss'               // Sistema Suizo por historial idéntico sin revanchas
  | 'round_robin'         // Todos contra todos (Algoritmo de Berger)
  | 'free_for_all'        // Salas multi-jugador (4-8 por lobby) con avance Top N
  | 'leaderboard';        // Clasificación continua por puntos o Time Trial

export type MatchState =
  | 'LOCKED'
  | 'WAITING'
  | 'READY'
  | 'IN_PROGRESS'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type BracketPhase =
  | 'SWISS'
  | 'ROUND_ROBIN'
  | 'WINNERS'
  | 'LOSERS'
  | 'GRAND_FINAL'
  | 'GRAND_FINAL_RESET'
  | 'SECOND_CHANCE'
  | 'THIRD_PLACE'
  | 'FFA_STAGE'
  | 'LEADERBOARD_STAGE';

export type GameGenre =
  | 'FIGHTING'
  | 'SHOOTER'
  | 'MOBA'
  | 'SPORTS'
  | 'TCG'
  | 'RACING'
  | 'OTHER';

export interface GameCharacterMeta {
  id: string;
  gameSlug: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  render3DUrl?: string;
}

export interface GameStageMeta {
  id: string;
  gameSlug: string;
  name: string;
  slug: string;
  imageUrl?: string;
  isLegal: boolean;
}

export interface SetGameSelection {
  gameNumber: number;
  character1Slug?: string;
  character2Slug?: string;
  stageSlug?: string;
  winnerEntrantID?: string | null;
  durationSeconds?: number;
}

export interface OBFEntrant {
  entrantID: string;
  entrantTag: string;
  initialSeed: number;
  eloRating: number;
  mainCharacter?: string;
  secondaryCharacter?: string;
  country?: string;
  teamName?: string;
  checkedIn?: boolean;
  isBye?: boolean;
  finalPlacement?: number;
}

export interface OBFSet {
  setID: string;
  phase: BracketPhase;
  round: number;
  roundLabel: string;
  bestOf: number;
  entrant1ID: string | null;
  entrant2ID: string | null;
  entrant1Score: number;
  entrant2Score: number;
  entrant1Forfeit?: boolean;
  entrant2Forfeit?: boolean;
  status: MatchState;
  winnerID: string | null;
  loserID: string | null;
  nextWinSetID: string | null;
  nextLoseSetID: string | null;
  games: SetGameSelection[];
  other: {
    station?: string;
    isStream?: boolean;
    position3D: [number, number, number];
    proofImageUrl?: string;
    aiVerifiedConfidence?: number;
    ffaEntrantIDs?: string[];
    ffaScores?: Record<string, number>;
  };
}

export interface OBFEventMetadata {
  id: string;
  organizationSlug: string;
  tournamentSlug: string;
  eventSlug: string;
  name: string;
  date: string;
  gameName: string;
  gameSlug: string;
  format: TournamentFormat;
  numberEntrants: number;
  guaranteedMinMatches: number;
  venueFee: number;
  entryFee: number;
  prizePool: number;
}

export interface OBFDocument {
  version: '1.0';
  standard: 'Open Bracket Format (OBF)';
  event: OBFEventMetadata;
  entrants: OBFEntrant[];
  sets: OBFSet[];
}

export interface StandingsRow {
  rank: number;
  entrant: OBFEntrant;
  matchesPlayed: number;
  wins: number;
  losses: number;
  gamesWon: number;
  gamesLost: number;
  gameDifferential: number;
  buchholzScore: number;
  guaranteedTargetMet: boolean;
}
