// packages/auth-server/src/tokens.ts
// Fase 0.3 — Servicio de Emisión y Rotación de Tokens Efímeros (/api/tokens/ephemeral) con caché Redis (~3ms)

import { EphemeralTokenPayload, ICachePort, TokenScope, UserRole } from './ports/interfaces.js';
import { RBAC_PERMISSIONS_MATRIX } from './middleware/rbac.js';

export class EphemeralTokenService {
  constructor(private readonly cache: ICachePort) {}

  async issueEphemeralToken(params: {
    userId: string;
    name: string;
    role: UserRole;
    requestedScope: TokenScope;
    ttlSeconds?: number;
  }): Promise<EphemeralTokenPayload> {
    const allowedScopes = RBAC_PERMISSIONS_MATRIX[params.role]?.allowedTokenScopes || ['READ_ONLY'];
    const scope: TokenScope = allowedScopes.includes(params.requestedScope)
      ? params.requestedScope
      : 'READ_ONLY';

    const ttl = params.ttlSeconds || 3600;
    const randomHex = Math.random().toString(36).substring(2, 12);
    const token = `nxg_${scope.toLowerCase()}_${randomHex}`;

    const payload: EphemeralTokenPayload = {
      token,
      userId: params.userId,
      name: params.name,
      scope,
      role: params.role,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };

    await this.cache.set(`token:${token}`, payload, ttl);
    return payload;
  }

  async verifyToken(token: string): Promise<EphemeralTokenPayload | null> {
    return this.cache.get<EphemeralTokenPayload>(`token:${token}`);
  }

  async revokeToken(token: string): Promise<void> {
    await this.cache.del(`token:${token}`);
  }
}
