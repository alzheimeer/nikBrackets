// packages/bracket-viewer-3d/src/components/TournamentMatchStation3D.tsx
// Fase 0.2 — Estación de Enfrentamiento 3D Holográfica en React Three Fiber (R3F)

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CYBER_ESPORTS_2026_THEME } from '../themes/cyberEsportsTheme.js';

export interface MatchStation3DProps {
  setID: string;
  roundLabel: string;
  stationName?: string;
  isStream?: boolean;
  player1Name: string;
  player2Name: string;
  player1Character?: string;
  player2Character?: string;
  score1: number;
  score2: number;
  phase: 'SWISS' | 'ROUND_ROBIN' | 'WINNERS' | 'LOSERS' | 'GRAND_FINAL' | 'GRAND_FINAL_RESET' | 'SECOND_CHANCE' | 'THIRD_PLACE' | 'FFA_STAGE' | 'LEADERBOARD_STAGE';
  status: 'LOCKED' | 'WAITING' | 'READY' | 'IN_PROGRESS' | 'DISPUTED' | 'COMPLETED' | 'ARCHIVED';
  position: [number, number, number];
  nextWinPosition?: [number, number, number] | null;
  nextLosePosition?: [number, number, number] | null;
  isSelected?: boolean;
  onSelectStation?: (setID: string) => void;
}

export const StationCard3D: React.FC<MatchStation3DProps> = ({
  setID,
  roundLabel,
  stationName = 'EST-01',
  isStream = false,
  player1Name,
  player2Name,
  player1Character,
  player2Character,
  score1,
  score2,
  phase,
  status,
  position,
  nextWinPosition,
  nextLosePosition,
  isSelected = false,
  onSelectStation,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const neonColor =
    phase === 'LOSERS'
      ? CYBER_ESPORTS_2026_THEME.colors.crimsonFire
      : phase === 'GRAND_FINAL' || phase === 'GRAND_FINAL_RESET'
      ? CYBER_ESPORTS_2026_THEME.colors.goldGrandFinal
      : phase === 'SECOND_CHANCE'
      ? CYBER_ESPORTS_2026_THEME.colors.emeraldSecondChance
      : status === 'DISPUTED' || isStream
      ? CYBER_ESPORTS_2026_THEME.colors.electricPurple
      : CYBER_ESPORTS_2026_THEME.colors.cyanElectric;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2.1 + position[0]) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={0.12} floatIntensity={0.25}>
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onSelectStation?.(setID)}
        >
          <boxGeometry args={[3.5, 1.65, 0.22]} />
          <meshStandardMaterial
            color={CYBER_ESPORTS_2026_THEME.colors.cyberSlate}
            metalness={0.85}
            roughness={0.18}
            emissive={neonColor}
            emissiveIntensity={isSelected ? 0.65 : hovered ? 0.45 : 0.16}
          />
        </mesh>

        {/* Encabezado de Ronda y Estación */}
        <Text position={[-1.55, 0.56, 0.14]} fontSize={0.15} color={neonColor} anchorX="left">
          {`${setID} • ${roundLabel} [${stationName}]`}
        </Text>

        {/* Jugador 1 + Personaje Main + Marcador */}
        <Text position={[-1.55, 0.16, 0.14]} fontSize={0.21} color="#F8FAFC" anchorX="left">
          {`${player1Name}${player1Character ? ` (${player1Character})` : ''}`}
        </Text>
        <Text position={[1.45, 0.16, 0.14]} fontSize={0.24} color="#00F0FF" anchorX="right">
          {String(score1)}
        </Text>

        {/* Jugador 2 + Personaje Main + Marcador */}
        <Text position={[-1.55, -0.32, 0.14]} fontSize={0.21} color="#94A3B8" anchorX="left">
          {`${player2Name}${player2Character ? ` (${player2Character})` : ''}`}
        </Text>
        <Text position={[1.45, -0.32, 0.14]} fontSize={0.24} color={neonColor} anchorX="right">
          {String(score2)}
        </Text>
      </Float>

      {/* Conector 3D de Avance al Siguiente Set de Ganadores */}
      {nextWinPosition && (
        <Line
          points={[position, nextWinPosition]}
          color={neonColor}
          lineWidth={2.5}
          dashed={status !== 'COMPLETED'}
        />
      )}

      {/* Conector 3D de Caída al Losers Bracket / Second Chance */}
      {nextLosePosition && (
        <Line
          points={[position, nextLosePosition]}
          color={CYBER_ESPORTS_2026_THEME.colors.crimsonFire}
          lineWidth={1.6}
          dashed={true}
        />
      )}
    </group>
  );
};
