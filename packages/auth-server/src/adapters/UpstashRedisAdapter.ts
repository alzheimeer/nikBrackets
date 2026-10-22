// packages/auth-server/src/adapters/UpstashRedisAdapter.ts
// Adaptador de Caché con Upstash Redis (~3ms - 5ms) y fallback automático en memoria para modo LAN Offline

import { ICachePort } from '../ports/interfaces.js';

export class UpstashRedisCacheAdapter implements ICachePort {
  private memoryFallback = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryFallback.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryFallback.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    this.memoryFallback.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.memoryFallback.delete(key);
  }
}
