// packages/bracket-engine/tests/engine.test.mjs
// Suite de Pruebas Automatizadas para @nexus-grid/bracket-engine (OBF v1.0, Reset en Cascada y Emparejamiento Dinámico Suizo)

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NexusBracketEngine } from '../dist/index.js';

const MOCK_ENTRANTS = [
  { entrantID: 'P1', entrantTag: 'Niklauss#KR1', initialSeed: 1, eloRating: 2140, mainCharacter: 'Dragunov' },
  { entrantID: 'P2', entrantTag: 'ArslanAsh#PK', initialSeed: 2, eloRating: 2115, mainCharacter: 'Reina' },
  { entrantID: 'P3', entrantTag: 'Knee#KR', initialSeed: 3, eloRating: 2090, mainCharacter: 'Kazuya' },
  { entrantID: 'P4', entrantTag: 'MenaRD#DO', initialSeed: 4, eloRating: 2065, mainCharacter: 'King' },
  { entrantID: 'P5', entrantTag: 'Chikurin#JP', initialSeed: 5, eloRating: 2020, mainCharacter: 'Jin' },
  { entrantID: 'P6', entrantTag: 'AtifButt#PK', initialSeed: 6, eloRating: 1995, mainCharacter: 'Dragunov' },
  { entrantID: 'P7', entrantTag: 'CBM#KR', initialSeed: 7, eloRating: 1960, mainCharacter: 'Jin' },
  { entrantID: 'P8', entrantTag: 'Joka#UK', initialSeed: 8, eloRating: 1930, mainCharacter: 'Kazuya' },
];

test('1. Two-Stage Format garantiza >= 3 partidas mínimas, Winners/Losers y Second Chance en OBF v1.0', () => {
  const engine = new NexusBracketEngine({
    format: 'two_stage',
    entrants: MOCK_ENTRANTS,
  });
  const obf = engine.get.obf();
  assert.equal(obf.version, '1.0');
  assert.equal(obf.event.guaranteedMinMatches, 3);
  assert.ok(obf.sets.some((s) => s.phase === 'SECOND_CHANCE'));
});

test('2. Avance de ganadores y Reseteo en Cascada recursivo al editar un set previo', () => {
  const engine = new NexusBracketEngine({
    format: 'two_stage',
    entrants: MOCK_ENTRANTS,
  });

  engine.update.match({ setID: 'SW-R1-1', score1: 2, score2: 0 });
  engine.update.match({ setID: 'SW-R1-2', score1: 2, score2: 1 });

  const wSf1 = engine.find.match('W-SF-1');
  assert.equal(wSf1?.entrant1ID, 'P1');
  assert.equal(wSf1?.entrant2ID, 'P4');

  // Completamos la semifinal y luego corregimos SW-R1-1 -> debe resetear en cascada W-SF-1
  engine.update.match({ setID: 'W-SF-1', score1: 2, score2: 0 });
  assert.equal(engine.find.match('W-FIN')?.entrant1ID, 'P1');

  const count = engine.reset.matchCascade('SW-R1-1');
  assert.ok(count >= 2);
  assert.equal(engine.find.match('W-SF-1')?.status, 'WAITING');
  assert.equal(engine.find.match('W-FIN')?.entrant1ID, null);
});

test('3. Emparejamiento Dinámico Suizo Ronda a Ronda evita revanchas automáticamente', () => {
  const engine = new NexusBracketEngine({
    format: 'two_stage',
    entrants: MOCK_ENTRANTS,
  });

  engine.update.match({ setID: 'SW-R1-1', score1: 2, score2: 0 });
  engine.update.match({ setID: 'SW-R1-2', score1: 2, score2: 1 });
  engine.update.match({ setID: 'SW-R1-3', score1: 2, score2: 0 });
  engine.update.match({ setID: 'SW-R1-4', score1: 2, score2: 1 });

  const dynSets = engine.create.nextSwissRound(2);
  assert.equal(dynSets.length, 4);
  // Ninguna pareja en R2 puede repetir un enfrentamiento de R1
  for (const s of dynSets) {
    assert.notEqual(
      `${s.entrant1ID}-${s.entrant2ID}`,
      'P1-P8',
      'No debe repetir revancha P1 vs P8'
    );
  }
});
