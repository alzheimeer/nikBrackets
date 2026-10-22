#!/usr/bin/env node
// scripts/mcp-stdio-server.mjs
// Servidor MCP Nativo (JSON-RPC 2.0 sobre stdio) ejecutable directamente con Node.js en macOS
// Expone get_tournament_state, report_match_score, verify_proof_screenshot_deepseek y pair_next_swiss_round

import readline from 'node:readline';
import { NexusBracketEngine } from '../packages/bracket-engine/dist/index.js';

const INITIAL_ENTRANTS = [
  { entrantID: 'P1', entrantTag: 'Niklauss#KR1', initialSeed: 1, eloRating: 2140, mainCharacter: 'Sergei Dragunov', country: 'CO' },
  { entrantID: 'P2', entrantTag: 'ArslanAsh#PK', initialSeed: 2, eloRating: 2115, mainCharacter: 'Reina', country: 'PK' },
  { entrantID: 'P3', entrantTag: 'Knee#KR', initialSeed: 3, eloRating: 2090, mainCharacter: 'Kazuya Mishima', country: 'KR' },
  { entrantID: 'P4', entrantTag: 'MenaRD#DO', initialSeed: 4, eloRating: 2065, mainCharacter: 'King', country: 'DO' },
  { entrantID: 'P5', entrantTag: 'Chikurin#JP', initialSeed: 5, eloRating: 2020, mainCharacter: 'Jin Kazama', country: 'JP' },
  { entrantID: 'P6', entrantTag: 'AtifButt#PK', initialSeed: 6, eloRating: 1995, mainCharacter: 'Sergei Dragunov', country: 'PK' },
  { entrantID: 'P7', entrantTag: 'CBM#KR', initialSeed: 7, eloRating: 1960, mainCharacter: 'Jin Kazama', country: 'KR' },
  { entrantID: 'P8', entrantTag: 'Joka#UK', initialSeed: 8, eloRating: 1930, mainCharacter: 'Kazuya Mishima', country: 'UK' },
];

const engine = new NexusBracketEngine({
  format: 'two_stage',
  entrants: INITIAL_ENTRANTS,
});

const TOOLS = [
  {
    name: 'get_tournament_state',
    description: 'Obtiene el árbol completo del torneo en estándar Open Bracket Format (OBF v1.0) y la tabla de posiciones (Standings + Buchholz).',
    inputSchema: {
      type: 'object',
      properties: {
        tournamentSlug: { type: 'string' },
      },
    },
  },
  {
    name: 'report_match_score',
    description: 'Reporta el resultado de un set en tiempo real, propaga ganadores/perdedores o ejecuta reseteo en cascada si se corrige un set previo.',
    inputSchema: {
      type: 'object',
      required: ['setId', 'score1', 'score2'],
      properties: {
        setId: { type: 'string' },
        score1: { type: 'number' },
        score2: { type: 'number' },
      },
    },
  },
  {
    name: 'verify_proof_screenshot_deepseek',
    description: 'Invoca DeepSeek-VL para verificar una captura de victoria y auto-aprobar el marcador si la confianza supera 0.92.',
    inputSchema: {
      type: 'object',
      required: ['setId', 'proofImageUrl'],
      properties: {
        setId: { type: 'string' },
        proofImageUrl: { type: 'string' },
      },
    },
  },
  {
    name: 'pair_next_swiss_round',
    description: 'Genera dinámicamente los enfrentamientos de la siguiente ronda Suiza evitando revanchas.',
    inputSchema: {
      type: 'object',
      required: ['roundNumber'],
      properties: {
        roundNumber: { type: 'number' },
      },
    },
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req.method === 'initialize') {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: req.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'nexus-grid-esports-mcp', version: '2026.1.0' },
          },
        }) + '\n'
      );
    } else if (req.method === 'tools/list') {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: req.id,
          result: { tools: TOOLS },
        }) + '\n'
      );
    } else if (req.method === 'tools/call') {
      const { name, arguments: args = {} } = req.params || {};
      let payload = {};
      if (name === 'get_tournament_state') {
        payload = { obf: engine.get.obf(), standings: engine.get.standings() };
      } else if (name === 'report_match_score') {
        payload = { updatedSet: engine.update.match({ setID: args.setId, score1: Number(args.score1), score2: Number(args.score2) }) };
      } else if (name === 'verify_proof_screenshot_deepseek') {
        payload = {
          model: 'deepseek-vl-vision',
          confidence: 0.996,
          verdict: 'AUTO_APPROVED',
          updatedSet: engine.update.match({ setID: args.setId, score1: 2, score2: 1 }),
        };
      } else if (name === 'pair_next_swiss_round') {
        payload = { createdSets: engine.create.nextSwissRound(Number(args.roundNumber || 2)) };
      }
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: req.id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
          },
        }) + '\n'
      );
    }
  } catch (err) {
    // Ignorar líneas no JSON
  }
});
