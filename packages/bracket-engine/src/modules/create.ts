// packages/bracket-engine/src/modules/create.ts
// Submódulo CREATE (inspirado en brackets-manager.js) — Creación de escenarios de los 7 formatos e inscripción de participantes

import { OBFDocument, OBFEntrant, OBFEventMetadata, TournamentFormat } from '../types/obf.js';
import { generateSetsByFormat, sortAndBalanceEntrants } from '../formats/generators.js';

export function createCreateModule(
  getDoc: () => OBFDocument,
  emitChange: (type: string, setID?: string) => void
) {
  return {
    stage(params: {
      eventMeta?: Partial<OBFEventMetadata>;
      format: TournamentFormat;
      entrants: OBFEntrant[];
    }): OBFDocument {
      const doc = getDoc();
      const balanced = sortAndBalanceEntrants(params.entrants);
      doc.entrants = balanced;
      doc.event = {
        ...doc.event,
        ...params.eventMeta,
        format: params.format,
        numberEntrants: balanced.length,
        guaranteedMinMatches:
          params.format === 'two_stage' || params.format === 'swiss' || params.format === 'round_robin'
            ? 3
            : 2,
      };
      doc.sets = generateSetsByFormat(params.format, balanced);
      emitChange('stage.created');
      return doc;
    },

    entrant(entrant: OBFEntrant): OBFEntrant[] {
      const doc = getDoc();
      doc.entrants.push(entrant);
      doc.event.numberEntrants = doc.entrants.length;
      doc.sets = generateSetsByFormat(doc.event.format, doc.entrants);
      emitChange('entrant.added');
      return doc.entrants;
    },
  };
}
