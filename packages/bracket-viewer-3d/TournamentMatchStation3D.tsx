// @nexus-grid/bracket-viewer-3d — Fase 0.2
// Componente WebGL 3D con React Three Fiber (R3F) + Three.js en espacio Z
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, OrbitControls, MeshReflectorMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

export interface MatchStationProps {
  setID: string;
  player1Name: string;
  player2Name: string;
  score1: number;
  score2: number;
  phase: 'WINNERS' | 'LOSERS' | 'GRAND_FINAL' | 'SWISS' | 'SECOND_CHANCE';
  status: 'PENDING' | 'IN_PROGRESS' | 'DISPUTED' | 'COMPLETED';
  position: [number, number, number];
  nextStationPosition?: [number, number, number];
  onSelectStation?: (setID: string) => void;
}

export const StationCard3D: React.FC<MatchStationProps> = ({
  setID,
  player1Name,
  player2Name,
  score1,
  score2,
  phase,
  status,
  position,
  nextStationPosition,
  onSelectStation,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const neonColor =
    phase === 'LOSERS' ? '#FF0055' :
    phase === 'GRAND_FINAL' ? '#F59E0B' :
    status === 'DISPUTED' ? '#8A2BE2' : '#00F0FF';

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={0.15} floatIntensity={0.3}>
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onSelectStation?.(setID)}
        >
          <boxGeometry args={[3.4, 1.5, 0.22]} />
          <meshStandardMaterial
            color="#111723"
            metalness={0.85}
            roughness={0.2}
            emissive={neonColor}
            emissiveIntensity={hovered ? 0.45 : 0.15}
          />
        </mesh>
        <Text position={[-1.4, 0.32, 0.15]} fontSize={0.22} color="#F8FAFC" anchorX="left">
          {`${player1Name}  [${score1}]`}
        </Text>
        <Text position={[-1.4, -0.32, 0.15]} fontSize={0.22} color="#94A3B8" anchorX="left">
          {`${player2Name}  [${score2}]`}
        </Text>
      </Float>
      {nextStationPosition && (
        <Line
          points={[position, nextStationPosition]}
          color={neonColor}
          lineWidth={2.5}
          dashed={status !== 'COMPLETED'}
        />
      )}
    </group>
  );
};
