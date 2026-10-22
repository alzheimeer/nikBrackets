// packages/auth-server/src/middleware/rbac.ts
// Fase 0.3 — Control de Acceso Granular por Roles (RBAC) inspirado en OpenBracketChallenge y start.gg

import { TokenScope, UserRole } from '../ports/interfaces.js';

export interface RoleCapabilities {
  role: UserRole;
  canManageOrganizations: boolean;
  canCreateTournaments: boolean;
  canEditBracketsAndSeeds: boolean;
  canReportStationScores: boolean;
  canAccessStreamOverlays: boolean;
  canManageQrPaymentsAndPrizes: boolean;
  allowedTokenScopes: TokenScope[];
}

export const RBAC_PERMISSIONS_MATRIX: Record<UserRole, RoleCapabilities> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    canManageOrganizations: true,
    canCreateTournaments: true,
    canEditBracketsAndSeeds: true,
    canReportStationScores: true,
    canAccessStreamOverlays: true,
    canManageQrPaymentsAndPrizes: true,
    allowedTokenScopes: ['READ_ONLY', 'SCORE_REPORTER', 'MCP_AGENT', 'FULL_ADMIN'],
  },
  TOURNAMENT_DIRECTOR: {
    role: 'TOURNAMENT_DIRECTOR',
    canManageOrganizations: false,
    canCreateTournaments: true,
    canEditBracketsAndSeeds: true,
    canReportStationScores: true,
    canAccessStreamOverlays: true,
    canManageQrPaymentsAndPrizes: false,
    allowedTokenScopes: ['READ_ONLY', 'SCORE_REPORTER', 'MCP_AGENT'],
  },
  REFEREE: {
    role: 'REFEREE',
    canManageOrganizations: false,
    canCreateTournaments: false,
    canEditBracketsAndSeeds: false,
    canReportStationScores: true,
    canAccessStreamOverlays: false,
    canManageQrPaymentsAndPrizes: false,
    allowedTokenScopes: ['READ_ONLY', 'SCORE_REPORTER'],
  },
  STREAMER: {
    role: 'STREAMER',
    canManageOrganizations: false,
    canCreateTournaments: false,
    canEditBracketsAndSeeds: false,
    canReportStationScores: true,
    canAccessStreamOverlays: true,
    canManageQrPaymentsAndPrizes: false,
    allowedTokenScopes: ['READ_ONLY', 'SCORE_REPORTER'],
  },
  PAY_EDITOR: {
    role: 'PAY_EDITOR',
    canManageOrganizations: false,
    canCreateTournaments: false,
    canEditBracketsAndSeeds: false,
    canReportStationScores: false,
    canAccessStreamOverlays: false,
    canManageQrPaymentsAndPrizes: true,
    allowedTokenScopes: ['READ_ONLY'],
  },
  PLAYER: {
    role: 'PLAYER',
    canManageOrganizations: false,
    canCreateTournaments: false,
    canEditBracketsAndSeeds: false,
    canReportStationScores: false,
    canAccessStreamOverlays: false,
    canManageQrPaymentsAndPrizes: false,
    allowedTokenScopes: ['READ_ONLY'],
  },
};

export function hasRolePermission(
  role: UserRole,
  capability: keyof Omit<RoleCapabilities, 'role' | 'allowedTokenScopes'>
): boolean {
  return Boolean(RBAC_PERMISSIONS_MATRIX[role]?.[capability]);
}
