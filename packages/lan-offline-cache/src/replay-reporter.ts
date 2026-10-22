// packages/lan-offline-cache/src/replay-reporter.ts
// Integración con Replay Reporter & Auto Stream (ecosistema local-cache-for-startgg)
// Detecta automáticamente archivos de repetición (.slp / .replay) en estaciones LAN y reporta al nodo local.

import { LanOfflineCacheNode } from './lan-server.js';
import type { SetGameSelection } from '@nexus-grid/bracket-engine';

export interface ReplayMetadata {
  setID: string;
  station: string;
  player1Tag: string;
  player2Tag: string;
  score1: number;
  score2: number;
  games: SetGameSelection[];
}

export class ReplayReporterBridge {
  constructor(private readonly lanNode: LanOfflineCacheNode) {}

  public ingestReplayFile(meta: ReplayMetadata) {
    return this.lanNode.reportLocalMatch(meta.setID, meta.score1, meta.score2, meta.games);
  }
}
