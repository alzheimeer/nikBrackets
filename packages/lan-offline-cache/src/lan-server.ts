// packages/lan-offline-cache/src/lan-server.ts
// Fase 2 — Servidor Local de Contingencia LAN ("Offline-First") inspirado en jmlee337/local-cache-for-startgg
// Protege los torneos presenciales contra caídas de internet y latencia, compatible con Replay Reporter y Auto Stream.

import { NexusBracketEngine, OBFDocument, SetGameSelection } from '@nexus-grid/bracket-engine';

export interface PendingSyncMutation {
  mutationId: string;
  setID: string;
  score1: number;
  score2: number;
  games: SetGameSelection[];
  timestamp: string;
  syncedToCloud: boolean;
}

export class LanOfflineCacheNode {
  private localEngine: NexusBracketEngine;
  private pendingMutations: PendingSyncMutation[] = [];
  private isOnline = true;

  constructor(initialSnapshot?: OBFDocument) {
    this.localEngine = new NexusBracketEngine(initialSnapshot);
  }

  public setNetworkStatus(online: boolean) {
    this.isOnline = online;
  }

  public reportLocalMatch(setID: string, score1: number, score2: number, games: SetGameSelection[] = []) {
    const updated = this.localEngine.update.match({ setID, score1, score2, games });
    this.pendingMutations.push({
      mutationId: `lan_${Date.now()}_${setID}`,
      setID,
      score1,
      score2,
      games,
      timestamp: new Date().toISOString(),
      syncedToCloud: this.isOnline,
    });
    return {
      updatedSet: updated,
      mode: this.isOnline ? 'CLOUD_AND_LAN_SYNCED' : 'SAVED_IN_LOCAL_LAN_CACHE',
      pendingSyncCount: this.getUnsyncedMutations().length,
    };
  }

  public getUnsyncedMutations(): PendingSyncMutation[] {
    return this.pendingMutations.filter((m) => !m.syncedToCloud);
  }

  public flushSyncQueueToCloud(): { syncedCount: number; snapshot: OBFDocument } {
    let count = 0;
    for (const m of this.pendingMutations) {
      if (!m.syncedToCloud) {
        m.syncedToCloud = true;
        count++;
      }
    }
    this.isOnline = true;
    return {
      syncedCount: count,
      snapshot: this.localEngine.get.obf(),
    };
  }
}
