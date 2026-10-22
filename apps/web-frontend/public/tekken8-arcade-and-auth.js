// apps/web-frontend/public/tekken8-arcade-and-auth.js
// Módulo Interactivo de:
// 1. Roster Completo de Tekken 8 (43 Personajes: 32 Base + Season 1 + Season 2 + Season 3 + Random '?')
// 2. Pantalla Arcade de Selección de Personajes (Tarjetas inclinadas estilo Tekken 8, Cursores P1/P2, Filtro A-Z, Buscador y Retratos SVG)
// 3. Sistema Real de Login / Logout / Registro / Cambio de Cuenta (authLive + Passkeys + OAuth + RBAC + Persistencia localStorage)

(function () {
  const TEKKEN_8_ROSTER_43 = [
    // 32 BASE ROSTER
    { slug: 'alisa', name: 'Alisa Bosconovitch', short: 'Alisa', season: 'BASE', archetype: 'Chainsaw / Mobility', country: 'RU', color: '#F472B6', hair: '#EC4899', code: 'AL' },
    { slug: 'asuka', name: 'Asuka Kazama', short: 'Asuka', season: 'BASE', archetype: 'Kazama Defensive / Parries', country: 'JP', color: '#38BDF8', hair: '#475569', code: 'AS' },
    { slug: 'azucena', name: 'Azucena Ortiz', short: 'Azucena', season: 'BASE', archetype: 'Libertador Stance / Mixup', country: 'PE', color: '#FBBF24', hair: '#78350F', code: 'AZ' },
    { slug: 'bryan', name: 'Bryan Fury', short: 'Bryan', season: 'BASE', archetype: 'Counter-Hit / Taunt Jet Upper', country: 'US', color: '#94A3B8', hair: '#E2E8F0', code: 'BR' },
    { slug: 'claudio', name: 'Claudio Serafino', short: 'Claudio', season: 'BASE', archetype: 'Starburst / Keepout', country: 'IT', color: '#60A5FA', hair: '#1E293B', code: 'CL' },
    { slug: 'devil-jin', name: 'Devil Jin', short: 'Devil Jin', season: 'BASE', archetype: 'Mishima / Mourning Crow', country: 'JP', color: '#A855F7', hair: '#0F172A', code: 'DJ' },
    { slug: 'feng', name: 'Feng Wei', short: 'Feng', season: 'BASE', archetype: 'Kenpo Pokes / Evasive', country: 'CN', color: '#EF4444', hair: '#090D16', code: 'FW' },
    { slug: 'hwoarang', name: 'Hwoarang', short: 'Hwoarang', season: 'BASE', archetype: 'Taekwondo / Flamingo Rush', country: 'KR', color: '#F97316', hair: '#EA580C', code: 'HW' },
    { slug: 'jack-8', name: 'Jack-8', short: 'Jack-8', season: 'BASE', archetype: 'Gamma Howl / Big Body', country: 'RU', color: '#DC2626', hair: '#FACC15', code: 'J8' },
    { slug: 'jin', name: 'Jin Kazama', short: 'Jin', season: 'BASE', archetype: 'All-Rounder / Karate', country: 'JP', color: '#EF4444', hair: '#0F172A', code: 'JN' },
    { slug: 'jun', name: 'Jun Kazama', short: 'Jun', season: 'BASE', archetype: 'Kazama Style / Purify', country: 'JP', color: '#E2E8F0', hair: '#1E293B', code: 'JU' },
    { slug: 'kazuya', name: 'Kazuya Mishima', short: 'Kazuya', season: 'BASE', archetype: 'Mishima / 50-50 Vortex & EWGF', country: 'JP', color: '#8B5CF6', hair: '#0F172A', code: 'KZ' },
    { slug: 'king', name: 'King', short: 'King', season: 'BASE', archetype: 'Grappler / Chain Throws', country: 'MX', color: '#F59E0B', hair: '#D97706', code: 'KG' },
    { slug: 'kuma', name: 'Kuma', short: 'Kuma', season: 'BASE', archetype: 'Heihachi Bear / Salmon Charge', country: 'JP', color: '#B45309', hair: '#78350F', code: 'KM' },
    { slug: 'lars', name: 'Lars Alexandersson', short: 'Lars', season: 'BASE', archetype: 'Dynamic Entry / Stance Rush', country: 'SE', color: '#3B82F6', hair: '#FDE047', code: 'LR' },
    { slug: 'lee', name: 'Lee Chaolan', short: 'Lee', season: 'BASE', archetype: 'Marvelous Counter-Hit / Just Frames', country: 'JP', color: '#C084FC', hair: '#CBD5E1', code: 'LE' },
    { slug: 'leo', name: 'Leo Kliesen', short: 'Leo', season: 'BASE', archetype: 'Baji Quan / Balanced Mixup', country: 'DE', color: '#2DD4BF', hair: '#FDE68A', code: 'LO' },
    { slug: 'leroy', name: 'Leroy Smith', short: 'Leroy', season: 'BASE', archetype: 'Wing Chun / Hermit Parries', country: 'US', color: '#FDE047', hair: '#F8FAFC', code: 'LY' },
    { slug: 'lili', name: 'Lili Rochefort', short: 'Lili', season: 'BASE', archetype: 'Sidestep / Dew Glide', country: 'MC', color: '#F9A8D4', hair: '#FEF08A', code: 'LI' },
    { slug: 'xiaoyu', name: 'Ling Xiaoyu', short: 'Xiaoyu', season: 'BASE', archetype: 'Art of Phoenix / Evasive', country: 'CN', color: '#FB923C', hair: '#1E293B', code: 'XY' },
    { slug: 'law', name: 'Marshall Law', short: 'Law', season: 'BASE', archetype: 'Dragon Charge / Nunchaku', country: 'US', color: '#FACC15', hair: '#0F172A', code: 'LW' },
    { slug: 'nina', name: 'Nina Williams', short: 'Nina', season: 'BASE', archetype: 'Assassin Rushdown / Dual Pistols', country: 'IE', color: '#A78BFA', hair: '#FDE047', code: 'NI' },
    { slug: 'panda', name: 'Panda', short: 'Panda', season: 'BASE', archetype: 'Bear Style / Shooting Star', country: 'CN', color: '#10B981', hair: '#F8FAFC', code: 'PD' },
    { slug: 'paul', name: 'Paul Phoenix', short: 'Paul', season: 'BASE', archetype: 'Deathfist / Demolition Man', country: 'US', color: '#EF4444', hair: '#FACC15', code: 'PL' },
    { slug: 'raven', name: 'Raven', short: 'Raven', season: 'BASE', archetype: 'Ninjutsu / Shadow Clones', country: 'UN', color: '#6366F1', hair: '#E2E8F0', code: 'RV' },
    { slug: 'reina', name: 'Reina', short: 'Reina', season: 'BASE', archetype: 'Taido + Mishima / Sentai', country: 'JP', color: '#A855F7', hair: '#6B21A8', code: 'RN' },
    { slug: 'dragunov', name: 'Sergei Dragunov', short: 'Dragunov', season: 'BASE', archetype: 'Commando Sambo / Plus Frames', country: 'RU', color: '#00F0FF', hair: '#1E293B', code: 'DR' },
    { slug: 'shaheen', name: 'Shaheen', short: 'Shaheen', season: 'BASE', archetype: 'Military CQC / Stealth Step', country: 'SA', color: '#34D399', hair: '#1E293B', code: 'SH' },
    { slug: 'steve', name: 'Steve Fox', short: 'Steve', season: 'BASE', archetype: 'Boxing / Lionheart & B1', country: 'GB', color: '#60A5FA', hair: '#FDE047', code: 'ST' },
    { slug: 'victor', name: 'Victor Chevalier', short: 'Victor', season: 'BASE', archetype: 'Iaido Teleport / Perfumer', country: 'FR', color: '#38BDF8', hair: '#E2E8F0', code: 'VC' },
    { slug: 'yoshimitsu', name: 'Yoshimitsu', short: 'Yoshimitsu', season: 'BASE', archetype: 'Manji Ninjutsu / Flash Sword', country: 'JP', color: '#22D3EE', hair: '#9333EA', code: 'YO' },
    { slug: 'zafina', name: 'Zafina', short: 'Zafina', season: 'BASE', archetype: 'Azazel Power / Scarecrow', country: 'EG', color: '#C084FC', hair: '#1E293B', code: 'ZF' },

    // SEASON 1 DLC (4)
    { slug: 'eddy', name: 'Eddy Gordo', short: 'Eddy', season: 'SEASON_1', archetype: 'Capoeira / Mandinga', country: 'BR', color: '#22C55E', hair: '#451A03', code: 'ED' },
    { slug: 'lidia', name: 'Lidia Sobieska', short: 'Lidia', season: 'SEASON_1', archetype: 'Shotokan Karate / Heaven & Earth', country: 'PL', color: '#F43F5E', hair: '#FEF08A', code: 'LD' },
    { slug: 'heihachi', name: 'Heihachi Mishima', short: 'Heihachi', season: 'SEASON_1', archetype: 'Mishima / Warrior Instinct', country: 'JP', color: '#F59E0B', hair: '#E2E8F0', code: 'HH' },
    { slug: 'clive', name: 'Clive Rosfield', short: 'Clive', season: 'SEASON_1', archetype: 'FFXVI Guest / Ifrit & Phoenix', country: 'FF', color: '#FF0055', hair: '#0F172A', code: 'CV' },

    // SEASON 2 DLC (4)
    { slug: 'anna', name: 'Anna Williams', short: 'Anna', season: 'SEASON_2', archetype: 'Chaos Judgment / 50-50', country: 'IE', color: '#E11D48', hair: '#7F1D1D', code: 'AN' },
    { slug: 'fahkumram', name: 'Fahkumram', short: 'Fahkumram', season: 'SEASON_2', archetype: 'Muay Thai / Guard Break', country: 'TH', color: '#F97316', hair: '#1E293B', code: 'FK' },
    { slug: 'armor-king', name: 'Armor King', short: 'Armor King', season: 'SEASON_2', archetype: 'Dark Upper / Hybrid Grappler', country: 'MX', color: '#A3E635', hair: '#374151', code: 'AK' },
    { slug: 'miary-zo', name: 'Miary Zo', short: 'Miary Zo', season: 'SEASON_2', archetype: 'Moraingy / Agile Striker', country: 'MG', color: '#EC4899', hair: '#1E293B', code: 'MZ' },

    // SEASON 3 DLC (3)
    { slug: 'kunimitsu-ii', name: 'Kunimitsu II', short: 'Kunimitsu II', season: 'SEASON_3', archetype: 'Kunai Teleport / Urban Ninja', country: 'JP', color: '#A855F7', hair: '#2DD4BF', code: 'KN' },
    { slug: 'bob', name: 'Bob (Robert Richards)', short: 'Bob', season: 'SEASON_3', archetype: 'Speed & Weight / Karate', country: 'US', color: '#FBBF24', hair: '#FDE047', code: 'BB' },
    { slug: 'roger-jr', name: 'Roger Jr.', short: 'Roger Jr.', season: 'SEASON_3', archetype: 'Commando Kangaroo', country: 'AU', color: '#FB923C', hair: '#9A3412', code: 'RJ' }
  ];

  // Generar retrato SVG estilizado para cada luchador (estilo casilla de selección de Tekken 8)
  function getCharacterSvgDataUri(c) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="bg_${c.slug}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${c.color}" stop-opacity="0.48"/>
          <stop offset="60%" stop-color="#0D131F" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#05080D" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="14" fill="url(#bg_${c.slug})"/>
      <circle cx="60" cy="44" r="22" fill="#E2E8F0" opacity="0.9"/>
      <path d="M35 38 Q60 12 85 38 L82 24 Q60 10 38 24 Z" fill="${c.hair}"/>
      <path d="M22 114 C24 78 96 78 98 114 Z" fill="${c.color}" opacity="0.85"/>
      <rect x="6" y="88" width="108" height="26" rx="6" fill="#070A0F" opacity="0.82"/>
      <text x="60" y="106" text-anchor="middle" fill="#F8FAFC" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="14">${c.short.toUpperCase()}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Inyectar los 43 personajes en GAMES_CATALOG['tekken-8']
  if (typeof GAMES_CATALOG !== 'undefined' && GAMES_CATALOG['tekken-8']) {
    GAMES_CATALOG['tekken-8'].characters = TEKKEN_8_ROSTER_43.map((c) => ({
      ...c,
      avatar: getCharacterSvgDataUri(c)
    }));
  }

  // Estado del selector Arcade y del Sistema de Sesión (authLive)
  const EXT_STATE = {
    activeSlot: 'P1',
    charSearch: '',
    charLetter: 'ALL',
    charSeason: 'ALL',
    selectedP1Char: 'Sergei Dragunov',
    selectedP2Char: 'Kazuya Mishima',
    isAuthenticated: true,
    currentUser: {
      id: 'usr-niklauss-01',
      gamertag: 'Niklauss#KR1',
      email: 'niklauss@nexusgrid.gg',
      role: 'SUPER_ADMIN',
      authMethod: 'Passkey / WebAuthn',
      elo: 2140,
      mainCharacter: 'Sergei Dragunov'
    },
    presetAccounts: [
      { id: 'usr-niklauss-01', gamertag: 'Niklauss#KR1', email: 'niklauss@nexusgrid.gg', role: 'SUPER_ADMIN', authMethod: 'Passkey / WebAuthn', elo: 2140, mainCharacter: 'Sergei Dragunov' },
      { id: 'usr-director-02', gamertag: 'EvoDirector#VEGAS', email: 'director@evo.gg', role: 'TOURNAMENT_DIRECTOR', authMethod: 'Discord OAuth', elo: 1980, mainCharacter: 'Reina' },
      { id: 'usr-referee-03', gamertag: 'RefereeBogota#EST1', email: 'referee@bogotafgc.co', role: 'REFEREE', authMethod: 'Ephemeral Token', elo: 1850, mainCharacter: 'King' },
      { id: 'usr-streamer-04', gamertag: 'OBS_Broadcast#LIVE', email: 'stream@nexusgrid.gg', role: 'STREAMER', authMethod: 'Twitch OAuth', elo: 1910, mainCharacter: 'Jin Kazama' },
      { id: 'usr-player-05', gamertag: 'ArslanAsh#PK', email: 'arslan@fgc.pk', role: 'PLAYER', authMethod: 'Steam OpenID', elo: 2115, mainCharacter: 'Nina Williams' }
    ]
  };

  // Cargar sesión persistida si existe
  try {
    const saved = localStorage.getItem('nexus_grid_auth_session_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      EXT_STATE.isAuthenticated = parsed.isAuthenticated;
      if (parsed.currentUser) EXT_STATE.currentUser = parsed.currentUser;
    }
  } catch (e) {}

  function saveSession() {
    try {
      localStorage.setItem(
        'nexus_grid_auth_session_v1',
        JSON.stringify({
          isAuthenticated: EXT_STATE.isAuthenticated,
          currentUser: EXT_STATE.currentUser
        })
      );
    } catch (e) {}
  }

  function findCharObj(name) {
    return (
      TEKKEN_8_ROSTER_43.find((c) => c.name === name || c.short === name) ||
      TEKKEN_8_ROSTER_43[26]
    );
  }

  function injectArcadeAndAuthUI() {
    // 1. Añadir botón de Logout / Login en el Header junto al usuario
    const authQuickBtn = document.getElementById('btnOpenAuthQuick');
    if (authQuickBtn && !document.getElementById('btnHeaderLogout')) {
      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'btnHeaderLogout';
      logoutBtn.type = 'button';
      logoutBtn.className =
        'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition bg-neoncrimson/15 border-neoncrimson/50 text-rose-300 hover:bg-neoncrimson/30 flex items-center gap-1';
      logoutBtn.innerHTML = '<span>Salir (Logout)</span>';
      authQuickBtn.parentNode.insertBefore(logoutBtn, authQuickBtn.nextSibling);

      logoutBtn.addEventListener('click', () => {
        if (EXT_STATE.isAuthenticated) {
          performLogout();
        } else {
          openAuthSessionModal();
        }
      });

      authQuickBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openAuthSessionModal();
      });
    }

    // 2. Mejorar el panel SetGameSelection en la barra derecha con botones visuales de retrato P1 / P2 + Botón Arcade
    const c1Sel = document.getElementById('selectReporterChar1');
    const c2Sel = document.getElementById('selectReporterChar2');
    if (c1Sel && c2Sel && !document.getElementById('arcadeQuickPickerBox')) {
      const parentBox = c1Sel.closest('.bg-obsidian\\/70');
      if (parentBox) {
        const arcadeDiv = document.createElement('div');
        arcadeDiv.id = 'arcadeQuickPickerBox';
        arcadeDiv.className = 'flex flex-col gap-2 pt-1';
        arcadeDiv.innerHTML = `
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="btnOpenArcadeP1" class="flex items-center gap-2 p-1.5 rounded-xl bg-cyberslate border border-neoncyan/50 hover:bg-neoncyan/15 transition text-left">
              <img id="imgReporterP1Char" src="" alt="P1" class="w-9 h-9 rounded-lg object-cover border border-neoncyan" />
              <div class="min-w-0">
                <div class="text-[9px] font-mono text-neoncyan font-bold">P1 • CAMBIAR</div>
                <div id="lblReporterP1Char" class="text-[11px] font-bold text-icewhite truncate">Dragunov</div>
              </div>
            </button>
            <button type="button" id="btnOpenArcadeP2" class="flex items-center gap-2 p-1.5 rounded-xl bg-cyberslate border border-neoncrimson/50 hover:bg-neoncrimson/15 transition text-left">
              <img id="imgReporterP2Char" src="" alt="P2" class="w-9 h-9 rounded-lg object-cover border border-neoncrimson" />
              <div class="min-w-0">
                <div class="text-[9px] font-mono text-rose-400 font-bold">P2 • CAMBIAR</div>
                <div id="lblReporterP2Char" class="text-[11px] font-bold text-icewhite truncate">Kazuya</div>
              </div>
            </button>
          </div>
          <button type="button" id="btnOpenFullArcadeGrid" class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-neoncyan/20 via-neonpurple/25 to-neoncrimson/20 border border-neoncyan/50 hover:border-neoncyan text-xs font-display font-bold text-icewhite flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.18)]">
            <span>🎮 Pantalla Arcade de Personajes (43 + Filtro A-Z)</span>
          </button>
        `;
        parentBox.insertBefore(arcadeDiv, parentBox.children[1]);

        document.getElementById('btnOpenArcadeP1').addEventListener('click', () => openArcadeSelectModal('P1'));
        document.getElementById('btnOpenArcadeP2').addEventListener('click', () => openArcadeSelectModal('P2'));
        document.getElementById('btnOpenFullArcadeGrid').addEventListener('click', () => openArcadeSelectModal('P1'));
      }
    }

    // 3. Crear el Modal de Pantalla Arcade de Selección de Personajes (Estilo Tekken 8)
    const arcadeModal = document.createElement('div');
    arcadeModal.id = 'tekkenArcadeSelectModal';
    arcadeModal.className =
      'hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4';
    arcadeModal.innerHTML = `
      <div class="cyber-glass-cyan rounded-2xl max-w-6xl w-full p-4 sm:p-5 flex flex-col gap-3.5 max-h-[94vh] border-2 border-neoncyan/60 shadow-[0_0_50px_rgba(0,240,255,0.25)]">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-cyberborder pb-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neoncyan text-obsidian">SELECT CHARACTER • TEKKEN 8</span>
              <span class="text-xs font-mono text-purple-300">32 Base + Season 1 (4) + Season 2 (4) + Season 3 (3) = 43 Luchadores</span>
            </div>
            <h3 class="font-display font-bold text-lg sm:text-xl text-icewhite mt-0.5">
              Pantalla Arcade de Selección Rápida (Clic en Retrato, Búsqueda o Letra A-Z)
            </h3>
          </div>
          <button type="button" id="btnCloseArcadeModal" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-icewhite">✕ Cerrar [ESC]</button>
        </div>

        <!-- P1 VS P2 ACTIVE FIGHTER BANNER -->
        <div class="grid grid-cols-1 sm:grid-cols-11 gap-2 items-center bg-obsidian/90 border border-cyberborder rounded-xl p-2.5">
          <button type="button" id="btnSlotCursorP1" class="sm:col-span-5 flex items-center gap-3 p-2 rounded-xl border-2 border-neoncyan bg-neoncyan/15 text-left transition">
            <img id="arcadeBannerImgP1" src="" class="w-12 h-12 rounded-xl border border-neoncyan object-cover" />
            <div class="min-w-0 flex-1">
              <div class="text-[10px] font-mono font-bold text-neoncyan uppercase">● CURSOR JUGADOR 1 (P1)</div>
              <div id="arcadeBannerNameP1" class="font-display font-bold text-base text-icewhite truncate">Sergei Dragunov</div>
              <div id="arcadeBannerMetaP1" class="text-[11px] font-mono text-slateneutral truncate">Commando Sambo • RU</div>
            </div>
          </button>

          <div class="sm:col-span-1 flex flex-col items-center justify-center">
            <button type="button" id="btnArcadeRandomCenter" class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/30 to-neonpurple/30 border-2 border-amber-400 text-amber-300 font-display font-bold text-xl hover:scale-105 transition shadow-[0_0_15px_rgba(245,158,11,0.35)]" title="Selección Aleatoria (?)">
              ?
            </button>
            <span class="text-[9px] font-mono text-amber-300 mt-0.5">RANDOM</span>
          </div>

          <button type="button" id="btnSlotCursorP2" class="sm:col-span-5 flex items-center justify-between gap-3 p-2 rounded-xl border-2 border-cyberborder bg-cyberslate/80 text-right transition">
            <div class="min-w-0 flex-1">
              <div class="text-[10px] font-mono font-bold text-rose-400 uppercase">CURSOR JUGADOR 2 (P2) ●</div>
              <div id="arcadeBannerNameP2" class="font-display font-bold text-base text-icewhite truncate">Kazuya Mishima</div>
              <div id="arcadeBannerMetaP2" class="text-[11px] font-mono text-slateneutral truncate">Mishima Vortex • JP</div>
            </div>
            <img id="arcadeBannerImgP2" src="" class="w-12 h-12 rounded-xl border border-neoncrimson object-cover" />
          </button>
        </div>

        <!-- SEARCH BAR + SEASON FILTER + A-Z BAR -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <input id="inputArcadeSearch" type="text" placeholder="🔍 Escribe nombre o estilo (ej. Azucena, Clive, Heihachi, Armor King, Kunimitsu, Bob, Roger)..." class="flex-1 min-w-[220px] bg-obsidian border border-cyberborder focus:border-neoncyan rounded-xl px-3.5 py-2 text-xs font-mono text-icewhite focus:outline-none" />
            <div class="flex flex-wrap gap-1" id="arcadeSeasonTabs">
              <button type="button" data-season="ALL" class="season-tab-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-neoncyan text-obsidian">Todos (43)</button>
              <button type="button" data-season="BASE" class="season-tab-btn px-2.5 py-1.5 rounded-lg text-xs font-mono bg-obsidian text-slateneutral border border-cyberborder">Base (32)</button>
              <button type="button" data-season="SEASON_1" class="season-tab-btn px-2.5 py-1.5 rounded-lg text-xs font-mono bg-obsidian text-purple-300 border border-cyberborder">Season 1 (4)</button>
              <button type="button" data-season="SEASON_2" class="season-tab-btn px-2.5 py-1.5 rounded-lg text-xs font-mono bg-obsidian text-amber-300 border border-cyberborder">Season 2 (4)</button>
              <button type="button" data-season="SEASON_3" class="season-tab-btn px-2.5 py-1.5 rounded-lg text-xs font-mono bg-obsidian text-emerald-300 border border-cyberborder">Season 3 (3)</button>
            </div>
          </div>
          <div id="arcadeAlphabetBar" class="flex flex-wrap items-center gap-1"></div>
        </div>

        <!-- TEKKEN 8 SLANTED PARALLELOGRAM PORTRAIT GRID -->
        <div id="arcadeCharactersGrid" class="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2 overflow-y-auto pr-1 py-1 max-h-[420px]"></div>

        <div class="flex items-center justify-between pt-2 border-t border-cyberborder text-xs font-mono">
          <span class="text-slateneutral">Tip: Haz clic en un retrato para asignarlo al cursor activo (<strong id="lblActiveCursorHint" class="text-neoncyan">P1</strong>)</span>
          <button type="button" id="btnConfirmArcadeSelection" class="px-5 py-2 rounded-xl bg-neoncyan text-obsidian font-display font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.35)]">
            ✓ Confirmar Mains para el Set
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(arcadeModal);

    // 4. Crear el Modal Completo de Login / Logout / Cambio de Cuenta (authLive)
    const authModal = document.createElement('div');
    authModal.id = 'authLiveSessionModal';
    authModal.className =
      'hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4';
    authModal.innerHTML = `
      <div class="cyber-glass-cyan rounded-2xl max-w-2xl w-full p-5 flex flex-col gap-4 border border-neoncyan/60 shadow-2xl">
        <div class="flex items-center justify-between border-b border-cyberborder pb-3">
          <div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neoncyan/20 text-neoncyan border border-neoncyan/40">
              @nexus-grid/auth-server • Basado en alzheimeer/authLive
            </span>
            <h3 class="font-display font-bold text-xl text-icewhite mt-1">
              Gestión de Sesión: Iniciar Sesión, Cerrar Sesión o Cambiar Rol
            </h3>
          </div>
          <button type="button" id="btnCloseAuthModal" class="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-icewhite">✕</button>
        </div>

        <!-- ESTADO ACTUAL DE LA SESIÓN -->
        <div id="authCurrentSessionBanner" class="bg-obsidian border border-cyberborder rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3"></div>

        <!-- CAMBIO RÁPIDO ENTRE CUENTAS DEMO CON DISTINTOS ROLES RBAC -->
        <div>
          <div class="text-xs font-mono uppercase text-neoncyan mb-2">1. Cambiar de Cuenta en 1 Clic (Prueba todos los Roles RBAC):</div>
          <div id="authPresetAccountsList" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
        </div>

        <!-- FORMULARIO DE INICIO DE SESIÓN / REGISTRO PERSONALIZADO -->
        <div class="border-t border-cyberborder pt-3 flex flex-col gap-2.5">
          <div class="text-xs font-mono uppercase text-purple-300">2. O Inicia Sesión / Regístrate con tu propio Gamertag:</div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input id="inputAuthCustomTag" type="text" placeholder="Gamertag (ej. Knee#KR)" class="bg-obsidian border border-cyberborder rounded-xl px-3 py-2 text-xs font-mono text-icewhite" />
            <input id="inputAuthCustomEmail" type="email" placeholder="Correo (ej. knee@t8.kr)" class="bg-obsidian border border-cyberborder rounded-xl px-3 py-2 text-xs font-mono text-icewhite" />
            <select id="selectAuthCustomRole" class="bg-obsidian border border-cyberborder rounded-xl px-3 py-2 text-xs font-mono text-neoncyan">
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="TOURNAMENT_DIRECTOR">TOURNAMENT_DIRECTOR</option>
              <option value="REFEREE">REFEREE (Árbitro)</option>
              <option value="STREAMER">STREAMER (OBS)</option>
              <option value="PAY_EDITOR">PAY_EDITOR (Tesorero)</option>
              <option value="PLAYER">PLAYER (Competidor)</option>
            </select>
          </div>
          <div class="flex flex-wrap gap-2 mt-1">
            <button type="button" id="btnLoginCustomCreds" class="flex-1 py-2.5 px-4 rounded-xl bg-neoncyan text-obsidian font-display font-bold text-xs uppercase tracking-wider">
              🔑 Iniciar Sesión / Crear Cuenta
            </button>
            <button type="button" id="btnLoginPasskeyModal" class="py-2.5 px-4 rounded-xl bg-neonpurple/25 border border-neonpurple text-purple-200 font-mono text-xs font-bold">
              🔐 Passkey Biométrica
            </button>
            <button type="button" id="btnLogoutFromModal" class="py-2.5 px-4 rounded-xl bg-neoncrimson/20 border border-neoncrimson text-rose-300 font-mono text-xs font-bold">
              🚪 Cerrar Sesión (Logout)
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(authModal);

    bindArcadeAndAuthEvents();
    syncHeaderAndCatalogUI();
  }

  function renderAlphabetButtons() {
    const bar = document.getElementById('arcadeAlphabetBar');
    if (!bar) return;
    const letters = Array.from(new Set(TEKKEN_8_ROSTER_43.map((c) => c.name[0].toUpperCase()))).sort();
    const all = ['ALL', ...letters];
    bar.innerHTML = all
      .map((l) => {
        const active = EXT_STATE.charLetter === l;
        return `<button type="button" data-letter="${l}" class="arcade-letter-btn px-2 py-1 rounded text-[11px] font-mono font-bold transition ${
          active
            ? 'bg-neoncyan text-obsidian shadow-[0_0_10px_rgba(0,240,255,0.4)]'
            : 'bg-obsidian text-slateneutral hover:text-icewhite border border-cyberborder'
        }">${l === 'ALL' ? 'A-Z (Todos)' : l}</button>`;
      })
      .join('');

    bar.querySelectorAll('.arcade-letter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        EXT_STATE.charLetter = btn.getAttribute('data-letter');
        renderAlphabetButtons();
        renderArcadeCharacterGrid();
      });
    });
  }

  function renderArcadeCharacterGrid() {
    const grid = document.getElementById('arcadeCharactersGrid');
    if (!grid) return;

    const p1Obj = findCharObj(EXT_STATE.selectedP1Char);
    const p2Obj = findCharObj(EXT_STATE.selectedP2Char);

    document.getElementById('arcadeBannerImgP1').src = getCharacterSvgDataUri(p1Obj);
    document.getElementById('arcadeBannerNameP1').textContent = p1Obj.name;
    document.getElementById('arcadeBannerMetaP1').textContent = `${p1Obj.archetype} • ${p1Obj.country} (${p1Obj.season})`;

    document.getElementById('arcadeBannerImgP2').src = getCharacterSvgDataUri(p2Obj);
    document.getElementById('arcadeBannerNameP2').textContent = p2Obj.name;
    document.getElementById('arcadeBannerMetaP2').textContent = `${p2Obj.archetype} • ${p2Obj.country} (${p2Obj.season})`;

    document.getElementById('btnSlotCursorP1').className = `sm:col-span-5 flex items-center gap-3 p-2 rounded-xl border-2 text-left transition ${
      EXT_STATE.activeSlot === 'P1'
        ? 'border-neoncyan bg-neoncyan/15 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
        : 'border-cyberborder bg-cyberslate/70 opacity-80'
    }`;
    document.getElementById('btnSlotCursorP2').className = `sm:col-span-5 flex items-center justify-between gap-3 p-2 rounded-xl border-2 text-right transition ${
      EXT_STATE.activeSlot === 'P2'
        ? 'border-neoncrimson bg-neoncrimson/15 shadow-[0_0_15px_rgba(255,0,85,0.3)]'
        : 'border-cyberborder bg-cyberslate/70 opacity-80'
    }`;
    document.getElementById('lblActiveCursorHint').textContent = EXT_STATE.activeSlot;

    const filtered = TEKKEN_8_ROSTER_43.filter((c) => {
      if (EXT_STATE.charSeason !== 'ALL' && c.season !== EXT_STATE.charSeason) return false;
      if (EXT_STATE.charLetter !== 'ALL' && !c.name.toUpperCase().startsWith(EXT_STATE.charLetter)) return false;
      if (
        EXT_STATE.charSearch.trim() &&
        !c.name.toLowerCase().includes(EXT_STATE.charSearch.toLowerCase()) &&
        !c.archetype.toLowerCase().includes(EXT_STATE.charSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    grid.innerHTML = filtered
      .map((c) => {
        const isP1 = EXT_STATE.selectedP1Char === c.name;
        const isP2 = EXT_STATE.selectedP2Char === c.name;
        const borderCls =
          isP1 && isP2
            ? 'border-amber-400 ring-2 ring-amber-400/60 bg-amber-500/20'
            : isP1
            ? 'border-neoncyan ring-2 ring-neoncyan/60 bg-neoncyan/20'
            : isP2
            ? 'border-neoncrimson ring-2 ring-neoncrimson/60 bg-neoncrimson/20'
            : 'border-cyberborder bg-cyberslate/90 hover:border-neoncyan/70';

        const seasonTag =
          c.season === 'BASE'
            ? ''
            : `<span class="absolute top-1 left-1 px-1 py-0.2 rounded bg-purple-950/90 border border-purple-400/50 text-[8px] font-mono text-purple-200">${c.season.replace('SEASON_', 'S')}</span>`;

        const cursorTag =
          isP1 || isP2
            ? `<span class="absolute top-1 right-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold ${
                isP1 && isP2
                  ? 'bg-amber-400 text-obsidian'
                  : isP1
                  ? 'bg-neoncyan text-obsidian'
                  : 'bg-neoncrimson text-white'
              }">${isP1 && isP2 ? 'P1•P2' : isP1 ? 'P1' : 'P2'}</span>`
            : '';

        return `
          <div data-charname="${c.name}" class="arcade-char-tile relative rounded-xl p-1.5 border-2 ${borderCls} cursor-pointer transition-all transform hover:-translate-y-1 flex flex-col items-center">
            ${seasonTag}
            ${cursorTag}
            <img src="${getCharacterSvgDataUri(c)}" alt="${c.name}" class="w-16 h-16 rounded-lg object-cover" />
            <div class="text-[11px] font-bold text-icewhite truncate w-full text-center mt-1">${c.short}</div>
            <div class="text-[9px] font-mono text-slateneutral truncate w-full text-center">${c.country}</div>
          </div>
        `;
      })
      .join('');

    grid.querySelectorAll('.arcade-char-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const chosenName = tile.getAttribute('data-charname');
        assignCharacterToSlot(EXT_STATE.activeSlot, chosenName);
        if (EXT_STATE.activeSlot === 'P1') {
          EXT_STATE.activeSlot = 'P2';
        }
        renderArcadeCharacterGrid();
      });
    });
  }

  function assignCharacterToSlot(slot, charName) {
    if (slot === 'P1') {
      EXT_STATE.selectedP1Char = charName;
      const sel1 = document.getElementById('selectReporterChar1');
      if (sel1) sel1.value = charName;
      const activeSet = APP_STATE.sets.find((s) => s.setID === APP_STATE.selectedSetId);
      const p1 = activeSet ? getEntrantById(activeSet.entrant1ID) : null;
      if (p1) p1.mainCharacter = charName;
    } else {
      EXT_STATE.selectedP2Char = charName;
      const sel2 = document.getElementById('selectReporterChar2');
      if (sel2) sel2.value = charName;
      const activeSet = APP_STATE.sets.find((s) => s.setID === APP_STATE.selectedSetId);
      const p2 = activeSet ? getEntrantById(activeSet.entrant2ID) : null;
      if (p2) p2.mainCharacter = charName;
    }
    syncHeaderAndCatalogUI();
    if (typeof showToast === 'function') {
      showToast(`${slot} seleccionó a ${charName}`, slot === 'P1' ? 'cyan' : 'crimson');
    }
  }

  function openArcadeSelectModal(slot) {
    EXT_STATE.activeSlot = slot || 'P1';
    const sel1 = document.getElementById('selectReporterChar1');
    const sel2 = document.getElementById('selectReporterChar2');
    if (sel1 && sel1.value) EXT_STATE.selectedP1Char = sel1.value;
    if (sel2 && sel2.value) EXT_STATE.selectedP2Char = sel2.value;

    renderAlphabetButtons();
    renderArcadeCharacterGrid();
    document.getElementById('tekkenArcadeSelectModal').classList.remove('hidden');
  }

  function performLogout() {
    EXT_STATE.isAuthenticated = false;
    APP_STATE.activeRole = 'PLAYER';
    const roleSel = document.getElementById('headerRoleSelect');
    if (roleSel) {
      roleSel.value = 'PLAYER';
      roleSel.disabled = true;
    }
    saveSession();
    syncHeaderAndCatalogUI();
    renderAuthModalContent();
    if (typeof showToast === 'function') {
      showToast('Has cerrado sesión (Modo Invitado / Solo Lectura activo)', 'crimson');
    }
  }

  function performLogin(userObj) {
    EXT_STATE.isAuthenticated = true;
    EXT_STATE.currentUser = userObj;
    APP_STATE.activeRole = userObj.role;
    const roleSel = document.getElementById('headerRoleSelect');
    if (roleSel) {
      roleSel.disabled = false;
      roleSel.value = userObj.role;
    }
    saveSession();
    syncHeaderAndCatalogUI();
    renderAuthModalContent();
    if (typeof renderAll === 'function') renderAll();
    if (typeof showToast === 'function') {
      showToast(`Sesión iniciada como ${userObj.gamertag} (${userObj.role})`, 'cyan');
    }
  }

  function renderAuthModalContent() {
    const banner = document.getElementById('authCurrentSessionBanner');
    const list = document.getElementById('authPresetAccountsList');
    if (!banner || !list) return;

    if (EXT_STATE.isAuthenticated) {
      banner.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-neoncyan/20 border border-neoncyan flex items-center justify-center font-display font-bold text-neoncyan">
            ${EXT_STATE.currentUser.gamertag.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div class="text-xs font-mono text-emerald-400 font-bold">● SESIÓN ACTIVA (${EXT_STATE.currentUser.authMethod})</div>
            <div class="font-display font-bold text-base text-icewhite">${EXT_STATE.currentUser.gamertag} • <span class="text-neoncyan">${EXT_STATE.currentUser.role}</span></div>
            <div class="text-[11px] font-mono text-slateneutral">${EXT_STATE.currentUser.email} • Main: ${EXT_STATE.currentUser.mainCharacter}</div>
          </div>
        </div>
        <button type="button" id="btnBannerQuickLogout" class="px-3 py-1.5 rounded-xl bg-neoncrimson/20 border border-neoncrimson text-rose-300 font-mono text-xs font-bold hover:bg-neoncrimson/30">
          Cerrar Sesión
        </button>
      `;
      document.getElementById('btnBannerQuickLogout').addEventListener('click', performLogout);
    } else {
      banner.innerHTML = `
        <div>
          <div class="text-xs font-mono text-rose-400 font-bold">○ SIN SESIÓN ACTIVA (MODO INVITADO / SOLO LECTURA)</div>
          <div class="text-xs text-slateneutral mt-0.5">Selecciona una cuenta abajo o ingresa tus credenciales para desbloquear el reporte de partidas y administración.</div>
        </div>
      `;
    }

    list.innerHTML = EXT_STATE.presetAccounts
      .map((acc, idx) => {
        const isCurrent = EXT_STATE.isAuthenticated && EXT_STATE.currentUser.gamertag === acc.gamertag;
        return `
          <button type="button" data-accidx="${idx}" class="preset-acc-btn p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
            isCurrent
              ? 'border-neoncyan bg-neoncyan/15'
              : 'border-cyberborder bg-cyberslate/80 hover:border-neoncyan/50'
          }">
            <div class="min-w-0">
              <div class="font-display font-bold text-xs text-icewhite truncate">${acc.gamertag}</div>
              <div class="text-[10px] font-mono text-neoncyan">${acc.role} • ${acc.authMethod}</div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded ${
              isCurrent ? 'bg-neoncyan text-obsidian font-bold' : 'bg-obsidian text-slateneutral'
            }">${isCurrent ? 'ACTIVO' : 'Entrar'}</span>
          </button>
        `;
      })
      .join('');

    list.querySelectorAll('.preset-acc-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-accidx'));
        performLogin(EXT_STATE.presetAccounts[idx]);
      });
    });
  }

  function openAuthSessionModal() {
    renderAuthModalContent();
    document.getElementById('authLiveSessionModal').classList.remove('hidden');
  }

  function syncHeaderAndCatalogUI() {
    const userTagEl = document.getElementById('headerUserTag');
    const logoutBtn = document.getElementById('btnHeaderLogout');
    if (userTagEl) {
      userTagEl.textContent = EXT_STATE.isAuthenticated
        ? `${EXT_STATE.currentUser.gamertag}`
        : 'Iniciar Sesión (Invitado)';
    }
    if (logoutBtn) {
      if (EXT_STATE.isAuthenticated) {
        logoutBtn.textContent = 'Cerrar Sesión';
        logoutBtn.className =
          'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition bg-neoncrimson/15 border-neoncrimson/50 text-rose-300 hover:bg-neoncrimson/30';
      } else {
        logoutBtn.textContent = '🔑 Entrar';
        logoutBtn.className =
          'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition bg-emerald-500/20 border-emerald-400 text-emerald-300 hover:bg-emerald-500/30';
      }
    }

    // Actualizar tarjeta holográfica de Fase 1 con el usuario logueado
    const holoName = document.getElementById('holoPlayerName');
    const holoMain = document.getElementById('holoPlayerMain');
    const holoElo = document.getElementById('holoCardElo');
    const holoAv = document.getElementById('holoAvatarText');
    if (holoName && EXT_STATE.isAuthenticated) {
      holoName.textContent = EXT_STATE.currentUser.gamertag;
      if (holoMain) holoMain.textContent = `Main: ${EXT_STATE.currentUser.mainCharacter} • Rol: ${EXT_STATE.currentUser.role}`;
      if (holoElo) holoElo.textContent = `ELO: ${EXT_STATE.currentUser.elo} (VERIFIED)`;
      if (holoAv) holoAv.textContent = EXT_STATE.currentUser.gamertag.slice(0, 2).toUpperCase();
    } else if (holoName && !EXT_STATE.isAuthenticated) {
      holoName.textContent = 'Invitado (Sin Sesión)';
      if (holoMain) holoMain.textContent = 'Inicia sesión para vincular tu Passkey y Mains';
    }

    // Actualizar miniaturas P1 y P2 en el Score Reporter
    const sel1 = document.getElementById('selectReporterChar1');
    const sel2 = document.getElementById('selectReporterChar2');
    const p1Char = findCharObj((sel1 && sel1.value) || EXT_STATE.selectedP1Char);
    const p2Char = findCharObj((sel2 && sel2.value) || EXT_STATE.selectedP2Char);

    const img1 = document.getElementById('imgReporterP1Char');
    const lbl1 = document.getElementById('lblReporterP1Char');
    const img2 = document.getElementById('imgReporterP2Char');
    const lbl2 = document.getElementById('lblReporterP2Char');

    if (img1 && lbl1) {
      img1.src = getCharacterSvgDataUri(p1Char);
      lbl1.textContent = p1Char.short;
    }
    if (img2 && lbl2) {
      img2.src = getCharacterSvgDataUri(p2Char);
      lbl2.textContent = p2Char.short;
    }

    // Enriquecer también la cuadrícula de catálogo en la pestaña Fase 1 con los 43 retratos clicables
    const catGrid = document.getElementById('catalogCharactersGrid');
    if (catGrid && APP_STATE.activeGameSlug === 'tekken-8') {
      catGrid.className = 'grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1';
      catGrid.innerHTML = TEKKEN_8_ROSTER_43.map(
        (c) => `
        <div data-catchar="${c.name}" class="cat-char-card bg-obsidian border border-cyberborder hover:border-neoncyan rounded-xl p-2 flex items-center gap-2 cursor-pointer transition">
          <img src="${getCharacterSvgDataUri(c)}" alt="${c.name}" class="w-9 h-9 rounded-lg object-cover border border-cyberborder" />
          <div class="min-w-0">
            <div class="text-xs font-bold text-icewhite truncate">${c.short}</div>
            <div class="text-[9px] font-mono text-neoncyan truncate">${c.season === 'BASE' ? 'Base Roster' : c.season.replace('_', ' ')}</div>
          </div>
        </div>
      `
      ).join('');
      catGrid.querySelectorAll('.cat-char-card').forEach((card) => {
        card.addEventListener('click', () => {
          openArcadeSelectModal('P1');
        });
      });
    }
  }

  function bindArcadeAndAuthEvents() {
    document.getElementById('btnCloseArcadeModal').addEventListener('click', () => {
      document.getElementById('tekkenArcadeSelectModal').classList.add('hidden');
    });
    document.getElementById('btnConfirmArcadeSelection').addEventListener('click', () => {
      document.getElementById('tekkenArcadeSelectModal').classList.add('hidden');
      syncHeaderAndCatalogUI();
    });

    document.getElementById('btnSlotCursorP1').addEventListener('click', () => {
      EXT_STATE.activeSlot = 'P1';
      renderArcadeCharacterGrid();
    });
    document.getElementById('btnSlotCursorP2').addEventListener('click', () => {
      EXT_STATE.activeSlot = 'P2';
      renderArcadeCharacterGrid();
    });

    document.getElementById('btnArcadeRandomCenter').addEventListener('click', () => {
      const rand = TEKKEN_8_ROSTER_43[Math.floor(Math.random() * TEKKEN_8_ROSTER_43.length)];
      assignCharacterToSlot(EXT_STATE.activeSlot, rand.name);
      renderArcadeCharacterGrid();
    });

    document.getElementById('inputArcadeSearch').addEventListener('input', (e) => {
      EXT_STATE.charSearch = e.target.value;
      renderArcadeCharacterGrid();
    });

    document.querySelectorAll('.season-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        EXT_STATE.charSeason = btn.getAttribute('data-season');
        document.querySelectorAll('.season-tab-btn').forEach((b) => {
          b.className = 'season-tab-btn px-2.5 py-1.5 rounded-lg text-xs font-mono bg-obsidian text-slateneutral border border-cyberborder';
        });
        btn.className = 'season-tab-btn px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-neoncyan text-obsidian';
        renderArcadeCharacterGrid();
      });
    });

    document.getElementById('btnCloseAuthModal').addEventListener('click', () => {
      document.getElementById('authLiveSessionModal').classList.add('hidden');
    });

    document.getElementById('btnLogoutFromModal').addEventListener('click', () => {
      performLogout();
    });

    document.getElementById('btnLoginPasskeyModal').addEventListener('click', () => {
      performLogin(EXT_STATE.presetAccounts[0]);
      document.getElementById('authLiveSessionModal').classList.add('hidden');
    });

    document.getElementById('btnLoginCustomCreds').addEventListener('click', () => {
      const tag = document.getElementById('inputAuthCustomTag').value.trim() || 'PlayerOne#T8';
      const email = document.getElementById('inputAuthCustomEmail').value.trim() || 'player@nexusgrid.gg';
      const role = document.getElementById('selectAuthCustomRole').value || 'PLAYER';
      const newAcc = {
        id: 'usr-custom-' + Date.now(),
        gamertag: tag,
        email,
        role,
        authMethod: 'Credentials + Redis Session',
        elo: 2000,
        mainCharacter: EXT_STATE.selectedP1Char
      };
      EXT_STATE.presetAccounts.unshift(newAcc);
      performLogin(newAcc);
      document.getElementById('authLiveSessionModal').classList.add('hidden');
    });

    const c1Sel = document.getElementById('selectReporterChar1');
    const c2Sel = document.getElementById('selectReporterChar2');
    if (c1Sel) {
      c1Sel.addEventListener('change', (e) => {
        EXT_STATE.selectedP1Char = e.target.value;
        syncHeaderAndCatalogUI();
      });
    }
    if (c2Sel) {
      c2Sel.addEventListener('change', (e) => {
        EXT_STATE.selectedP2Char = e.target.value;
        syncHeaderAndCatalogUI();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.getElementById('tekkenArcadeSelectModal')?.classList.add('hidden');
        document.getElementById('authLiveSessionModal')?.classList.add('hidden');
      }
    });
  }

  // Interceptar renderAll original para mantener sincronizados los 43 personajes y el estado de sesión
  const origRenderAll = window.renderAll;
  if (typeof origRenderAll === 'function') {
    window.renderAll = function () {
      origRenderAll();
      syncHeaderAndCatalogUI();
    };
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        injectArcadeAndAuthUI();
        if (typeof renderAll === 'function') renderAll();
      }, 50);
    });
  } else {
    setTimeout(() => {
      injectArcadeAndAuthUI();
      if (typeof renderAll === 'function') renderAll();
    }, 50);
  }
})();
