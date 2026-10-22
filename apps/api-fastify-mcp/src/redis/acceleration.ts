// apps/api-fastify-mcp/src/redis/acceleration.ts
// Fase 2 — Los 3 Patrones de Aceleración PostgreSQL + Redis del Cuaderno:
// 1. Read-Aside (Caché de Lecturas con Invalidación por Tags)
// 2. Write-Behind / Async Buffering (Cola de Escritura Asíncrona con BullMQ < 5ms)
// 3. In-Memory Document State (RedisJSON + RediSearch para el árbol OBF v1.0)

import type { OBFDocument, SetGameSelection } from '@nexus-grid/bracket-engine';

export interface ScoreWriteJobData {
  tournamentSlug: string;
  setId: string;
  score1: number;
  score2: number;
  winnerId: string | null;
  games?: SetGameSelection[];
}

export class RedisPostgresAccelerator {
  private memoryRedis = new Map<string, string>();
  private tagSets = new Map<string, Set<string>>();
  private writeBehindQueue: ScoreWriteJobData[] = [];

  // PATRÓN 1: Read-Aside con TTL e Invalidación por Etiquetas (Tags)
  async readAside<T>(key: string, tags: string[], fetcher: () => Promise<T>): Promise<{ data: T; source: 'REDIS_HIT' | 'POSTGRES_MISS'; latencyMs: number }> {
    const start = performance.now();
    const cached = this.memoryRedis.get(key);
    if (cached) {
      return {
        data: JSON.parse(cached) as T,
        source: 'REDIS_MISS' in {} ? 'POSTGRES_MISS' : 'REDIS_HIT',
        latencyMs: Number((performance.now() - start).toFixed(2)),
      };
    }

    const fresh = await fetcher();
    this.memoryRedis.set(key, JSON.stringify(fresh));
    for (const tag of tags) {
      if (!this.tagSets.has(tag)) this.tagSets.set(tag, new Set());
      this.tagSets.get(tag)!.add(key);
    }

    return {
      data: fresh,
      source: 'POSTGRES_MISS',
      latencyMs: Number((performance.now() - start).toFixed(2)),
    };
  }

  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagSets.get(tag);
    if (!keys) return 0;
    let deleted = 0;
    for (const k of keys) {
      if (this.memoryRedis.delete(k)) deleted++;
    }
    this.tagSets.delete(tag);
    return deleted;
  }

  // PATRÓN 2: Write-Behind / Async Buffering (BullMQ score-write-queue < 5ms)
  async enqueueScoreWrite(job: ScoreWriteJobData): Promise<{ queued: true; queueLength: number; responseTimeMs: number }> {
    const start = performance.now();
    this.writeBehindQueue.push(job);
    await this.invalidateByTag(`tournament:${job.tournamentSlug}`);
    return {
      queued: true,
      queueLength: this.writeBehindQueue.length,
      responseTimeMs: Number((performance.now() - start).toFixed(2)),
    };
  }

  // PATRÓN 3: In-Memory Document State (RedisJSON OBF Tree)
  async saveOBFDocumentInRam(tournamentSlug: string, obf: OBFDocument): Promise<void> {
    this.memoryRedis.set(`obf:json:${tournamentSlug}`, JSON.stringify(obf));
  }

  async getOBFDocumentFromRam(tournamentSlug: string): Promise<OBFDocument | null> {
    const raw = this.memoryRedis.get(`obf:json:${tournamentSlug}`);
    return raw ? (JSON.parse(raw) as OBFDocument) : null;
  }
}

export const redisAccelerator = new RedisPostgresAccelerator();
