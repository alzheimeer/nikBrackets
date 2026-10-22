// packages/auth-server/src/ports/interfaces.ts
// Fase 0.3 — Arquitectura Hexagonal (Ports & Adapters) de alzheimeer/authLive adaptada a Esports

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TOURNAMENT_DIRECTOR'
  | 'REFEREE'
  | 'STREAMER'
  | 'PAY_EDITOR'
  | 'PLAYER';

export type TokenScope =
  | 'READ_ONLY'       // Overlays OBS / Stream Deck
  | 'SCORE_REPORTER'  // Árbitros móviles en estación
  | 'MCP_AGENT'       // Servidor MCP Nativo & DeepSeek IA
  | 'FULL_ADMIN';     // Servidor Local de Contingencia LAN (local-cache-for-startgg)

export interface EphemeralTokenPayload {
  token: string;
  userId: string;
  name: string;
  scope: TokenScope;
  role: UserRole;
  expiresAt: string;
}

export interface ICachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export interface IDatabasePort {
  findUserById(userId: string): Promise<{ id: string; name: string; email: string; role: UserRole; eloRating: number } | null>;
  linkGameAccount(userId: string, platform: string, gamertag: string, externalId?: string): Promise<void>;
  saveEphemeralToken(payload: EphemeralTokenPayload): Promise<EphemeralTokenPayload>;
}

export interface IConfigPort {
  get(key: string, fallback?: string): string;
}
