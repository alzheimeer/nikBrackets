// apps/web-frontend/src/components/AuthClientModal.tsx
// Fase 1.2 — Cliente de Autenticación Frictionless (1-Click OAuth Discord, Twitch, Steam, Google + Passkeys/WebAuthn) conectado a authLive

import React from 'react';

export interface AuthClientModalProps {
  currentUserTag: string;
  activeRole: string;
  onLoginPasskey: () => void;
  onLoginOAuth: (provider: 'Discord' | 'Twitch' | 'Steam' | 'Google') => void;
  onChangeRole: (role: string) => void;
}

export const AuthClientModal: React.FC<AuthClientModalProps> = ({
  currentUserTag,
  activeRole,
  onLoginPasskey,
  onLoginOAuth,
  onChangeRole,
}) => {
  const roles = [
    'SUPER_ADMIN',
    'TOURNAMENT_DIRECTOR',
    'REFEREE',
    'STREAMER',
    'PAY_EDITOR',
    'PLAYER',
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111723]/90 p-5 text-[#F8FAFC]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#00F0FF]">
            @nexus-grid/auth-server • Basado en alzheimeer/authLive
          </span>
          <h3 className="text-base font-bold">Frictionless Auth (Passkeys + OAuth Gaming) & RBAC</h3>
        </div>
        <span className="font-mono text-xs text-emerald-300">{currentUserTag}</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={onLoginPasskey}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00F0FF]/20 to-[#8A2BE2]/25 border border-[#00F0FF]/50 font-bold text-xs flex items-center justify-between"
        >
          <span>🔐 Iniciar con Passkey Biométrica (FaceID / TouchID / Windows Hello)</span>
          <span className="font-mono text-[10px] text-[#00F0FF]">&lt; 1s</span>
        </button>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
          {(['Discord', 'Twitch', 'Steam', 'Google'] as const).map((prov) => (
            <button
              key={prov}
              type="button"
              onClick={() => onLoginOAuth(prov)}
              className="py-2 px-3 rounded-xl bg-[#070A0F] border border-slate-800 hover:border-[#00F0FF]/50"
            >
              {prov} OAuth
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
          <span className="text-slate-400">Rol Activo (RBAC):</span>
          <select
            value={activeRole}
            onChange={(e) => onChangeRole(e.target.value)}
            className="bg-[#070A0F] border border-slate-700 rounded-lg px-2.5 py-1.5 text-[#00F0FF]"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
