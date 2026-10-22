// packages/bracket-viewer-3d/src/components/BracketCanvas3D.tsx
// Lienzo Espacial Z-Space completo que renderiza un documento Open Bracket Format (OBF v1.0) en 3D

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial } from '@react-three/drei';
import { StationCard3D } from './TournamentMatchStation3D.js';
import { CYBER_ESPORTS_2026_THEME } from '../themes/cyberEsportsTheme.js';
import type { OBFDocument } from '@nexus-grid/bracket-engine';

export interface BracketCanvas3DProps {
  obfDocument: OBFDocument;
  selectedSetID?: string | null;
  onSelectSet?: (setID: string) => void;
}

export const BracketCanvas3D: React.FC<BracketCanvas3DProps> = ({
  obfDocument,
  selectedSetID,
  onSelectSet,
}) => {
  const entrantMap = new Map(obfDocument.entrants.map((e) => [e.entrantID, e]));
  const posMap = new Map(obfDocument.sets.map((s) => [s.setID, s.other.position3D]));

  return (
    <div style={{ width: '100%', height: '560px', background: CYBER_ESPORTS_2026_THEME.colors.deepObsidian }}>
      <Canvas camera={{ position: [0, 2.5, 17.5], fov: 48 }}>
        <color attach="background" args={[CYBER_ESPORTS_2026_THEME.colors.deepObsidian]} />
        <fog attach="fog" args={[CYBER_ESPORTS_2026_THEME.colors.deepObsidian, 14, 38]} />

        <ambientLight intensity={0.85} />
        <pointLight position={[-8, 8, 8]} intensity={1.6} color={CYBER_ESPORTS_2026_THEME.colors.cyanElectric} />
        <pointLight position={[8, -5, -6]} intensity={1.4} color={CYBER_ESPORTS_2026_THEME.colors.crimsonFire} />

        {/* Estaciones 3D del Torneo en Espacio Z */}
        {obfDocument.sets.map((set) => {
          const p1 = set.entrant1ID ? entrantMap.get(set.entrant1ID) : undefined;
          const p2 = set.entrant2ID ? entrantMap.get(set.entrant2ID) : undefined;
          return (
            <StationCard3D
              key={set.setID}
              setID={set.setID}
              roundLabel={set.roundLabel}
              stationName={set.other.station}
              isStream={set.other.isStream}
              player1Name={p1 ? `#${p1.initialSeed} ${p1.entrantTag}` : 'TBD'}
              player2Name={p2 ? `#${p2.initialSeed} ${p2.entrantTag}` : 'TBD'}
              player1Character={p1?.mainCharacter}
              player2Character={p2?.mainCharacter}
              score1={set.entrant1Score}
              score2={set.entrant2Score}
              phase={set.phase}
              status={set.status}
              position={set.other.position3D}
              nextWinPosition={set.nextWinSetID ? posMap.get(set.nextWinSetID) : null}
              nextLosePosition={set.nextLoseSetID ? posMap.get(set.nextLoseSetID) : null}
              isSelected={selectedSetID === set.setID}
              onSelectStation={onSelectSet}
            />
          );
        })}

        {/* Suelo Reflectante Cyber-Esports */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5.4, 0]}>
          <planeGeometry args={[50, 50]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={0.8}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#070A0F"
            metalness={0.6}
            mirror={0.5}
          />
        </mesh>

        <OrbitControls enableDamping dampingFactor={0.08} maxDistance={30} minDistance={5} />
      </Canvas>
    </div>
  );
};
