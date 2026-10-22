// apps/api-fastify-mcp/src/server.ts
// Fase 2 — Servidor API REST & WebSockets en Fastify para Jerarquía (Org ➔ Torneo ➔ Evento) y Brackets OBF

import Fastify from 'fastify';
import { NexusBracketEngine, TournamentFormat } from '@nexus-grid/bracket-engine';
import { redisAccelerator } from './redis/acceleration.js';
import { deepSeekService } from './services/deepseek.service.js';

export const fastify = Fastify({ logger: true });
const engine = new NexusBracketEngine();

// 1. Obtener el árbol OBF v1.0 desde RedisJSON / Read-Aside (< 5ms)
fastify.get('/api/tournaments/:slug/obf', async (request) => {
  const { slug } = request.params as { slug: string };
  return redisAccelerator.readAside(
    `cache:tournament:${slug}`,
    [`tournament:${slug}`],
    async () => engine.get.obf()
  );
});

// 2. Cambiar formato de torneo (los 7 formatos del cuaderno)
fastify.post('/api/tournaments/:slug/format', async (request) => {
  const { slug } = request.params as { slug: string };
  const { format } = request.body as { format: TournamentFormat };
  const doc = engine.create.stage({
    format,
    entrants: engine.get.obf().entrants,
  });
  await redisAccelerator.saveOBFDocumentInRam(slug, doc);
  await redisAccelerator.invalidateByTag(`tournament:${slug}`);
  return { status: 'UPDATED', format, obf: doc };
});

// 3. Reportar marcador con Write-Behind BullMQ (< 5ms) y propagación automática
fastify.post('/api/sets/:setId/report', async (request) => {
  const { setId } = request.params as { setId: string };
  const { score1, score2, games } = request.body as {
    score1: number;
    score2: number;
    games?: [];
  };
  const updatedSet = engine.update.match({ setID: setId, score1, score2, games });
  const queueResult = await redisAccelerator.enqueueScoreWrite({
    tournamentSlug: engine.get.obf().event.tournamentSlug,
    setId,
    score1,
    score2,
    winnerId: updatedSet?.winnerID || null,
    games,
  });
  return { updatedSet, queueResult };
});

// 4. Verificación automática de captura de victoria con DeepSeek-VL
fastify.post('/api/sets/:setId/verify-vision', async (request) => {
  const { setId } = request.params as { setId: string };
  const { proofImageUrl } = request.body as { proofImageUrl: string };
  return deepSeekService.verifyProofScreenshot({ setId, proofImageUrl });
});
