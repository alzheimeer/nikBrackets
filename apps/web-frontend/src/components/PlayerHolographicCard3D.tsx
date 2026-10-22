// apps/web-frontend/src/components/PlayerHolographicCard3D.tsx
// Fase 1.3 — Tarjeta Holográfica 3D del Jugador (Tilt Card) con Insignias Metálicas y Estación Asignada

import React, { useState } from 'react';

export interface PlayerHolographicCardProps {
  gamertag: string;
  eloRating: number;
  mainCharacter: string;
  country: string;
  assignedStation: string;
  guaranteedMinMatches: number;
}

export const PlayerHolographicCard3D: React.FC<PlayerHolographicCardProps> = ({
  gamertag,
  eloRating,
  mainCharacter,
  country,
  assignedStation,
  guaranteedMinMatches,
}) => {
  const [transform, setTransform] = useState('perspective(700px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`perspective(700px) rotateX(${(-y / 12).toFixed(2)}deg) rotateY(${(x / 12).toFixed(2)}deg)`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTransform('perspective(700px) rotateX(0deg) rotateY(0deg)')}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
      className="rounded-2xl border border-[#00F0FF]/50 bg-[#111723]/90 p-5 text-[#F8FAFC] shadow-[0_0_25px_rgba(0,240,255,0.15)] cursor-pointer"
    >
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF]">3D HOLOGRAPHIC PASS</span>
        <span className="text-amber-400 font-bold">ELO: {eloRating}</span>
      </div>
      <div className="mt-4">
        <h4 className="text-xl font-bold">{gamertag}</h4>
        <p className="text-xs font-mono text-slate-400 mt-0.5">
          Main: {mainCharacter} • Región: {country}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-mono">
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
          Estación: {assignedStation}
        </span>
        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
          Garantía: ≥{guaranteedMinMatches} Partidas
        </span>
      </div>
    </div>
  );
};
