// packages/auth-server/src/auth.ts
// Fase 0.3 — Configuración de Better Auth con Passkeys/WebAuthn y OAuth 2.0 Gaming (Discord, Twitch, Steam, Google)

import { UserRole } from './ports/interfaces.js';

export interface AuthProviderConfig {
  providerId: 'discord' | 'twitch' | 'steam' | 'google' | 'passkey';
  clientId?: string;
  enabled: boolean;
  scopes: string[];
}

export const BETTER_AUTH_ESPORTS_CONFIG = {
  appName: 'NEXUS GRID 3D Auth Server (authLive)',
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días para web principal (HTTP-Only Cookie)
    ephemeralTokenTtlSeconds: 3600, // 1 hora para OBS Overlays, LAN Node y Servidor MCP
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 min en Redis (~3ms de verificación)
    },
  },
  passkeysWebAuthn: {
    enabled: true,
    rpID: process.env.WEBAUTHN_RP_ID || 'nexusgrid.gg',
    rpName: 'NEXUS GRID 3D Esports',
    supportedAuthenticators: ['FaceID', 'TouchID', 'WindowsHello', 'YubiKey'],
  },
  socialProviders: [
    {
      providerId: 'discord',
      clientId: process.env.DISCORD_CLIENT_ID || 'discord-client-2026',
      enabled: true,
      scopes: ['identify', 'email', 'guilds'],
    },
    {
      providerId: 'twitch',
      clientId: process.env.TWITCH_CLIENT_ID || 'twitch-client-2026',
      enabled: true,
      scopes: ['user:read:email'],
    },
    {
      providerId: 'steam',
      clientId: process.env.STEAM_API_KEY || 'steam-openid-2026',
      enabled: true,
      scopes: ['openid', 'steamid64'],
    },
    {
      providerId: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-2026',
      enabled: true,
      scopes: ['openid', 'email', 'profile'],
    },
  ] satisfies AuthProviderConfig[],
  defaultUserRole: 'PLAYER' as UserRole,
};
