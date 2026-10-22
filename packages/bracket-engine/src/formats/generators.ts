// packages/bracket-engine/src/formats/generators.ts
// Generadores matemáticos para los 7 formatos del cuaderno Software de Gestión de Esports 2026

import { OBFEntrant, OBFSet, TournamentFormat } from '../types/obf.js';

function createBaseSet(
  setID: string,
  phase: OBFSet['phase'],
  round: number,
  roundLabel: string,
  entrant1ID: string | null,
  entrant2ID: string | null,
  nextWinSetID: string | null,
  nextLoseSetID: string | null,
  station: string,
  isStream: boolean,
  position3D: [number, number, number],
  bestOf = 3
): OBFSet {
  const ready = Boolean(entrant1ID && entrant2ID);
  return {
    setID,
    phase,
    round,
    roundLabel,
    bestOf,
    entrant1ID,
    entrant2ID,
    entrant1Score: 0,
    entrant2Score: 0,
    status: ready ? 'READY' : 'WAITING',
    winnerID: null,
    loserID: null,
    nextWinSetID,
    nextLoseSetID,
    games: [],
    other: {
      station,
      isStream,
      position3D,
    },
  };
}

/**
 * Balancea participantes por seeding estándar (1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6)
 */
export function sortAndBalanceEntrants(entrants: OBFEntrant[]): OBFEntrant[] {
  return [...entrants].sort((a, b) => a.initialSeed - b.initialSeed);
}

/**
 * 1. FORMATO ESTRELLA DEL CUADERNO: Two-Stage (Garantía de Mínimo 3 Partidas por Jugador)
 *    - Fase 1: Clasificación Suiza (3 Rondas garantizadas, sin eliminaciones)
 *    - Fase 2A: Playoffs Doble Eliminación (Winners + Losers + Grand Final)
 *    - Fase 2B: Second Chance Bracket (Cuadro de consolación para puestos 5° a 8°)
 */
export function generateTwoStageBracket(entrants: OBFEntrant[]): OBFSet[] {
  const seeded = sortAndBalanceEntrants(entrants);
  const ids = seeded.map((e) => e.entrantID);
  while (ids.length < 8) ids.push(null as unknown as string);

  return [
    // Fase 1: Rondas Clasificatorias Suizas (Z = +2.8)
    createBaseSet('SW-R1-1', 'SWISS', 1, 'Suiza R1 (0-0)', ids[0], ids[7], 'W-SF-1', 'SC-SF-1', 'EST-01', true, [-8.5, 2.6, 2.8]),
    createBaseSet('SW-R1-2', 'SWISS', 1, 'Suiza R1 (0-0)', ids[3], ids[4], 'W-SF-1', 'SC-SF-1', 'EST-02', false, [-8.5, 0.8, 2.8]),
    createBaseSet('SW-R1-3', 'SWISS', 1, 'Suiza R1 (0-0)', ids[1], ids[6], 'W-SF-2', 'SC-SF-2', 'EST-03', false, [-8.5, -1.0, 2.8]),
    createBaseSet('SW-R1-4', 'SWISS', 1, 'Suiza R1 (0-0)', ids[2], ids[5], 'W-SF-2', 'SC-SF-2', 'EST-04', false, [-8.5, -2.8, 2.8]),

    // Fase 2A: Playoffs Doble Eliminación — Winners Bracket (Z = 0)
    createBaseSet('W-SF-1', 'WINNERS', 2, 'Winners Semifinal A', null, null, 'W-FIN', 'L-R1-1', 'EST-01', true, [-2.5, 1.8, 0]),
    createBaseSet('W-SF-2', 'WINNERS', 2, 'Winners Semifinal B', null, null, 'W-FIN', 'L-R1-1', 'EST-02', false, [-2.5, -0.8, 0]),
    createBaseSet('W-FIN', 'WINNERS', 3, 'Winners Final', null, null, 'GF-1', 'L-FIN', 'EST-01', true, [3.0, 0.8, 0], 5),

    // Fase 2A: Playoffs Doble Eliminación — Losers Bracket (Z = -4.5)
    createBaseSet('L-R1-1', 'LOSERS', 2, 'Losers Top 4', null, null, 'L-FIN', null, 'EST-03', false, [0.0, -2.4, -4.5]),
    createBaseSet('L-FIN', 'LOSERS', 3, 'Losers Final', null, null, 'GF-1', null, 'EST-02', true, [4.5, -2.0, -4.5], 5),

    // Grand Final + Bracket Reset (Z = +1.5)
    createBaseSet('GF-1', 'GRAND_FINAL', 4, 'Grand Final (Two-Stage)', null, null, 'GF-RESET', null, 'STAGE-MAIN', true, [8.5, 0.4, 1.5], 5),
    createBaseSet('GF-RESET', 'GRAND_FINAL_RESET', 5, 'Grand Final Reset (Si gana Losers)', null, null, null, null, 'STAGE-MAIN', true, [11.8, 0.4, 1.5], 5),

    // Fase 2B: Second Chance Bracket (Consolación garantizando ≥3 partidas, Z = +4.2)
    createBaseSet('SC-SF-1', 'SECOND_CHANCE', 2, 'Second Chance Semifinal A', null, null, 'SC-FIN', 'SC-3RD', 'EST-05', false, [-2.5, -3.4, 4.2]),
    createBaseSet('SC-SF-2', 'SECOND_CHANCE', 2, 'Second Chance Semifinal B', null, null, 'SC-FIN', 'SC-3RD', 'EST-06', false, [1.0, -3.4, 4.2]),
    createBaseSet('SC-FIN', 'SECOND_CHANCE', 3, 'Second Chance Grand Final', null, null, null, null, 'EST-05', false, [5.0, -3.0, 4.2]),
    createBaseSet('SC-3RD', 'SECOND_CHANCE', 3, 'Second Chance Ronda 3 (Garantía 3 Sets)', null, null, null, null, 'EST-06', false, [5.0, -4.6, 4.2]),
  ];
}

/**
 * 2. FORMATO DOBLE ELIMINACIÓN (Winners + Losers + Grand Final + Reset)
 */
export function generateDoubleEliminationBracket(entrants: OBFEntrant[]): OBFSet[] {
  const seeded = sortAndBalanceEntrants(entrants);
  const ids = seeded.map((e) => e.entrantID);
  while (ids.length < 8) ids.push(null as unknown as string);

  return [
    // Winners R1 (Cuartos)
    createBaseSet('DE-WQF1', 'WINNERS', 1, 'Winners Cuartos 1', ids[0], ids[7], 'DE-WSF1', 'DE-LR1-1', 'EST-01', true, [-7.5, 3.0, 0]),
    createBaseSet('DE-WQF2', 'WINNERS', 1, 'Winners Cuartos 2', ids[3], ids[4], 'DE-WSF1', 'DE-LR1-1', 'EST-02', false, [-7.5, 1.0, 0]),
    createBaseSet('DE-WQF3', 'WINNERS', 1, 'Winners Cuartos 3', ids[1], ids[6], 'DE-WSF2', 'DE-LR1-2', 'EST-03', false, [-7.5, -1.0, 0]),
    createBaseSet('DE-WQF4', 'WINNERS', 1, 'Winners Cuartos 4', ids[2], ids[5], 'DE-WSF2', 'DE-LR1-2', 'EST-04', false, [-7.5, -3.0, 0]),

    // Winners Semifinales & Final
    createBaseSet('DE-WSF1', 'WINNERS', 2, 'Winners Semifinal A', null, null, 'DE-WF', 'DE-LR2-1', 'EST-01', true, [-2.0, 2.0, 0]),
    createBaseSet('DE-WSF2', 'WINNERS', 2, 'Winners Semifinal B', null, null, 'DE-WF', 'DE-LR2-2', 'EST-02', false, [-2.0, -1.5, 0]),
    createBaseSet('DE-WF', 'WINNERS', 3, 'Winners Final', null, null, 'DE-GF', 'DE-LF', 'EST-01', true, [3.2, 0.5, 0], 5),

    // Losers Bracket (Plano Z = -4.5)
    createBaseSet('DE-LR1-1', 'LOSERS', 1, 'Losers Ronda 1A', null, null, 'DE-LR2-1', null, 'EST-05', false, [-5.0, -1.8, -4.5]),
    createBaseSet('DE-LR1-2', 'LOSERS', 1, 'Losers Ronda 1B', null, null, 'DE-LR2-2', null, 'EST-06', false, [-5.0, -3.8, -4.5]),
    createBaseSet('DE-LR2-1', 'LOSERS', 2, 'Losers Cuartos A', null, null, 'DE-LSF', null, 'EST-05', false, [-0.5, -1.8, -4.5]),
    createBaseSet('DE-LR2-2', 'LOSERS', 2, 'Losers Cuartos B', null, null, 'DE-LSF', null, 'EST-06', false, [-0.5, -3.8, -4.5]),
    createBaseSet('DE-LSF', 'LOSERS', 3, 'Losers Semifinal', null, null, 'DE-LF', null, 'EST-03', false, [3.2, -2.8, -4.5]),
    createBaseSet('DE-LF', 'LOSERS', 4, 'Losers Final', null, null, 'DE-GF', null, 'EST-02', true, [6.2, -2.0, -3.0], 5),

    // Grand Final
    createBaseSet('DE-GF', 'GRAND_FINAL', 5, 'Grand Final', null, null, null, null, 'STAGE-MAIN', true, [9.0, 0.2, 1.0], 5),
  ];
}

/**
 * 3. FORMATO ELIMINACIÓN SIMPLE (con partido de consolación por el 3er Puesto)
 */
export function generateSingleEliminationBracket(entrants: OBFEntrant[]): OBFSet[] {
  const seeded = sortAndBalanceEntrants(entrants);
  const ids = seeded.map((e) => e.entrantID);
  while (ids.length < 8) ids.push(null as unknown as string);

  return [
    createBaseSet('SE-QF1', 'WINNERS', 1, 'Cuartos de Final 1', ids[0], ids[7], 'SE-SF1', null, 'EST-01', true, [-6.5, 3.0, 0]),
    createBaseSet('SE-QF2', 'WINNERS', 1, 'Cuartos de Final 2', ids[3], ids[4], 'SE-SF1', null, 'EST-02', false, [-6.5, 1.0, 0]),
    createBaseSet('SE-QF3', 'WINNERS', 1, 'Cuartos de Final 3', ids[1], ids[6], 'SE-SF2', null, 'EST-03', false, [-6.5, -1.0, 0]),
    createBaseSet('SE-QF4', 'WINNERS', 1, 'Cuartos de Final 4', ids[2], ids[5], 'SE-SF2', null, 'EST-04', false, [-6.5, -3.0, 0]),
    createBaseSet('SE-SF1', 'WINNERS', 2, 'Semifinal A', null, null, 'SE-FIN', 'SE-3RD', 'EST-01', true, [-0.5, 1.8, 0]),
    createBaseSet('SE-SF2', 'WINNERS', 2, 'Semifinal B', null, null, 'SE-FIN', 'SE-3RD', 'EST-02', false, [-0.5, -1.8, 0]),
    createBaseSet('SE-FIN', 'GRAND_FINAL', 3, 'Gran Final', null, null, null, null, 'STAGE-MAIN', true, [5.8, 0.8, 1.0], 5),
    createBaseSet('SE-3RD', 'THIRD_PLACE', 3, 'Final por el 3er Puesto', null, null, null, null, 'EST-03', false, [5.8, -2.5, -2.5], 3),
  ];
}

/**
 * 4. FORMATO SISTEMA SUIZO PURO (3 Rondas por historial similar: 0-0 -> 1-0 / 0-1 -> 2-0 / 1-1 / 0-2)
 */
export function generateSwissBracket(entrants: OBFEntrant[]): OBFSet[] {
  const seeded = sortAndBalanceEntrants(entrants);
  const ids = seeded.map((e) => e.entrantID);
  while (ids.length < 8) ids.push(null as unknown as string);

  return [
    // Ronda 1 (0-0)
    createBaseSet('SW-1A', 'SWISS', 1, 'Suiza R1 (0-0)', ids[0], ids[4], 'SW-2H1', 'SW-2L1', 'EST-01', true, [-6.5, 2.8, 0]),
    createBaseSet('SW-1B', 'SWISS', 1, 'Suiza R1 (0-0)', ids[1], ids[5], 'SW-2H1', 'SW-2L1', 'EST-02', false, [-6.5, 0.9, 0]),
    createBaseSet('SW-1C', 'SWISS', 1, 'Suiza R1 (0-0)', ids[2], ids[6], 'SW-2H2', 'SW-2L2', 'EST-03', false, [-6.5, -0.9, 0]),
    createBaseSet('SW-1D', 'SWISS', 1, 'Suiza R1 (0-0)', ids[3], ids[7], 'SW-2H2', 'SW-2L2', 'EST-04', false, [-6.5, -2.8, 0]),

    // Ronda 2 (1-0 High / 0-1 Low)
    createBaseSet('SW-2H1', 'SWISS', 2, 'Suiza R2 High (1-0)', null, null, 'SW-3TOP', 'SW-3MID1', 'EST-01', true, [0, 2.2, 0.5]),
    createBaseSet('SW-2H2', 'SWISS', 2, 'Suiza R2 High (1-0)', null, null, 'SW-3TOP', 'SW-3MID2', 'EST-02', false, [0, 0.4, 0.5]),
    createBaseSet('SW-2L1', 'SWISS', 2, 'Suiza R2 Low (0-1)', null, null, 'SW-3MID1', 'SW-3LOW', 'EST-03', false, [0, -1.4, -2.5]),
    createBaseSet('SW-2L2', 'SWISS', 2, 'Suiza R2 Low (0-1)', null, null, 'SW-3MID2', 'SW-3LOW', 'EST-04', false, [0, -3.2, -2.5]),

    // Ronda 3 (2-0 Invictos / 1-1 Clasificación / 0-2 Supervivencia)
    createBaseSet('SW-3TOP', 'GRAND_FINAL', 3, 'Suiza R3 Invictos (2-0)', null, null, null, null, 'STAGE-MAIN', true, [6.5, 2.2, 1.5]),
    createBaseSet('SW-3MID1', 'SWISS', 3, 'Suiza R3 Decider A (1-1)', null, null, null, null, 'EST-02', false, [6.5, 0.4, 0]),
    createBaseSet('SW-3MID2', 'SWISS', 3, 'Suiza R3 Decider B (1-1)', null, null, null, null, 'EST-03', false, [6.5, -1.4, 0]),
    createBaseSet('SW-3LOW', 'SECOND_CHANCE', 3, 'Suiza R3 Honor (0-2)', null, null, null, null, 'EST-04', false, [6.5, -3.2, -2.5]),
  ];
}

/**
 * 5. FORMATO ROUND ROBIN (Método del Círculo / Tablas de Berger — Todos contra Todos)
 */
export function generateRoundRobinBracket(entrants: OBFEntrant[]): OBFSet[] {
  const seeded = sortAndBalanceEntrants(entrants).slice(0, 4); // Grupo de 4 = 3 jornadas (3 partidas por jugador)
  const ids = seeded.map((e) => e.entrantID);
  while (ids.length < 4) ids.push(null as unknown as string);

  return [
    createBaseSet('RR-J1-A', 'ROUND_ROBIN', 1, 'Jornada 1 • Grupo Único', ids[0], ids[3], null, null, 'EST-01', true, [-6.0, 1.8, 0]),
    createBaseSet('RR-J1-B', 'ROUND_ROBIN', 1, 'Jornada 1 • Grupo Único', ids[1], ids[2], null, null, 'EST-02', false, [-6.0, -1.2, 0]),
    createBaseSet('RR-J2-A', 'ROUND_ROBIN', 2, 'Jornada 2 • Grupo Único', ids[0], ids[2], null, null, 'EST-01', true, [0.0, 1.8, 0.5]),
    createBaseSet('RR-J2-B', 'ROUND_ROBIN', 2, 'Jornada 2 • Grupo Único', ids[3], ids[1], null, null, 'EST-02', false, [0.0, -1.2, 0.5]),
    createBaseSet('RR-J3-A', 'ROUND_ROBIN', 3, 'Jornada 3 • Definición', ids[0], ids[1], null, null, 'STAGE-MAIN', true, [6.0, 1.8, 1.0]),
    createBaseSet('RR-J3-B', 'ROUND_ROBIN', 3, 'Jornada 3 • Definición', ids[2], ids[3], null, null, 'EST-03', false, [6.0, -1.2, 1.0]),
  ];
}

/**
 * 6. FORMATO FREE-FOR-ALL (FFA — Salas Multi-Jugador con Avance Top 2)
 */
export function generateFreeForAllBracket(entrants: OBFEntrant[]): OBFSet[] {
  const seeded = sortAndBalanceEntrants(entrants);
  const ids = seeded.map((e) => e.entrantID);
  while (ids.length < 8) ids.push(null as unknown as string);

  const lobbyA = createBaseSet('FFA-LOBBY-A', 'FFA_STAGE', 1, 'Lobby A (4 Jugadores • Top 2 Avanzan)', ids[0], ids[3], 'FFA-FINAL', 'FFA-LCQ', 'LOBBY-01', true, [-5.5, 2.0, 0]);
  lobbyA.other.ffaEntrantIDs = [ids[0], ids[3], ids[4], ids[7]].filter(Boolean);

  const lobbyB = createBaseSet('FFA-LOBBY-B', 'FFA_STAGE', 1, 'Lobby B (4 Jugadores • Top 2 Avanzan)', ids[1], ids[2], 'FFA-FINAL', 'FFA-LCQ', 'LOBBY-02', false, [-5.5, -1.5, 0]);
  lobbyB.other.ffaEntrantIDs = [ids[1], ids[2], ids[5], ids[6]].filter(Boolean);

  const lcq = createBaseSet('FFA-LCQ', 'LOSERS', 2, 'Last Chance Lobby FFA', null, null, 'FFA-FINAL', null, 'LOBBY-02', false, [0.5, -2.2, -3.5]);
  const finalLobby = createBaseSet('FFA-FINAL', 'GRAND_FINAL', 3, 'Grand Final Lobby FFA', null, null, null, null, 'STAGE-MAIN', true, [6.5, 0.5, 1.2]);

  return [lobbyA, lobbyB, lcq, finalLobby];
}

/**
 * 7. FORMATO LEADERBOARD / TIME TRIAL (Clasificación por Tiempos / Puntuación Continua)
 */
export function generateLeaderboardBracket(entrants: OBFEntrant[]): OBFSet[] {
  const seeded = sortAndBalanceEntrants(entrants);
  const ids = seeded.map((e) => e.entrantID);
  while (ids.length < 4) ids.push(null as unknown as string);

  return [
    createBaseSet('LB-Q1', 'LEADERBOARD_STAGE', 1, 'Qualifying Heat 1 (Time Attack)', ids[0], ids[3], 'LB-SUPERPOLE', 'LB-CONSOLATION', 'SIM-RIG-01', true, [-4.5, 2.0, 0]),
    createBaseSet('LB-Q2', 'LEADERBOARD_STAGE', 1, 'Qualifying Heat 2 (Time Attack)', ids[1], ids[2], 'LB-SUPERPOLE', 'LB-CONSOLATION', 'SIM-RIG-02', false, [-4.5, -1.5, 0]),
    createBaseSet('LB-SUPERPOLE', 'GRAND_FINAL', 2, 'Super Pole Shootout Final', null, null, null, null, 'SIM-MAIN', true, [4.5, 1.2, 1.2]),
    createBaseSet('LB-CONSOLATION', 'SECOND_CHANCE', 2, 'Time Trial B-Final', null, null, null, null, 'SIM-RIG-02', false, [4.5, -2.0, -2.0]),
  ];
}

export function generateSetsByFormat(format: TournamentFormat, entrants: OBFEntrant[]): OBFSet[] {
  switch (format) {
    case 'two_stage':
      return generateTwoStageBracket(entrants);
    case 'double_elimination':
      return generateDoubleEliminationBracket(entrants);
    case 'single_elimination':
      return generateSingleEliminationBracket(entrants);
    case 'swiss':
      return generateSwissBracket(entrants);
    case 'round_robin':
      return generateRoundRobinBracket(entrants);
    case 'free_for_all':
      return generateFreeForAllBracket(entrants);
    case 'leaderboard':
      return generateLeaderboardBracket(entrants);
    default:
      return generateTwoStageBracket(entrants);
  }
}
