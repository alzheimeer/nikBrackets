// packages/bracket-viewer-3d/src/themes/cyberEsportsTheme.ts
// Tokens oficiales de diseño Cyber-Esports Glassmorphism (UI/UX 2026)

export interface NexusViewerTheme {
  name: string;
  colors: {
    deepObsidian: string;
    cyberSlate: string;
    cyberBorder: string;
    cyanElectric: string;   // Winners Bracket & Victorias (#00F0FF)
    crimsonFire: string;    // Losers Bracket & Eliminaciones (#FF0055)
    electricPurple: string; // IA DeepSeek & Servidor MCP (#8A2BE2)
    goldGrandFinal: string; // Grand Finals & Trofeos (#F59E0B)
    emeraldSecondChance: string; // Second Chance Bracket (#10B981)
    iceWhite: string;
    slateNeutral: string;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
  };
  zSpacePlanes: {
    swiss: number;
    winners: number;
    losers: number;
    secondChance: number;
    grandFinal: number;
  };
}

export const CYBER_ESPORTS_2026_THEME: NexusViewerTheme = {
  name: 'NEXUS GRID 3D — Cyber-Esports Glassmorphism',
  colors: {
    deepObsidian: '#070A0F',
    cyberSlate: '#111723',
    cyberBorder: '#1E293B',
    cyanElectric: '#00F0FF',
    crimsonFire: '#FF0055',
    electricPurple: '#8A2BE2',
    goldGrandFinal: '#F59E0B',
    emeraldSecondChance: '#10B981',
    iceWhite: '#F8FAFC',
    slateNeutral: '#94A3B8',
  },
  typography: {
    heading: '"Space Grotesk", sans-serif',
    body: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  zSpacePlanes: {
    swiss: 2.8,
    winners: 0.0,
    losers: -4.5,
    secondChance: 4.2,
    grandFinal: 1.5,
  },
};
