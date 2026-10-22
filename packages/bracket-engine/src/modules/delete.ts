// packages/bracket-engine/src/modules/delete.ts
// Submódulo DELETE — Limpieza de etapas o participantes

import { OBFDocument } from '../types/obf.js';

export function createDeleteModule(
  getDoc: () => OBFDocument,
  emitChange: (type: string, setID?: string) => void
) {
  return {
    stage(): void {
      const doc = getDoc();
      doc.sets = [];
      emitChange('stage.deleted');
    },

    entrant(entrantID: string): void {
      const doc = getDoc();
      doc.entrants = doc.entrants.filter((e) => e.entrantID !== entrantID);
      doc.event.numberEntrants = doc.entrants.length;
      emitChange('entrant.deleted');
    },
  };
}
