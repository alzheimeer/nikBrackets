# NEXUS GRID 3D — Plataforma de Gestión de Esports (Arquitectura Completa 2026)

Este monorepo contiene tanto la **aplicación interactiva autónoma** como la **arquitectura modular completa de paquetes y microservicios** en el orden exacto definido en tu cuaderno **Software de Gestión de Esports 2026**:

---

## 📦 Estructura Completa del Monorepo (En Orden de Fases)

### Fase 0: Módulos Core Independientes (Cimiento Tecnológico)

1. **`packages/bracket-engine` (`@nexus-grid/bracket-engine`)**:
   - `src/types/obf.ts`: Especificación completa del estándar **Open Bracket Format (OBF v1.0)** (`OBFDocument`, `OBFEventMetadata`, `OBFEntrant`, `OBFSet`, `SetGameSelection`, `StandingsRow`).
   - `src/formats/generators.ts`: Generadores matemáticos de los **7 formatos** del cuaderno:
     1. `two_stage` (**Formato Garantizado de 3 Partidas Mínimas**: Fase 1 Clasificación Suiza ➔ Fase 2 Playoffs Doble Eliminación + *Second Chance Bracket*).
     2. `double_elimination` (Winners Bracket, Losers Bracket, Grand Final y Grand Final Reset).
     3. `single_elimination` (Eliminación directa + Final por el 3er Puesto).
     4. `swiss` (Emparejamiento por historial idéntico sin revanchas + Buchholz).
     5. `round_robin` (Todos contra todos — Algoritmo de Berger).
     6. `free_for_all` (Salas multi-jugador con avance Top N).
     7. `leaderboard` (Clasificación continua por puntos / Time Trial).
   - `src/index.ts`: Clase `NexusBracketEngine` con submódulos independientes `create`, `find`, `update`, `reset` (con **reseteo en cascada recursivo** al corregir partidas finalizadas y soporte de *Forfeit/DQ*), `get` y `delete`.
   - `tests/engine.test.mjs`: Suite de pruebas ejecutables en Node.js.

2. **`packages/bracket-viewer-3d` (`@nexus-grid/bracket-viewer-3d`)**:
   - `src/themes/cyberEsportsTheme.ts`: Tokens del sistema de diseño *Cyber-Esports Glassmorphism* (`#070A0F` Deep Obsidian, `#111723` Cyber Slate, `#00F0FF` Cyan Electric Winners, `#FF0055` Crimson Fire Losers, `#8A2BE2` Electric Purple DeepSeek/MCP, `#F59E0B` Gold Grand Final) y planos de profundidad **Z-Space**.
   - `src/components/TournamentMatchStation3D.tsx`: Tarjeta holográfica 3D flotante en **React 19 + React Three Fiber (R3F)** con iluminación neón reactiva y conectores dinámicos.
   - `src/components/BracketCanvas3D.tsx`: Lienzo espacial 3D completo con suelo reflectante (`MeshReflectorMaterial`) y controles orbitales.
   - `src/components/BracketViewer2D.tsx`: Visualizador 2D híbrido por fases inspirado en `brackets-viewer.js` y `bracket-maker`.

3. **`packages/auth-server` (`@nexus-grid/auth-server` basado en `alzheimeer/authLive`)**:
   - `prisma/schema.prisma`: Esquema Prisma con `User`, `UserRole` (`SUPER_ADMIN`, `TOURNAMENT_DIRECTOR`, `REFEREE`, `STREAMER`, `PAY_EDITOR`, `PLAYER`), `Passkey` (WebAuthn), `GameAccount` (Riot, Steam, PSN, Xbox, EA Sports) y `ApiToken` (`TokenScope`).
   - `src/ports/interfaces.ts` & `src/adapters/UpstashRedisAdapter.ts`: **Arquitectura Hexagonal (Ports & Adapters)** con caché en **Upstash Redis (~2.8ms)** y fallback automático en memoria.
   - `src/index.ts`: Microservicio **Hono + Better Auth** con emisión y verificación de tokens efímeros (`/api/tokens/ephemeral`).

---

### Fase 1: Aplicación Frontend & Experiencia 3D (`apps/web-frontend`)

- `src/store/useTournamentStore.ts`: Store reactivo conectado a `@nexus-grid/bracket-engine`.
- `src/components/ScoreReporterModal.tsx`: Reporte de resultados en pantalla única con registro de personajes (*mains*) y escenarios legales por partida (`SetGameSelection`), reseteo en cascada y validación por visión **DeepSeek-VL**.
- `src/components/PlayerHolographicCard3D.tsx`: Tarjeta holográfica 3D del competidor con efecto *Tilt*, Elo rating y estación asignada.
- `src/components/HierarchyExplorer.tsx`: Navegador de la jerarquía de 3 niveles **Organización ➔ Torneo (Venue Fee único) ➔ Eventos (Disciplinas multi-juego)** al estilo `start.gg` y `Challonge`.
- `src/components/StreamObsOverlay.tsx`: Overlay 1920x1080 en tiempo real para **OBS Studio / Stream Deck**.
- `src/App.tsx`: Aplicación React 19 completa.

---

### Fase 2 y Fase 3: Backend Fastify, Aceleración Redis, LAN Offline, DeepSeek IA & Servidor MCP

- **`apps/api-fastify-mcp`**:
  - `src/redis/acceleration.ts`: Implementación de los **3 patrones PostgreSQL + Redis** del cuaderno:
    1. **Read-Aside** con invalidación por etiquetas (`invalidateByTag`).
    2. **Write-Behind / Async Buffering** con **BullMQ** (`score-write-queue` < 5ms).
    3. **In-Memory Document State** con **RedisJSON** guardando el árbol OBF en RAM.
  - `src/services/deepseek.service.ts`: Integración con **DeepSeek-VL** (verificación automática de capturas de pantalla de victoria) y **DeepSeek-R1 / V3** (seeding inteligente por Elo y narrativas para comentaristas).
  - `src/mcp-server.ts`: **Servidor MCP Nativo** completo (`@modelcontextprotocol/sdk`) con las herramientas `get_tournament_state`, `report_match_score`, `verify_proof_screenshot_deepseek` y `run_deepseek_r1_seeding`.
  - `src/server.ts`: Servidor **Fastify** REST/WebSockets.
- **`packages/lan-offline-cache` (`@nexus-grid/lan-offline-cache`)**:
  - `src/lan-server.ts`: Servidor local de contingencia **Offline-First** para eventos LAN inspirado en `local-cache-for-startgg`.
