// apps/web-frontend/src/components/HierarchyExplorer.tsx
// Fase 1.4 — Jerarquía de 3 Niveles (Organización ➔ Torneo ➔ Evento) al estilo start.gg y Challonge,
// con Candados de Registro (Público, Contraseña, Link Privado), Cobros QR y Dispersión de Premios (Community Gaming)

import React from 'react';
import type { TournamentFormat } from '@nexus-grid/bracket-engine';

export interface EventItem {
  id: string;
  name: string;
  gameSlug: string;
  format: TournamentFormat;
  entryFee: number;
  prizePool: number;
}

export interface TournamentItem {
  id: string;
  name: string;
  slug: string;
  venueFee: number;
  location: string;
  registrationLock: 'PUBLIC' | 'PASSWORD' | 'PRIVATE_LINK';
  events: EventItem[];
}

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  tournaments: TournamentItem[];
}

export interface HierarchyExplorerProps {
  organizations: OrganizationItem[];
  activeOrgId: string;
  activeEventId: string;
  onSelectOrganization: (orgId: string) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const HierarchyExplorer: React.FC<HierarchyExplorerProps> = ({
  organizations,
  activeOrgId,
  activeEventId,
  onSelectOrganization,
  onSelectEvent,
}) => {
  const activeOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];
  const activeTournament = activeOrg?.tournaments[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 rounded-2xl border border-slate-800 bg-[#111723]/80 p-5 text-[#F8FAFC]">
      {/* Nivel 1: Organización / Tenant */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase text-[#00F0FF] font-bold">
          1. Organización / Entidad (Tenant)
        </div>
        {organizations.map((org) => (
          <div
            key={org.id}
            onClick={() => onSelectOrganization(org.id)}
            className={`rounded-xl p-3 border cursor-pointer transition ${
              org.id === activeOrgId ? 'border-[#00F0FF] bg-[#00F0FF]/15' : 'border-slate-800 bg-[#070A0F]'
            }`}
          >
            <div className="font-bold text-sm">{org.name}</div>
            <div className="text-[11px] font-mono text-slate-400">/{org.slug}</div>
          </div>
        ))}
      </div>

      {/* Nivel 2: Torneo Global (Mega-Evento + Venue Fee) */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase text-amber-400 font-bold">
          2. Torneo Global (Venue Fee Único)
        </div>
        {activeTournament && (
          <div className="rounded-xl p-3 border border-amber-500/50 bg-amber-500/10">
            <div className="font-bold text-sm">{activeTournament.name}</div>
            <div className="text-xs font-mono text-amber-300 mt-1">
              Venue Fee: ${activeTournament.venueFee} USD • {activeTournament.location}
            </div>
            <div className="text-[11px] font-mono text-emerald-300 mt-1">
              Registro: {activeTournament.registrationLock} (Pago QR Habilitado)
            </div>
          </div>
        )}
      </div>

      {/* Nivel 3: Eventos / Disciplinas (Juegos y Formatos Independientes) */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
          3. Eventos / Disciplinas (Multi-Juego)
        </div>
        {activeTournament?.events.map((ev) => (
          <div
            key={ev.id}
            onClick={() => onSelectEvent(ev)}
            className={`rounded-xl p-3 border cursor-pointer transition ${
              ev.id === activeEventId ? 'border-emerald-400 bg-emerald-500/15' : 'border-slate-800 bg-[#070A0F]'
            }`}
          >
            <div className="flex justify-between font-bold text-xs">
              <span>{ev.name}</span>
              <span className="font-mono text-emerald-300">${ev.prizePool.toLocaleString()}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              Formato: {ev.format} • Entry Fee: ${ev.entryFee}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
