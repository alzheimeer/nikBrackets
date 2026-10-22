// apps/api-fastify-mcp/src/mcp-server.ts
// Fase 3 — Servidor MCP Nativo completo (@modelcontextprotocol/sdk) conectado a @nexus-grid/bracket-engine y DeepSeek-VL

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { NexusBracketEngine } from '@nexus-grid/bracket-engine';
import { deepSeekService } from './services/deepseek.service.js';
import { redisAccelerator } from './redis/acceleration.js';

const engine = new NexusBracketEngine();

export const MCP_TOOLS = [
  {
    name: 'get_tournament_state',
    description:
      'Obtiene la estructura completa del torneo en estándar OBF (Open Bracket Format v1.0), incluyendo sets activos, pendientes, standings y estaciones asignadas.',
    inputSchema: {
      type: 'object',
      properties: {
        tournamentSlug: {
          type: 'string',
          description: "Slug único del torneo (ej. 'evo-2026-vegas')",
        },
      },
      required: ['tournamentSlug'],
    },
  },
  {
    name: 'report_match_score',
    description:
      'Permite al agente de IA o árbitro reportar/aprobar el resultado de un set en pantalla única y propagar el avance en Winners/Losers.',
    inputSchema: {
      type: 'object',
      properties: {
        setId: { type: 'string', description: 'ID único del set (ej. SW-R1-1)' },
        score1: { type: 'number', description: 'Puntos del Jugador 1' },
        score2: { type: 'number', description: 'Puntos del Jugador 2' },
        reporterRole: {
          type: 'string',
          description: 'Rol de autorización (REFEREE, STREAMER, AI_AGENT, SUPER_ADMIN)',
        },
      },
      required: ['setId', 'score1', 'score2', 'reporterRole'],
    },
  },
  {
    name: 'verify_proof_screenshot_deepseek',
    description:
      'Invoca el modelo multimodal DeepSeek-VL para analizar una captura de pantalla de victoria y extraer marcadores automáticamente.',
    inputSchema: {
      type: 'object',
      properties: {
        setId: { type: 'string', description: 'ID del set en disputa' },
        proofImageUrl: { type: 'string', description: 'URL de la imagen alojada en S3/R2' },
      },
      required: ['setId', 'proofImageUrl'],
    },
  },
  {
    name: 'run_deepseek_r1_seeding',
    description:
      'Ejecuta el razonamiento de DeepSeek-R1 para sembrar las llaves del torneo según el Elo global e historial OBF.',
    inputSchema: {
      type: 'object',
      properties: {
        tournamentSlug: { type: 'string' },
      },
    },
  },
];

const server = new Server(
  {
    name: 'nexus-grid-mcp-server',
    version: '2026.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: MCP_TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_tournament_state') {
      const obf = engine.get.obf();
      const standings = engine.get.standings();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ obf, standings }, null, 2),
          },
        ],
      };
    }

    if (name === 'report_match_score') {
      const { setId, score1, score2, reporterRole } = args as {
        setId: string;
        score1: number;
        score2: number;
        reporterRole: string;
      };
      const updated = engine.update.match({ setID: setId, score1, score2 });
      await redisAccelerator.enqueueScoreWrite({
        tournamentSlug: engine.get.obf().event.tournamentSlug,
        setId,
        score1,
        score2,
        winnerId: updated?.winnerID || null,
      });

      return {
        content: [
          {
            type: 'text',
            text: `[MCP Action] Set ${setId} cerrado exitosamente por ${reporterRole}. Marcador: ${score1} - ${score2}.`,
          },
        ],
      };
    }

    if (name === 'verify_proof_screenshot_deepseek') {
      const { setId, proofImageUrl } = args as { setId: string; proofImageUrl: string };
      const verification = await deepSeekService.verifyProofScreenshot({
        setId,
        proofImageUrl,
      });
      if (verification.autoApproved) {
        engine.update.match({
          setID: setId,
          score1: verification.detectedScore1,
          score2: verification.detectedScore2,
          proofImageUrl,
          aiVerifiedConfidence: verification.confidence,
        });
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(verification, null, 2) }],
      };
    }

    if (name === 'run_deepseek_r1_seeding') {
      const reseeded = engine.update.confirmSeedingByElo();
      return {
        content: [{ type: 'text', text: JSON.stringify(reseeded, null, 2) }],
      };
    }

    throw new Error(`Herramienta MCP no reconocida: ${name}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error en Servidor MCP: ${message}` }],
      isError: true,
    };
  }
});

export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Servidor MCP Nativo Nexus Grid escuchando mediante Stdio...');
}
