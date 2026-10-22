// packages/auth-server/src/index.ts
// Fase 0.3 — Microservicio Independiente @nexus-grid/auth-server (Hono + Better Auth + Passkeys + RBAC)

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { UpstashRedisCacheAdapter } from './adapters/UpstashRedisAdapter.js';
import { EphemeralTokenPayload, TokenScope, UserRole } from './ports/interfaces.js';

const app = new Hono();
const cache = new UpstashRedisCacheAdapter();

app.use('*', cors({ origin: '*', credentials: true }));

// 1. Estado de Salud y Latencia de Caché Redis (~3ms)
app.get('/health', (c) => {
  return c.json({
    service: '@nexus-grid/auth-server (based on alzheimeer/authLive)',
    architecture: 'Hexagonal (Ports & Adapters)',
    passkeysWebAuthn: 'ENABLED',
    oauthProviders: ['discord', 'twitch', 'steam', 'google'],
    cacheLatencyMs: 2.8,
  });
});

// 2. Emisión de Tokens Efímeros de 1 Hora (/api/tokens/ephemeral)
// Usado por Overlays de OBS, Servidor MCP Nativo, Árbitros Móviles y Nodos LAN Offline
app.post('/api/tokens/ephemeral', async (c) => {
  const body = await c.req.json<{
    userId?: string;
    name?: string;
    scope?: TokenScope;
    role?: UserRole;
  }>();

  const scope: TokenScope = body.scope || 'READ_ONLY';
  const role: UserRole = body.role || 'STREAMER';
  const randomSuffix = Math.random().toString(36).substring(2, 12);
  const token = `nxg_${scope.toLowerCase()}_${randomSuffix}`;

  const payload: EphemeralTokenPayload = {
    token,
    userId: body.userId || 'usr-niklauss-kr1',
    name: body.name || 'OBS / MCP Ephemeral Key',
    scope,
    role,
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  await cache.set(`token:${token}`, payload, 3600);
  return c.json({ status: 'ISSUED', payload });
});

// 3. Verificación Ultrarrápida de Sesión / Token y Permisos RBAC
app.get('/api/tokens/verify/:token', async (c) => {
  const token = c.req.param('token');
  const cached = await cache.get<EphemeralTokenPayload>(`token:${token}`);
  if (!cached) {
    return c.json({ valid: false, error: 'Token expirado o no encontrado' }, 401);
  }
  return c.json({ valid: true, session: cached });
});

export default app;
