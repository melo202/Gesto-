/* =============================================================================
   GESTO! — Motor do jogo
   Vanilla JS, sem dependências.
   ============================================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constantes
  // ---------------------------------------------------------------------------
  const STORAGE_KEY = 'gesto.v1';
  const TEAM_COLORS = ['#7b3df0', '#34e89e', '#ff7a3d', '#2436c7', '#ff4d6d', '#ffd166'];
  const DEFAULT_TEAM_NAMES = ['Time Lilás', 'Time Verde', 'Time Laranja', 'Time Azul', 'Time Coral', 'Time Dourado'];
  const TIME_OPTIONS = [45, 60, 90, 120];
  const ROUND_FORMATS = [
    { id: 'bo3', label: 'Melhor de 3', total: 3 },
    { id: 'bo5', label: 'Melhor de 5', total: 5 },
    { id: 'bo7', label: 'Melhor de 7', total: 7 },
    { id: 'free', label: 'Livre', total: 0 }
  ];

  const PARTY_CHALLENGES = [
    'mímica normal', 'câmera lenta', 'sem usar as mãos', 'usando só uma mão',
    'como se fosse um robô', 'versão dramática', 'versão filme de terror',
    'versão novela mexicana', 'dançando', 'de costas', 'sem expressão facial',
    'usando só os pés', 'em dupla', 'como criança', 'como idoso',
    'muito rápido', 'muito cansado', 'como apresentador de TV',
    'como vilão', 'como super-herói', 'como atleta olímpico',
    'como se estivesse com sono', 'como se estivesse atrasado',
    'em silêncio absoluto', 'versão rica e esnobe', 'versão humilde demais',
    'versão câmera de segurança', 'versão propaganda de televisão'
  ];

  const COMP_MESSAGES = {
    winTight: [
      'No sufoco, mas valeu.',
      'Quase passaram vergonha.',
      'Vitória no grito.',
      'Foi feio, mas foi.',
      'No último suspiro.',
      'Salvaram a honra no fim.',
      'Drama até o último segundo.'
    ],
    winEasy: [
      'Passeio.',
      'Amassaram.',
      'Isso foi humilhação?',
      'Atuação de gala.',
      'Vocês são uma máquina.',
      'Sobrou tempo até pra comemorar.',
      'Direto ao ponto. Cinco em cinco.'
    ],
    loseClose: [
      'Faltou uma. Essa dói.',
      'Bateram na trave.',
      'A revanche é obrigatória.',
      'Quase viraram lenda.',
      'Tão perto que ainda dá pra sentir o cheiro.',
      'Era pra ter dado. Não deu.'
    ],
    loseBad: [
      'Hoje a atuação foi criminosa.',
      'Nem o teatro salvou.',
      'Foi mímica ou pane?',
      'A categoria venceu vocês.',
      'Performance de aquecimento.',
      'Mandem reforço pro time.'
    ]
  };

  const TEAM_NARRATIVES = {
    leadOpen:     [
      '{lead} abriu vantagem.',
      'O {lead} tomou a frente.',
      'Quem está pegando a liderança é o {lead}.'
    ],
    tied:         [
      'Tudo igual. A pressão é geral.',
      'Empate. Ninguém quer ceder.',
      'Placar travado. A próxima decide tudo.',
      'Tudo na mesma. Quem trincar primeiro perde.'
    ],
    needReact:    [
      '{last} precisa reagir.',
      'O {last} está apagado. Cadê?',
      '{last}, tá deixando barato hein.',
      'Hora do {last} acordar.'
    ],
    finalRound:   [
      'Última rodada. Agora é tudo ou nada.',
      'Final. Sem volta.',
      'É agora ou nunca.',
      'A última rodada vale o jogo inteiro.'
    ],
    turnover:     [
      'Tem cheiro de virada.',
      'O azarão acordou.',
      'O placar pode mudar de dono.'
    ],
    leadComfort:  [
      'O líder está confortável demais.',
      'O {lead} cruzou os braços.',
      'O {lead} já tá ensaiando a comemoração.'
    ],
    suddenAhead:  [
      'A final ficou perigosa.',
      'Decisão no fio do bigode.',
      'Quem errar uma palavra, perde o jogo.'
    ]
  };

  // Frases variadas para "faltam X" — alternam pra não enjoar
  const MISSING_PHRASES = {
    4: ['Faltam 4', 'Só faltam 4', 'Quatro pra fechar'],
    3: ['Faltam 3', 'Três pra fechar', 'Já dá pra sonhar'],
    2: ['Faltam 2', 'Mais duas e fecha', 'Agora não pipoca'],
    1: ['FALTA SÓ UMA', 'É AGORA', 'NÃO ERRA', 'A ÚLTIMA!']
  };
  const HEAT_PHRASES = ['CORRE!', 'RAPIDO!', 'NO FIM!', 'NÃO DÁ MOLE'];

  // ---------------------------------------------------------------------------
  // Estado global
  // ---------------------------------------------------------------------------
  const AppState = {
    screen: 'home',
    mode: 'quick',                  // 'quick' | 'teams' | 'party'
    selectedCategory: null,
    roundDuration: 60,
    targetScore: 5,
    currentWord: null,
    currentChallenge: null,
    usedWords: [],
    correctWords: [],
    skippedWords: [],
    score: 0,
    timeLeft: 60,
    timerId: null,
    timerStart: 0,
    roundStatus: 'idle',            // idle|preparing|countdown|playing|paused|won|lost|finished
    teams: [],
    currentTeamIndex: 0,
    currentRound: 1,
    totalRounds: 0,                 // 0 = livre
    roundFormat: 'free',
    suddenDeath: false,
    sessionHistory: [],             // últimas rodadas do modo times
    pendingTeamFlow: false,
    settings: {
      sound: true,
      vibration: true,
      allowSkip: true,
      partyMode: false,
      themePanela: true,            // skin "Panela Inc." (ligado por padrão)
      soundPack: 'panela',          // 'procedural' | 'panela' | 'mute'
      maxSkips: 3,                  // 0=ilimitado, 1, 3, 5
      comboBonus: 3,                // a cada N acertos seguidos sem pular = +1 pulo
      allowBet: true,               // (A) aposta no modo Times
      trackMimer: false,            // (D) registrar mímico de cada rodada (opt-in)
      surpriseCategory: false,      // (E) categoria surpresa no meio da rodada
      ambientMusic: true,           // música de fundo nas telas calmas
      ambientVolume: 0.28           // volume da música (0 a 1)
    },
    skipsLeft: 3,                   // pulos disponíveis na rodada atual
    combo: 0,                       // acertos seguidos sem pular
    skipsEarned: 0,                 // pulos ganhos por combo nessa rodada (info)
    bet: null,                      // aposta da rodada atual: null | 3 | 4 | 5
    currentMimer: null,             // nome do mímico da rodada (modo Times)
    knownMimers: [],                // nomes já registrados na sessão
    surpriseDone: false             // se categoria surpresa já disparou nessa rodada
  };

  // Carrega settings persistidas se existirem
  try {
    const savedSettings = JSON.parse(localStorage.getItem('gesto.settings.v1') || 'null');
    if (savedSettings) Object.assign(AppState.settings, savedSettings);
  } catch (e) { /* ignora */ }

  function persistSettings() {
    try { localStorage.setItem('gesto.settings.v1', JSON.stringify(AppState.settings)); }
    catch (e) { /* quota */ }
  }

  function applyTheme() {
    if (AppState.settings.themePanela) document.body.classList.add('theme-panela');
    else document.body.classList.remove('theme-panela');
  }

  let stats = loadStats();

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const root = () => $('#appShell');
  const toastEl = () => $('#toast');

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') node.innerHTML = v;
      else if (v === true) node.setAttribute(k, '');
      else if (v !== null && v !== false && v !== undefined) node.setAttribute(k, v);
    });
    children.flat().forEach((c) => {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return node;
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function fmtTime(s) { return s + 's'; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function showToast(msg, ms = 1800) {
    const t = toastEl();
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._id);
    showToast._id = setTimeout(() => t.classList.remove('show'), ms);
  }

  // ---------------------------------------------------------------------------
  // Áudio procedural (Web Audio API)
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  function ensureAudio() {
    if (!AppState.settings.sound) return null;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { audioCtx = null; }
    return audioCtx;
  }

  function beep(freq, dur, type = 'sine', gain = 0.18) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  function chord(notes, dur = 0.5, type = 'triangle', gain = 0.14) {
    const ctx = ensureAudio();
    if (!ctx) return;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + i * 0.05 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.05 + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + dur + 0.02);
    });
  }

  // Pacote de áudio "Panela": samples WAV gerados no Suno
  // Cada chave mapeia para um arquivo na raiz do projeto.
  const PANELA_PACK = {
    victory: 'Brass Flag Win.wav',
    defeat:  'Fail Accordion.wav',
    heat:    'Clockfruit Panic.wav',   // últimos 10s
    sudden:  'Neon Gavel.wav',
    round1:  'ROUND ONE FIGHT.wav',
    ambient: 'Lounge Loop.mp3'         // música de fundo nas telas calmas (MP3 é mais leve)
  };
  const _panelaAudio = {};   // cache de Audio() instances
  let _heatHandle = null;     // referência do áudio de tensão pra parar quando termina

  function panelaPlay(key, opts = {}) {
    if (AppState.settings.soundPack !== 'panela') return false;
    const file = PANELA_PACK[key];
    if (!file) return false;
    try {
      if (!_panelaAudio[key]) {
        // Path relativo com nome do arquivo codificado (espaços → %20)
        const url = './' + file.split('/').map(encodeURIComponent).join('/');
        const a = new Audio(url);
        a.preload = 'auto';
        a.addEventListener('error', () => {
          console.warn('[Gesto] Falhou carregar áudio:', file, 'URL:', url);
          showToast('Áudio falhou: ' + file, 2400);
        });
        a.addEventListener('canplaythrough', () => {
          console.log('[Gesto] Áudio pronto:', file);
        }, { once: true });
        _panelaAudio[key] = a;
      }
      const a = _panelaAudio[key];
      a.currentTime = 0;
      a.volume = opts.volume != null ? opts.volume : 0.85;
      a.loop = !!opts.loop;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(() => console.log('[Gesto] Tocando:', key))
         .catch((err) => {
           console.warn('[Gesto] Play bloqueado:', key, err && err.message);
         });
      }
      return a;
    } catch (e) {
      console.warn('[Gesto] Erro panelaPlay:', e);
      return false;
    }
  }

  function panelaStop(key) {
    const a = _panelaAudio[key];
    if (!a) return;
    try { a.pause(); a.currentTime = 0; } catch (e) {}
  }

  // ----- Música ambiente (telas calmas: home/menus/result) -----
  let _ambient = null;
  let _ambientFadeId = null;
  let _ambientWanted = false;     // estado lógico — queremos tocar?

  function ensureAmbient() {
    if (_ambient !== null) return _ambient;
    if (AppState.settings.soundPack !== 'panela') { _ambient = false; return false; }
    const file = PANELA_PACK.ambient;
    const url = './' + file.split('/').map(encodeURIComponent).join('/');
    try {
      const a = new Audio(url);
      a.loop = true;
      a.volume = 0;
      a.preload = 'auto';
      a.addEventListener('error', () => {
        // arquivo não existe ainda — desativa silenciosamente, sem mostrar toast
        console.warn('[Gesto] Música ambiente não encontrada (' + file + '). App continua normal.');
        _ambient = false;
      });
      _ambient = a;
      return a;
    } catch (e) {
      _ambient = false;
      return false;
    }
  }

  function fadeAmbient(targetVol, durationMs, onDone) {
    if (!_ambient || _ambient === false) { if (onDone) onDone(); return; }
    if (_ambientFadeId) { clearInterval(_ambientFadeId); _ambientFadeId = null; }
    const startVol = _ambient.volume;
    const delta = targetVol - startVol;
    const steps = 20;
    let i = 0;
    _ambientFadeId = setInterval(() => {
      i++;
      const t = i / steps;
      _ambient.volume = Math.max(0, Math.min(1, startVol + delta * t));
      if (i >= steps) {
        clearInterval(_ambientFadeId);
        _ambientFadeId = null;
        if (onDone) onDone();
      }
    }, durationMs / steps);
  }

  function startAmbient() {
    _ambientWanted = true;
    if (!AppState.settings.ambientMusic) return;
    if (AppState.settings.soundPack !== 'panela') return;
    const a = ensureAmbient();
    if (!a) return;
    if (a.paused) {
      a.volume = 0;
      const p = a.play();
      if (p && typeof p.then === 'function') {
        p.then(() => fadeAmbient(AppState.settings.ambientVolume, 1200))
         .catch(() => { /* autoplay bloqueado, vai destravar no próximo toque */ });
      }
    } else {
      fadeAmbient(AppState.settings.ambientVolume, 800);
    }
  }

  function stopAmbient() {
    _ambientWanted = false;
    if (!_ambient || _ambient === false || _ambient.paused) return;
    fadeAmbient(0, 600, () => {
      try { if (_ambient && _ambient.pause) _ambient.pause(); } catch (e) {}
    });
  }

  // Para a música ambiente IMEDIATAMENTE, sem fade — usado antes de SFX dramáticos
  function stopAmbientImmediate() {
    _ambientWanted = false;
    if (!_ambient || _ambient === false || _ambient.paused) return;
    if (_ambientFadeId) { clearInterval(_ambientFadeId); _ambientFadeId = null; }
    try { _ambient.volume = 0; _ambient.pause(); } catch (e) {}
  }

  // Audio ducking: abaixa o volume da ambient pra X% durante 'duration' ms, depois retoma
  function duckAmbient(duckTo, duration) {
    if (!_ambient || _ambient === false || _ambient.paused) return;
    fadeAmbient(duckTo, 200, () => {
      setTimeout(() => {
        if (_ambientWanted && _ambient && !_ambient.paused) {
          fadeAmbient(AppState.settings.ambientVolume, 600);
        }
      }, duration);
    });
  }

  // Decide se a tela atual quer música ou silêncio
  function updateAmbientMusic() {
    const silentScreens = ['countdown', 'playing'];
    if (silentScreens.includes(AppState.screen)) {
      stopAmbient();
    } else {
      startAmbient();
    }
  }

  // Toca cada um dos 5 sons em sequência, com toast mostrando qual está tocando
  function testPanelaSounds() {
    if (AppState.settings.soundPack !== 'panela') {
      showToast('Liga o pacote Panela primeiro nas configs', 2400);
      return;
    }
    const seq = [
      { key: 'round1',  label: '1/5 ROUND ONE FIGHT' },
      { key: 'victory', label: '2/5 Brass Flag (vitória)' },
      { key: 'defeat',  label: '3/5 Fail Accordion (derrota)' },
      { key: 'sudden',  label: '4/5 Neon Gavel (morte súbita)' },
      { key: 'heat',    label: '5/5 Clockfruit Panic (tensão)' }
    ];
    let i = 0;
    function next() {
      if (i >= seq.length) {
        showToast('Teste concluído. Veja o console se algum falhou.', 2200);
        return;
      }
      const item = seq[i++];
      showToast(item.label, 2000);
      const a = panelaPlay(item.key, { volume: 0.7 });
      // Espera o áudio terminar ou 2.5s, o que vier primeiro
      const dur = (a && a.duration && isFinite(a.duration)) ? Math.min(a.duration * 1000, 2500) : 2500;
      setTimeout(() => {
        panelaStop(item.key);
        next();
      }, dur);
    }
    next();
  }

  function playSound(type) {
    if (AppState.settings.soundPack === 'mute') return;

    // Se pacote Panela ativo, toca o WAV correspondente + faz ducking da ambient
    if (AppState.settings.soundPack === 'panela') {
      // SFX dramáticos: abaixa ambient temporariamente pra não chocar
      if (type === 'victory')  { duckAmbient(0.04, 3000); panelaPlay('victory'); return; }
      if (type === 'defeat')   { duckAmbient(0.04, 2400); panelaPlay('defeat');  return; }
      if (type === 'sudden')   { duckAmbient(0.04, 2000); panelaPlay('sudden');  return; }

      // ROUND ONE FIGHT precisa da cena 100% dele — para ambient seco antes de tocar
      if (type === 'round1')   {
        stopAmbientImmediate();
        panelaPlay('round1');
        return;
      }

      // Heat loop: ambient já está parada (rodada playing), então sem ducking
      if (type === 'heatStart') { _heatHandle = panelaPlay('heat', { volume: 0.55 }); return; }
      if (type === 'heatStop')  { panelaStop('heat'); _heatHandle = null; return; }

      // Procedurais que ficariam em cima de outros sons Panela — mutar quando há conflito
      if (type === 'tick' || type === 'lastone') return;  // Clockfruit já tá rolando
      if (type === 'count' && AppState.mode === 'teams') return; // ROUND ONE FIGHT cobre o countdown
      // click/correct/skip/go ainda usam procedural (curtos e leves, não conflitam)
    }

    // Pacote procedural (default)
    if (!AppState.settings.sound) return;
    switch (type) {
      case 'click':       beep(620, 0.04, 'square', 0.10); break;
      case 'correct':     chord([523.25, 659.25, 783.99], 0.28, 'triangle', 0.16); break;
      case 'skip':        beep(220, 0.14, 'sawtooth', 0.10); setTimeout(() => beep(180, 0.10, 'sawtooth', 0.08), 80); break;
      case 'tick':        beep(800, 0.05, 'square', 0.07); break;
      case 'count':       beep(660, 0.18, 'sine', 0.15); break;
      case 'go':          chord([523.25, 659.25, 783.99, 1046.50], 0.35, 'triangle', 0.18); break;
      case 'victory':     chord([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.55, 'triangle', 0.18); break;
      case 'defeat':      chord([392, 311.13, 233.08], 0.8, 'sawtooth', 0.12); break;
      case 'lastone':     chord([880, 1108.73], 0.20, 'triangle', 0.16); break;
      case 'sudden':      chord([146.83, 220, 277.18, 415.30], 0.6, 'sawtooth', 0.18); break;
      case 'round1':      chord([220, 277.18, 329.63, 440], 0.5, 'sawtooth', 0.20); break;
      case 'heatStart':   /* procedural não tem música contínua */ break;
      case 'heatStop':    break;
    }
  }

  // ---------------------------------------------------------------------------
  // Vibração
  // ---------------------------------------------------------------------------
  function vibrate(type) {
    if (!AppState.settings.vibration || !navigator.vibrate) return;
    try {
      switch (type) {
        case 'correct': navigator.vibrate(40); break;
        case 'skip':    navigator.vibrate([15, 25, 15]); break;
        case 'victory': navigator.vibrate([60, 50, 60, 50, 180]); break;
        case 'defeat':  navigator.vibrate(300); break;
        case 'lastone': navigator.vibrate([30, 40, 30]); break;
        case 'sudden':  navigator.vibrate([120, 60, 120, 60, 200]); break;
        case 'tap':     navigator.vibrate(8); break;
      }
    } catch (e) { /* silencioso */ }
  }

  // ---------------------------------------------------------------------------
  // Persistência (localStorage)
  // ---------------------------------------------------------------------------
  function loadStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultStats();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultStats(), parsed);
    } catch (e) {
      return defaultStats();
    }
  }

  function defaultStats() {
    return {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      bestTimeLeft: 0,
      totalCorrect: 0,
      totalSkips: 0,
      currentStreak: 0,
      longestStreak: 0,
      categoryCount: {},
      bestPerCategory: {},
      medals: { Bronze: 0, Prata: 0, Ouro: 0, Lendário: 0 },
      history: [],
      bestTeam: null
    };
  }

  function saveStats() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); }
    catch (e) { /* quota / privado */ }
  }

  function resetStats() {
    stats = defaultStats();
    saveStats();
  }

  // ---------------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------------
  function getAllCategories() {
    return (window.GESTO_CATEGORIES || []).slice();
  }
  function findCategory(id) {
    if (id === 'aleatorio') return window.GESTO_BUILD_RANDOM();
    return getAllCategories().find((c) => c.id === id) || null;
  }

  // ---------------------------------------------------------------------------
  // Sorteio de palavras
  // ---------------------------------------------------------------------------
  function nextWord() {
    const cat = AppState.selectedCategory;
    if (!cat) return null;
    const remaining = cat.words.filter((w) => !AppState.usedWords.includes(w));
    if (remaining.length === 0) {
      // Reseta usedWords mantendo a atual fora — situação rara, categoria pequena.
      AppState.usedWords = [];
      return pick(cat.words);
    }
    return pick(remaining);
  }

  function getRandomPartyChallenge() {
    return pick(PARTY_CHALLENGES);
  }

  // ---------------------------------------------------------------------------
  // Medalha + Frase competitiva
  // ---------------------------------------------------------------------------
  function getPerformanceMedal(timeLeft) {
    if (timeLeft >= 30) return 'Lendário';
    if (timeLeft >= 21) return 'Ouro';
    if (timeLeft >= 11) return 'Prata';
    if (timeLeft >= 1)  return 'Bronze';
    return null;
  }

  function getCompetitiveMessage(result, score, timeLeft) {
    if (result === 'won') {
      return timeLeft >= 20 ? pick(COMP_MESSAGES.winEasy) : pick(COMP_MESSAGES.winTight);
    }
    return score >= 4 ? pick(COMP_MESSAGES.loseClose) : pick(COMP_MESSAGES.loseBad);
  }

  // ---------------------------------------------------------------------------
  // Timer
  // ---------------------------------------------------------------------------
  function startTimer() {
    stopTimer();
    AppState.timerStart = Date.now();
    let lastTick = AppState.timeLeft;
    let heatStarted = false;
    // (E) Categoria surpresa: decide gatilho aleatório nessa rodada
    const surpriseEnabled =
      AppState.settings.surpriseCategory &&
      !AppState.surpriseDone &&
      !AppState.suddenDeath &&
      AppState.roundDuration >= 45 &&
      Math.random() < 0.35;
    // dispara entre 60% e 50% da duração
    const surpriseAt = surpriseEnabled
      ? Math.floor(AppState.roundDuration * (0.50 + Math.random() * 0.10))
      : -1;
    AppState.timerId = setInterval(() => {
      if (AppState.roundStatus !== 'playing') return;
      AppState.timeLeft = Math.max(0, AppState.timeLeft - 1);

      // dispara categoria surpresa se chegou na hora e ainda sobram >=15s
      if (surpriseEnabled && AppState.timeLeft === surpriseAt && AppState.timeLeft >= 15 && !AppState.surpriseDone) {
        AppState.surpriseDone = true;
        triggerSurprise();
      }
      const tEl = $('#timerText');
      const bar = $('#timerBarFill');
      if (tEl) {
        tEl.textContent = fmtTime(AppState.timeLeft);
        tEl.classList.toggle('pulse', AppState.timeLeft <= 10 && AppState.timeLeft > 0);
      }
      if (bar) {
        const pct = AppState.timeLeft / AppState.roundDuration;
        bar.style.transform = `scaleX(${pct})`;
        bar.classList.toggle('warning', AppState.timeLeft <= 15 && AppState.timeLeft > 5);
        bar.classList.toggle('danger', AppState.timeLeft <= 5);
      }
      const gs = $('#gameScreen');
      if (gs) gs.classList.toggle('heat', AppState.timeLeft <= 10 && AppState.timeLeft > 0);

      // Inicia loop de tensão Panela (Clockfruit Panic) nos últimos 10s
      if (AppState.timeLeft === 10 && !heatStarted) {
        playSound('heatStart');
        heatStarted = true;
      }

      if (AppState.timeLeft <= 5 && AppState.timeLeft > 0 && AppState.timeLeft !== lastTick) {
        playSound('tick');
      }
      lastTick = AppState.timeLeft;

      if (AppState.timeLeft <= 0) {
        playSound('heatStop');
        endRound('time');
      }
    }, 1000);
  }

  function stopTimer() {
    if (AppState.timerId) {
      clearInterval(AppState.timerId);
      AppState.timerId = null;
    }
    // garante que o loop de tensão não continue após pause/fim
    playSound('heatStop');
  }

  // ---------------------------------------------------------------------------
  // Lógica da rodada
  // ---------------------------------------------------------------------------
  function setupNewRound() {
    AppState.score = 0;
    AppState.timeLeft = AppState.roundDuration;
    AppState.usedWords = [];
    AppState.correctWords = [];
    AppState.skippedWords = [];
    AppState.currentWord = null;
    AppState.currentChallenge = null;
    AppState.suddenDeath = false;
    AppState.skipsLeft = AppState.settings.maxSkips === 0 ? 999 : AppState.settings.maxSkips;
    AppState.combo = 0;
    AppState.skipsEarned = 0;
    AppState.bet = null;
    AppState.currentMimer = null;
    AppState.surpriseDone = false;
  }

  function startRound() {
    AppState.roundStatus = 'playing';
    AppState.currentWord = nextWord();
    AppState.usedWords.push(AppState.currentWord);
    if (AppState.settings.partyMode || AppState.mode === 'party') {
      AppState.currentChallenge = getRandomPartyChallenge();
    }
    renderGame();
    startTimer();
  }

  function markCorrect() {
    if (AppState.roundStatus !== 'playing') return;
    if (_transitioning) return;
    playSound('correct');
    vibrate('correct');
    AppState.correctWords.push(AppState.currentWord);
    AppState.score += 1;
    AppState.combo += 1;
    flash('flash-win');

    // Combo bonus: a cada N acertos seguidos = +1 pulo
    const need = AppState.settings.comboBonus || 3;
    if (AppState.combo > 0 && AppState.combo % need === 0 && AppState.settings.maxSkips > 0) {
      AppState.skipsLeft += 1;
      AppState.skipsEarned += 1;
      showToast('🔥 Combo! +1 pulo', 1600);
      // mini fanfarra de combo
      if (AppState.settings.soundPack === 'procedural') {
        beep(880, 0.08, 'triangle', 0.16);
        setTimeout(() => beep(1175, 0.10, 'triangle', 0.14), 90);
      }
    }

    if (AppState.score >= AppState.targetScore) {
      endRound('reached');
      return;
    }
    if (AppState.score === AppState.targetScore - 1) {
      playSound('lastone');
      vibrate('lastone');
    }
    animateWordTransition('correct', () => {
      advanceWord();
      renderGameContent();
    });
  }

  function skipWord() {
    if (AppState.roundStatus !== 'playing') return;
    if (_transitioning) return;
    if (!AppState.settings.allowSkip) return;
    if (AppState.skipsLeft <= 0) {
      showToast('Sem pulos. Acerta combo pra ganhar mais.', 1800);
      return;
    }
    playSound('skip');
    vibrate('skip');
    AppState.skippedWords.push(AppState.currentWord);
    AppState.skipsLeft -= 1;
    AppState.combo = 0;     // quebra o combo
    flash('flash-skip');
    animateWordTransition('skip', () => {
      advanceWord();
      renderGameContent();
    });
  }

  // ----- (E) Categoria surpresa -----
  function triggerSurprise() {
    const all = getAllCategories();
    const currentId = AppState.selectedCategory && AppState.selectedCategory.id;
    const candidates = all.filter((c) => c.id !== currentId);
    if (candidates.length === 0) return;
    const next = candidates[Math.floor(Math.random() * candidates.length)];

    // Pausa logicamente, mostra overlay
    const prevStatus = AppState.roundStatus;
    AppState.roundStatus = 'paused';
    showSurpriseOverlay(next, () => {
      AppState.selectedCategory = next;
      AppState.usedWords = [];
      AppState.currentWord = nextWord();
      AppState.usedWords.push(AppState.currentWord);
      if (AppState.settings.partyMode || AppState.mode === 'party') {
        AppState.currentChallenge = getRandomPartyChallenge();
      }
      AppState.roundStatus = prevStatus;
      // atualiza category pill no header
      const pill = $('#gameCategoryPill');
      if (pill) {
        const team = AppState.mode === 'teams' ? AppState.teams[AppState.currentTeamIndex] : null;
        pill.textContent = (team ? team.name + ' • ' : '') + next.name;
      }
      renderGameContent();
    });
  }

  function showSurpriseOverlay(newCat, onDone) {
    const overlay = el('div', { class: 'surprise-overlay', id: 'surpriseOverlay' },
      el('div', { class: 'surprise-icon' }, '🌀'),
      el('div', { class: 'surprise-label' }, 'TROCOU TUDO!'),
      el('div', { class: 'surprise-name' }, newCat.emoji + ' ' + newCat.name)
    );
    document.body.appendChild(overlay);
    if (AppState.settings.soundPack === 'panela') {
      panelaPlay('sudden', { volume: 0.5 });
    } else {
      chord([523.25, 659.25, 880, 1108.73], 0.45, 'triangle', 0.16);
    }
    vibrate('sudden');
    setTimeout(() => {
      overlay.classList.add('leaving');
      setTimeout(() => {
        overlay.remove();
        onDone();
      }, 250);
    }, 1600);
  }

  // ----- Animação H -----
  let _transitioning = false;
  function animateWordTransition(kind, after) {
    if (_transitioning) {
      // pulou/acertou muito rápido — ignora pra não bagunçar a animação
      return;
    }
    const wd = $('#wordDisplay');
    if (!wd || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      after();
      return;
    }
    _transitioning = true;
    wd.classList.add(kind === 'correct' ? 'exit-up' : 'exit-side');
    setTimeout(() => {
      after();
      _transitioning = false;
    }, 180);
  }

  function advanceWord() {
    AppState.currentWord = nextWord();
    AppState.usedWords.push(AppState.currentWord);
    if (AppState.settings.partyMode || AppState.mode === 'party') {
      AppState.currentChallenge = getRandomPartyChallenge();
    } else {
      AppState.currentChallenge = null;
    }
  }

  function flash(cls) {
    const gs = $('#gameScreen');
    if (!gs) return;
    gs.classList.remove('flash-win', 'flash-skip');
    void gs.offsetWidth; // reset animation
    gs.classList.add(cls);
    setTimeout(() => gs.classList.remove(cls), 400);
  }

  function pauseRound() {
    if (AppState.roundStatus !== 'playing') return;
    AppState.roundStatus = 'paused';
    stopTimer();
    showPauseOverlay();
  }

  function resumeRound() {
    if (AppState.roundStatus !== 'paused') return;
    AppState.roundStatus = 'playing';
    hidePauseOverlay();
    startTimer();
  }

  function endRound(reason) {
    if (['won', 'lost', 'finished'].includes(AppState.roundStatus)) return;
    stopTimer();
    const result = AppState.score >= AppState.targetScore ? 'won' : 'lost';
    AppState.roundStatus = result;

    playSound(result === 'won' ? 'victory' : 'defeat');
    vibrate(result === 'won' ? 'victory' : 'defeat');

    // Atualiza stats globais
    stats.totalGames += 1;
    if (result === 'won') {
      stats.totalWins += 1;
      stats.currentStreak += 1;
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
      if (AppState.timeLeft > stats.bestTimeLeft) stats.bestTimeLeft = AppState.timeLeft;
      const medal = getPerformanceMedal(AppState.timeLeft);
      if (medal) stats.medals[medal] = (stats.medals[medal] || 0) + 1;
      // Melhor rodada por categoria
      const catId = AppState.selectedCategory.id;
      const prev = stats.bestPerCategory[catId];
      if (!prev || AppState.timeLeft > prev.timeLeft) {
        stats.bestPerCategory[catId] = {
          name: AppState.selectedCategory.name,
          timeLeft: AppState.timeLeft,
          score: AppState.score,
          when: Date.now()
        };
      }
    } else {
      stats.totalLosses += 1;
      stats.currentStreak = 0;
    }
    stats.totalCorrect += AppState.correctWords.length;
    stats.totalSkips += AppState.skippedWords.length;
    const cId = AppState.selectedCategory.id;
    stats.categoryCount[cId] = (stats.categoryCount[cId] || 0) + 1;
    stats.history.unshift({
      when: Date.now(),
      category: AppState.selectedCategory.name,
      score: AppState.score,
      result,
      timeLeft: AppState.timeLeft
    });
    if (stats.history.length > 10) stats.history.length = 10;
    saveStats();

    // Atualiza histórico de sessão de times
    if (AppState.mode === 'teams') {
      updateTeamAfterRound(result);
    }

    setTimeout(() => navigate('result'), 320);
  }

  function updateTeamAfterRound(result) {
    const team = AppState.teams[AppState.currentTeamIndex];
    team.played += 1;
    team.bets = team.bets || { won: 0, lost: 0 };

    // Lógica de pontuação com aposta
    const bet = AppState.bet || 0;
    let pointsEarned = 0;
    let betOutcome = null;     // 'won' | 'lost' | null
    if (bet > 0) {
      if (AppState.correctWords.length >= bet) {
        pointsEarned = 2;
        betOutcome = 'won';
        team.bets.won += 1;
      } else {
        pointsEarned = 0;
        betOutcome = 'lost';
        team.bets.lost += 1;
      }
    } else {
      pointsEarned = (result === 'won') ? 1 : 0;
    }
    team.points += pointsEarned;

    if (result === 'won') {
      team.wins += 1;
      team.bestTimeLeft = Math.max(team.bestTimeLeft, AppState.timeLeft);
    } else {
      team.losses += 1;
    }
    team.skips += AppState.skippedWords.length;
    team.correctTotal += AppState.correctWords.length;
    AppState.sessionHistory.push({
      teamIdx: AppState.currentTeamIndex,
      teamName: team.name,
      result,
      score: AppState.score,
      timeLeft: AppState.timeLeft,
      round: AppState.currentRound,
      bet: bet || null,
      betOutcome,
      pointsEarned,
      mimer: AppState.currentMimer || null,
      suddenDeath: AppState.suddenDeath
    });
  }

  // ---------------------------------------------------------------------------
  // Modo times — fluxo
  // ---------------------------------------------------------------------------
  function createTeams(count) {
    AppState.teams = [];
    for (let i = 0; i < count; i++) {
      AppState.teams.push({
        name: DEFAULT_TEAM_NAMES[i] || ('Time ' + (i + 1)),
        color: TEAM_COLORS[i % TEAM_COLORS.length],
        points: 0,
        wins: 0,
        losses: 0,
        played: 0,
        skips: 0,
        correctTotal: 0,
        bestTimeLeft: 0
      });
    }
    AppState.currentTeamIndex = 0;
    AppState.currentRound = 1;
    AppState.sessionHistory = [];
  }

  function isTeamGameOver() {
    if (AppState.roundFormat === 'free') return false;
    const total = ROUND_FORMATS.find((f) => f.id === AppState.roundFormat).total;
    const halfPlus1 = Math.floor(total / 2) + 1;
    const leadingPoints = Math.max(...AppState.teams.map((t) => t.points));
    if (leadingPoints >= halfPlus1) return true;
    // Se já jogaram todas as rodadas combinadas (cada time jogou `total` vezes)
    const everyoneDone = AppState.teams.every((t) => t.played >= total);
    return everyoneDone;
  }

  function advanceTeamTurn() {
    if (AppState.suddenDeath) {
      // morte súbita: avançar até o próximo time ainda empatado no topo
      const top = Math.max(...AppState.teams.map((t) => t.points));
      let nextIdx = (AppState.currentTeamIndex + 1) % AppState.teams.length;
      while (AppState.teams[nextIdx].points !== top) {
        nextIdx = (nextIdx + 1) % AppState.teams.length;
        if (nextIdx === AppState.currentTeamIndex) break;
      }
      AppState.currentTeamIndex = nextIdx;
      // depois que todos empatados jogaram, checa resultado
      if (allTiedTeamsPlayedSudden()) {
        finishOrLoopSudden();
        return;
      }
      navigate('roundSetup');
      return;
    }
    AppState.currentTeamIndex = (AppState.currentTeamIndex + 1) % AppState.teams.length;
    if (AppState.currentTeamIndex === 0) {
      AppState.currentRound += 1;
    }
    if (isTeamGameOver()) {
      finishTeamGame();
    } else {
      navigate('scoreboard');
    }
  }

  function getLeaderTeams() {
    const top = Math.max(...AppState.teams.map((t) => t.points));
    return AppState.teams
      .map((t, i) => ({ ...t, _idx: i }))
      .filter((t) => t.points === top);
  }

  function allTiedTeamsPlayedSudden() {
    const leaders = getLeaderTeams();
    // após morte súbita, conta quantas rodadas extras eles jogaram
    const sdRounds = AppState.sessionHistory.filter((h) => h.suddenDeath).length;
    return sdRounds >= leaders.length;
  }

  function finishOrLoopSudden() {
    const leaders = getLeaderTeams();
    const lastN = AppState.sessionHistory.slice(-leaders.length);
    // Maior número de acertos; em caso de empate, maior tempo restante
    let best = null;
    for (const h of lastN) {
      if (!best ||
          h.score > best.score ||
          (h.score === best.score && h.timeLeft > best.timeLeft)) {
        best = h;
      }
    }
    const stillTied = lastN.filter(
      (h) => h.score === best.score && h.timeLeft === best.timeLeft
    );
    if (stillTied.length > 1) {
      // Continua a morte súbita
      showToast('Empate continua. Mais uma rodada!', 2200);
      AppState.currentTeamIndex = stillTied[0].teamIdx;
      navigate('roundSetup');
    } else {
      AppState.teams[best.teamIdx].points += 1; // bônus do desempate
      finishTeamGame();
    }
  }

  function finishTeamGame() {
    const top = Math.max(...AppState.teams.map((t) => t.points));
    const tiedLeaders = AppState.teams.filter((t) => t.points === top);
    if (tiedLeaders.length > 1 && !AppState.suddenDeath) {
      AppState.suddenDeath = true;
      AppState.currentTeamIndex = AppState.teams.findIndex((t) => t.points === top);
      playSound('sudden');     // Neon Gavel cai aqui
      vibrate('sudden');
      navigate('scoreboard');
      return;
    }
    navigate('gameEnd');
  }

  // ---------------------------------------------------------------------------
  // Share
  // ---------------------------------------------------------------------------
  function buildShareText() {
    const cat = AppState.selectedCategory;
    const medal = getPerformanceMedal(AppState.timeLeft);
    const tag = AppState.settings.themePanela ? '\n#PanelaInc' : '';
    if (AppState.mode === 'teams') {
      const sorted = AppState.teams.slice().sort((a, b) => b.points - a.points);
      const placar = sorted.map((t) => `${t.name}: ${t.points}`).join(' | ');
      const winner = sorted[0];
      return `Gesto! 🎭\nVencedor: ${winner.name}\nPlacar: ${placar}\nQuem encara a revanche?${tag}`;
    }
    const result = AppState.roundStatus === 'won'
      ? `Resultado: ${AppState.score}/5\nTempo restante: ${AppState.timeLeft}s${medal ? `\nMedalha: ${medal}` : ''}`
      : `Resultado: ${AppState.score}/5 (faltaram ${AppState.targetScore - AppState.score})`;
    return `Joguei Gesto! 🎭\nCategoria: ${cat ? cat.name : '-'}\n${result}\nVocê conseguiria?${tag}`;
  }

  async function shareResult() {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Gesto!', text });
      } catch (e) { /* cancelado */ }
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Resultado copiado!');
        return;
      } catch (e) { /* fallback abaixo */ }
    }
    // Último fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Resultado copiado!'); }
    catch (e) { showToast('Não foi possível copiar.'); }
    document.body.removeChild(ta);
  }

  // ---------------------------------------------------------------------------
  // Navegação
  // ---------------------------------------------------------------------------
  function navigate(screen) {
    AppState.screen = screen;
    render();
  }

  function render() {
    // Música ambiente: liga/desliga conforme a tela
    updateAmbientMusic();
    switch (AppState.screen) {
      case 'home':          return renderHome();
      case 'modeSelect':    return renderModeSelect();
      case 'categorySelect':return renderCategorySelect();
      case 'roundSetup':    return renderRoundSetup();
      case 'teamSetup':     return renderTeamSetup();
      case 'preparing':     return renderPreparing();
      case 'bet':           return renderBet();
      case 'mimerPick':     return renderMimerPick();
      case 'countdown':     return renderCountdown();
      case 'playing':       return renderGame();
      case 'result':        return renderResult();
      case 'scoreboard':    return renderScoreboard();
      case 'gameEnd':       return renderGameEnd();
      case 'howTo':         return renderHowTo();
      case 'stats':         return renderStats();
      default:              return renderHome();
    }
  }

  // ---------------------------------------------------------------------------
  // Render: HOME
  // ---------------------------------------------------------------------------
  function renderHome() {
    root().innerHTML = '';
    const screen = el('div', { class: 'screen' });
    const isPanela = AppState.settings.themePanela;

    // Botão de troca de tema (canto superior esquerdo)
    screen.appendChild(el('button', {
      class: 'theme-toggle-btn',
      title: 'Trocar tema',
      'aria-label': isPanela ? 'Mudar para tema clássico' : 'Mudar para tema Panela Inc.',
      onClick: () => {
        tap();
        AppState.settings.themePanela = !AppState.settings.themePanela;
        applyTheme();
        persistSettings();
        renderHome();
      }
    }, isPanela ? '🎭' : '🍳'));

    // Selo "EDIÇÃO ZOEIRA" no canto superior direito (só no tema Panela)
    screen.appendChild(el('div', { class: 'panela-edition-badge' }, '★ Edição Zoeira'));

    const hero = el('div', { class: 'hero' },
      el('h1', { class: 'logo' }, 'Gesto', el('span', { class: 'bang' }, '!')),
      el('p', { class: 'panela-inc-tag' }, '— Panela Inc. —'),
      el('p', { class: 'subtitle' },
        isPanela ? 'A panela tá quente.' : 'Acerte 5 antes do tempo acabar.'
      ),
      el('p', { class: 'hero-blurb' },
        isPanela
          ? 'O party game oficial da panela. Faz mímica, fecha 5, humilha o time rival e segura a risada.'
          : 'Escolha uma categoria, faça mímica e tente fechar 5 acertos. Rápido, divertido e perigoso pra quem não sabe atuar.'
      ),
      el('p', { class: 'panela-hashtag' }, '#PanelaInc')
    );

    const actions = el('div', { class: 'home-actions' },
      el('button', { class: 'btn btn-primary btn-block', onClick: () => { tap(); AppState.mode = 'quick'; AppState.settings.partyMode = false; navigate('categorySelect'); } },
        isPanela ? 'LETS PLAY!' : 'Jogar agora'
      ),
      el('div', { class: 'btn-row' },
        el('button', { class: 'btn btn-secondary', onClick: () => { tap(); AppState.mode = 'teams'; AppState.settings.partyMode = false; navigate('teamSetup'); } },
          '🏆 Times'
        ),
        el('button', { class: 'btn btn-secondary party-cta', onClick: () => { tap(); AppState.mode = 'quick'; AppState.settings.partyMode = true; navigate('categorySelect'); } },
          '🎉 Festa'
        )
      ),
      el('div', { class: 'btn-row' },
        el('button', { class: 'btn btn-ghost', onClick: () => { tap(); navigate('howTo'); } }, 'Como funciona'),
        el('button', { class: 'btn btn-ghost', onClick: () => { tap(); navigate('stats'); } }, 'Estatísticas')
      ),


      // Aviso quando o jogo foi aberto via file:// (áudio bloqueado pela maioria dos browsers)
      location.protocol === 'file:' && el('div', {
        style: {
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'rgba(255, 122, 61, 0.18)',
          border: '1px solid rgba(255, 122, 61, 0.4)',
          fontSize: '12px',
          color: '#ffd99a',
          textAlign: 'center',
          lineHeight: '1.4'
        }
      },
        'Você abriu via arquivo local. Áudio pode estar bloqueado pelo navegador. Suba pro GitHub Pages ou rode um servidor local pra ouvir os WAVs.'
      )
    );

    screen.appendChild(hero);
    screen.appendChild(actions);
    root().appendChild(screen);
  }

  // ---------------------------------------------------------------------------
  // Render: MODE SELECT (atalho quando vier de outro lugar — opcional)
  // ---------------------------------------------------------------------------
  function renderModeSelect() {
    root().innerHTML = '';
    const screen = el('div', { class: 'screen' },
      topbar('Escolha o modo'),
      el('div', { class: 'mode-grid' },
        el('button', { class: 'mode-card', onClick: () => { tap(); AppState.mode = 'quick'; navigate('categorySelect'); } },
          el('div', { class: 'icon' }, '⚡'),
          el('div', { class: 'body' },
            el('h3', {}, 'Modo Rápido'),
            el('p', {}, 'Um grupo, uma rodada, 5 acertos. Direto ao ponto.')
          )
        ),
        el('button', { class: 'mode-card', onClick: () => { tap(); AppState.mode = 'teams'; navigate('teamSetup'); } },
          el('div', { class: 'icon' }, '🏆'),
          el('div', { class: 'body' },
            el('h3', {}, 'Modo Times'),
            el('p', {}, 'Times se enfrentam em rodadas. Empate vira morte súbita.')
          )
        ),
        el('button', { class: 'mode-card', onClick: () => { tap(); AppState.mode = 'party'; AppState.settings.partyMode = true; navigate('categorySelect'); } },
          el('div', { class: 'icon' }, '🎉'),
          el('div', { class: 'body' },
            el('h3', {}, 'Modo Festa'),
            el('p', {}, 'Cada palavra vem com um desafio absurdo. Caos garantido.')
          )
        )
      )
    );
    root().appendChild(screen);
  }

  // ---------------------------------------------------------------------------
  // Render: CATEGORY SELECT
  // ---------------------------------------------------------------------------
  function renderCategorySelect() {
    root().innerHTML = '';
    const cats = getAllCategories();
    const screen = el('div', { class: 'screen' },
      topbar('Escolha a categoria', () => navigate('home')),
      el('div', { class: 'category-grid' },
        el('button', { class: 'category-card featured', onClick: () => pickCat('aleatorio') },
          el('div', { class: 'emoji' }, '🎲'),
          el('h3', { class: 'cat-name' }, 'Misturar tudo'),
          el('p', { class: 'cat-desc' }, 'Sorteia de todas as categorias.'),
          el('div', { class: 'cat-meta' },
            el('span', { class: 'diff' }, 'Variado'),
            el('span', {}, totalWordCount() + ' palavras')
          )
        ),
        ...cats.map((c) =>
          el('button', { class: 'category-card', onClick: () => pickCat(c.id) },
            el('div', { class: 'emoji' }, c.emoji || '🎯'),
            el('h3', { class: 'cat-name' }, c.name),
            el('p', { class: 'cat-desc' }, c.description),
            el('div', { class: 'cat-meta' },
              el('span', { class: 'diff' }, c.difficulty),
              el('span', {}, c.words.length + ' palavras')
            )
          )
        )
      )
    );
    root().appendChild(screen);
  }

  function pickCat(id) {
    tap();
    AppState.selectedCategory = findCategory(id);
    navigate('roundSetup');
  }

  function totalWordCount() {
    return getAllCategories().reduce((sum, c) => sum + c.words.length, 0);
  }

  // ---------------------------------------------------------------------------
  // Render: ROUND SETUP
  // ---------------------------------------------------------------------------
  function renderRoundSetup() {
    root().innerHTML = '';
    const cat = AppState.selectedCategory;
    if (!cat) { navigate('categorySelect'); return; }
    const team = AppState.mode === 'teams' ? AppState.teams[AppState.currentTeamIndex] : null;

    const screen = el('div', { class: 'screen' },
      topbar('Antes de começar', () =>
        AppState.mode === 'teams' ? navigate('scoreboard') : navigate('categorySelect')
      ),

      team && el('div', { class: 'card', style: { marginBottom: '14px', textAlign: 'center' } },
        el('div', { style: { fontSize: '12px', color: 'var(--text-mute)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '6px' } }, `Rodada ${AppState.currentRound}`),
        el('div', { class: 'prepare-team-badge' }, team.name + ' joga agora')
      ),

      AppState.suddenDeath && el('div', { class: 'sudden-death-banner' }, '⚡ MORTE SÚBITA ⚡'),

      el('div', { class: 'card' },
        el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' } },
          el('span', { style: { fontSize: '28px' } }, cat.emoji || '🎯'),
          el('div', {},
            el('div', { style: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '20px' } }, cat.name),
            el('div', { style: { fontSize: '12px', color: 'var(--text-mute)' } }, cat.words.length + ' palavras • ' + cat.difficulty)
          )
        )
      ),

      el('div', { class: 'setup-section', style: { marginTop: '16px' } },
        el('label', { class: 'setup-label' }, 'Tempo'),
        el('div', { class: 'chip-row' },
          ...TIME_OPTIONS.map((s) =>
            el('button', {
              class: 'chip' + (AppState.roundDuration === s ? ' active' : ''),
              onClick: () => { tap(); AppState.roundDuration = s; AppState.timeLeft = s; renderRoundSetup(); }
            }, s + 's')
          )
        )
      ),

      el('div', { class: 'setup-section' },
        el('label', { class: 'setup-label' }, 'Pulos por rodada'),
        el('div', { class: 'chip-row' },
          ...[
            { v: 1, label: '1 pulo' },
            { v: 3, label: '3 pulos' },
            { v: 5, label: '5 pulos' },
            { v: 0, label: '∞ ilimitado' }
          ].map((s) =>
            el('button', {
              class: 'chip' + (AppState.settings.maxSkips === s.v ? ' active' : ''),
              onClick: () => {
                tap();
                AppState.settings.maxSkips = s.v;
                persistSettings();
                renderRoundSetup();
              }
            }, s.label)
          )
        ),
        AppState.settings.maxSkips > 0 && el('p', {
          style: {
            fontSize: '12px',
            color: 'var(--text-mute)',
            margin: '6px 2px 0',
            letterSpacing: '0.2px'
          }
        }, 'Combo de ' + (AppState.settings.comboBonus || 3) + ' acertos seguidos = +1 pulo extra')
      ),

      AppState.mode === 'teams' && !AppState.suddenDeath && el('div', { class: 'setup-section' },
        el('label', { class: 'setup-label' }, 'Formato'),
        el('div', { class: 'chip-row' },
          ...ROUND_FORMATS.map((f) =>
            el('button', {
              class: 'chip' + (AppState.roundFormat === f.id ? ' active' : ''),
              onClick: () => { tap(); AppState.roundFormat = f.id; AppState.totalRounds = f.total; renderRoundSetup(); }
            }, f.label)
          )
        )
      ),

      el('div', { class: 'setup-section' },
        el('label', { class: 'setup-label' }, 'Esquema'),
        toggleRow('Som', 'Beeps e fanfarra.', AppState.settings.sound,
          () => { AppState.settings.sound = !AppState.settings.sound; tap(); persistSettings(); renderRoundSetup(); }),
        toggleRow('Vibração', 'Feedback tátil no celular.', AppState.settings.vibration,
          () => { AppState.settings.vibration = !AppState.settings.vibration; tap(); persistSettings(); renderRoundSetup(); }),
        toggleRow('Pode pular', 'Trocar palavra quando travar.', AppState.settings.allowSkip,
          () => { AppState.settings.allowSkip = !AppState.settings.allowSkip; tap(); persistSettings(); renderRoundSetup(); }),
        toggleRow('Modo Festa', 'Cada palavra vem com um desafio.', AppState.settings.partyMode,
          () => { AppState.settings.partyMode = !AppState.settings.partyMode; tap(); persistSettings(); renderRoundSetup(); }),
        toggleRow('Tema Panela Inc.', 'Skin azul lago + drinks + frigideira.', AppState.settings.themePanela,
          () => {
            AppState.settings.themePanela = !AppState.settings.themePanela;
            tap();
            applyTheme();
            persistSettings();
            renderRoundSetup();
          }),
        AppState.mode === 'teams' && toggleRow('Aposta', 'Antes da rodada, time aposta. Cumpriu = 2pts. Errou = 0.', AppState.settings.allowBet,
          () => { AppState.settings.allowBet = !AppState.settings.allowBet; tap(); persistSettings(); renderRoundSetup(); }),
        AppState.mode === 'teams' && toggleRow('MVP da Panela', 'Registra quem mimicou. Calcula o MVP no fim do jogo.', AppState.settings.trackMimer,
          () => { AppState.settings.trackMimer = !AppState.settings.trackMimer; tap(); persistSettings(); renderRoundSetup(); }),
        toggleRow('Categoria surpresa', 'Pode trocar de categoria no meio da rodada (35% das vezes).', AppState.settings.surpriseCategory,
          () => { AppState.settings.surpriseCategory = !AppState.settings.surpriseCategory; tap(); persistSettings(); renderRoundSetup(); }),
        toggleRow('Música ambiente', 'Loop calmo nas telas de menu. Para automaticamente na rodada.', AppState.settings.ambientMusic,
          () => {
            AppState.settings.ambientMusic = !AppState.settings.ambientMusic;
            tap();
            persistSettings();
            if (AppState.settings.ambientMusic) startAmbient(); else stopAmbient();
            renderRoundSetup();
          })
      ),

      el('div', { class: 'setup-section' },
        el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
          el('label', { class: 'setup-label', style: { margin: 0 } }, 'Trilha sonora'),
          AppState.settings.soundPack === 'panela' && el('button', {
            class: 'chip',
            style: { fontSize: '12px', padding: '6px 10px', minHeight: '32px' },
            onClick: () => { tap(); testPanelaSounds(); }
          }, '🔊 Testar')
        ),
        el('div', { class: 'chip-row' },
          ...[
            { id: 'procedural', label: 'Procedural' },
            { id: 'panela',     label: 'Pacote Panela' },
            { id: 'mute',       label: 'Mudo' }
          ].map((p) =>
            el('button', {
              class: 'chip' + (AppState.settings.soundPack === p.id ? ' active' : ''),
              onClick: () => {
                tap();
                AppState.settings.soundPack = p.id;
                persistSettings();
                renderRoundSetup();
              }
            }, p.label)
          )
        )
      ),

      el('button', { class: 'btn btn-primary btn-block', style: { marginTop: '8px' }, onClick: () => { tap(); navigate('preparing'); } },
        'Começar'
      )
    );
    root().appendChild(screen);
  }

  function toggleRow(label, sub, on, onClick) {
    return el('div', {
      class: 'toggle-row',
      role: 'switch',
      tabindex: '0',
      'aria-checked': on ? 'true' : 'false',
      'aria-label': label + ': ' + (on ? 'ligado' : 'desligado'),
      onClick,
      onKeydown: (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          onClick();
        }
      }
    },
      el('div', { class: 'label-pair' },
        el('span', { class: 'lbl' }, label),
        el('span', { class: 'sub' }, sub)
      ),
      el('div', { class: 'switch' + (on ? ' on' : ''), 'aria-hidden': 'true' })
    );
  }

  // ---------------------------------------------------------------------------
  // Render: TEAM SETUP
  // ---------------------------------------------------------------------------
  function renderTeamSetup() {
    root().innerHTML = '';
    if (AppState.teams.length === 0) createTeams(2);

    const screen = el('div', { class: 'screen' },
      topbar('Modo Times', () => navigate('home')),
      el('p', { style: { color: 'var(--text-dim)', fontSize: '14px', textAlign: 'center', marginBottom: '14px' } },
        'Crie de 2 a 6 times. Cada um joga uma rodada por vez.'
      ),
      el('div', { class: 'team-list' },
        ...AppState.teams.map((t, i) =>
          el('div', { class: 'team-row' },
            el('div', { class: 'team-color', style: { background: t.color } }),
            el('input', {
              class: 'team-name-input',
              type: 'text',
              value: t.name,
              maxlength: 22,
              placeholder: 'Nome do time',
              'aria-label': 'Nome do time ' + (i + 1),
              onInput: (e) => { AppState.teams[i].name = e.target.value || ('Time ' + (i + 1)); }
            }),
            AppState.teams.length > 2 && el('button', {
              class: 'team-remove',
              onClick: () => { tap(); AppState.teams.splice(i, 1); renderTeamSetup(); }
            }, '×')
          )
        )
      ),
      el('div', { class: 'btn-row', style: { marginBottom: '12px' } },
        el('button', {
          class: 'btn btn-secondary',
          disabled: AppState.teams.length >= 6,
          onClick: () => {
            if (AppState.teams.length >= 6) return;
            tap();
            const i = AppState.teams.length;
            AppState.teams.push({
              name: DEFAULT_TEAM_NAMES[i] || ('Time ' + (i + 1)),
              color: TEAM_COLORS[i % TEAM_COLORS.length],
              points: 0, wins: 0, losses: 0, played: 0, skips: 0, correctTotal: 0, bestTimeLeft: 0
            });
            renderTeamSetup();
          }
        }, '+ Time'),
        el('button', {
          class: 'btn btn-ghost',
          onClick: () => {
            tap();
            createTeams(2);
            renderTeamSetup();
          }
        }, 'Resetar')
      ),
      el('button', { class: 'btn btn-primary btn-block', onClick: () => { tap(); navigate('categorySelect'); } },
        'Próximo: categoria'
      )
    );
    root().appendChild(screen);
  }

  // ---------------------------------------------------------------------------
  // Render: PREPARING
  // ---------------------------------------------------------------------------
  function renderPreparing() {
    root().innerHTML = '';
    setupNewRound();
    if (AppState.suddenDeath) AppState.timeLeft = 30;

    const team = AppState.mode === 'teams' ? AppState.teams[AppState.currentTeamIndex] : null;
    const screen = el('div', { class: 'screen' },
      topbar('', () => navigate('roundSetup'), true),
      el('div', { class: 'prepare-wrap' },
        team && el('div', { class: 'prepare-team-badge' }, team.name),
        el('h2', { class: 'prepare-title' }, 'Bora?'),
        el('p', { class: 'prepare-instructions' },
          'O objetivo é acertar ' + AppState.targetScore + ' palavras. ',
          el('br'),
          'Uma pessoa faz mímica. O grupo adivinha.'
        ),
        AppState.suddenDeath && el('div', { class: 'sudden-death-banner' }, '⚡ MORTE SÚBITA ⚡'),
        el('button', { class: 'btn btn-primary', style: { minWidth: '220px', marginTop: '12px' }, onClick: () => { tap(); navigate(nextStepAfterPreparing()); } },
          'Começar'
        )
      )
    );
    root().appendChild(screen);
  }

  // Decide o próximo passo após "Preparem-se":
  //  - modo Times + aposta ativada + não morte súbita  → bet
  //  - modo Times + mímico ativado                     → mimerPick (vem depois de bet, se aposta)
  //  - resto                                            → countdown
  function nextStepAfterPreparing() {
    if (AppState.mode === 'teams' && AppState.settings.allowBet && !AppState.suddenDeath) {
      return 'bet';
    }
    if (AppState.mode === 'teams' && AppState.settings.trackMimer) {
      return 'mimerPick';
    }
    return 'countdown';
  }

  function nextStepAfterBet() {
    if (AppState.mode === 'teams' && AppState.settings.trackMimer) {
      return 'mimerPick';
    }
    return 'countdown';
  }

  // ---------------------------------------------------------------------------
  // Render: MIMER PICK (D — mímico da rodada)
  // ---------------------------------------------------------------------------
  function renderMimerPick() {
    root().innerHTML = '';
    const team = AppState.teams[AppState.currentTeamIndex];
    let inputValue = '';

    function commit(name) {
      const clean = (name || '').trim();
      if (clean) {
        AppState.currentMimer = clean;
        if (!AppState.knownMimers.includes(clean)) AppState.knownMimers.push(clean);
      } else {
        AppState.currentMimer = null;
      }
      tap();
      navigate('countdown');
    }

    const screen = el('div', { class: 'screen' },
      topbar('Quem vai mimicar?', () =>
        AppState.settings.allowBet && !AppState.suddenDeath
          ? navigate('bet')
          : navigate('preparing')
      ),

      team && el('div', { class: 'prepare-team-badge', style: { alignSelf: 'center', marginBottom: '14px' } }, team.name),

      AppState.knownMimers.length > 0 && el('div', { class: 'setup-section' },
        el('label', { class: 'setup-label' }, 'Já mimicaram'),
        el('div', { class: 'chip-row' },
          ...AppState.knownMimers.map((name) =>
            el('button', {
              class: 'chip',
              onClick: () => commit(name)
            }, name)
          )
        )
      ),

      el('div', { class: 'setup-section' },
        el('label', { class: 'setup-label' }, 'Novo nome'),
        el('input', {
          class: 'mimer-input',
          type: 'text',
          placeholder: 'Digita o nome…',
          maxlength: 20,
          'aria-label': 'Nome do mímico da rodada',
          onInput: (e) => { inputValue = e.target.value; }
        })
      ),

      el('div', { class: 'result-actions', style: { marginTop: '20px' } },
        el('button', {
          class: 'btn btn-primary',
          onClick: () => commit(inputValue)
        }, 'Confirmar'),
        el('button', {
          class: 'btn btn-ghost',
          onClick: () => commit('')
        }, 'Pular essa parte')
      )
    );
    root().appendChild(screen);
  }

  // ---------------------------------------------------------------------------
  // Render: BET (A — aposta no modo Times)
  // ---------------------------------------------------------------------------
  function renderBet() {
    root().innerHTML = '';
    const team = AppState.teams[AppState.currentTeamIndex];

    function pickBet(v) {
      tap();
      AppState.bet = v;
      navigate(nextStepAfterBet());
    }

    const screen = el('div', { class: 'screen' },
      topbar('Aposta', () => navigate('preparing')),

      team && el('div', { class: 'prepare-team-badge', style: { alignSelf: 'center', marginBottom: '4px' } }, team.name),
      el('h2', { class: 'prepare-title', style: { textAlign: 'center', fontSize: '32px', margin: '8px 0 4px' } }, 'Quantas vocês apostam?'),
      el('p', {
        style: { textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px', maxWidth: '320px', margin: '0 auto 20px' }
      }, 'Bateu a aposta: ', el('strong', { style: { color: 'var(--gold)' } }, '2 pontos'), '. Errou: ', el('strong', { style: { color: 'var(--coral)' } }, 'zero'), '.'),

      el('div', { class: 'bet-grid' },
        el('button', {
          class: 'bet-card bet-safe',
          onClick: () => pickBet(null)
        },
          el('div', { class: 'bet-num' }, '—'),
          el('div', { class: 'bet-title' }, 'Sem risco'),
          el('div', { class: 'bet-sub' }, 'Vence a rodada = 1 pt')
        ),
        ...[3, 4, 5].map((n) =>
          el('button', { class: 'bet-card bet-risk-' + n, onClick: () => pickBet(n) },
            el('div', { class: 'bet-num' }, n),
            el('div', { class: 'bet-title' }, 'Aposto ' + n),
            el('div', { class: 'bet-sub' },
              n === 5 ? 'All-in: vencer = 2 pts' : 'Acertar ' + n + '+ = 2 pts')
          )
        )
      ),

      el('p', {
        style: { textAlign: 'center', color: 'var(--text-mute)', fontSize: '12px', marginTop: '16px' }
      }, 'Apostou, apostou. Sem volta.')
    );
    root().appendChild(screen);
  }

  // ---------------------------------------------------------------------------
  // Render: COUNTDOWN 3-2-1
  // ---------------------------------------------------------------------------
  function renderCountdown() {
    root().innerHTML = '';
    AppState.roundStatus = 'countdown';
    // Para a música ambiente seca antes de qualquer SFX dramático
    if (AppState.settings.soundPack === 'panela') stopAmbientImmediate();

    const screen = el('div', { class: 'screen' });
    const wrap = el('div', { class: 'prepare-wrap' });
    const num = el('div', { class: 'countdown-number' }, '3');
    wrap.appendChild(num);
    screen.appendChild(wrap);
    root().appendChild(screen);

    // ROUND ONE FIGHT estilo Mortal Kombat — toca quando pacote Panela ativo + modo Times
    if (AppState.mode === 'teams' && AppState.settings.soundPack === 'panela') {
      playSound('round1');
    }
    playSound('count');

    let n = 3;
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(t);
        playSound('go');
        startRound();
        return;
      }
      num.textContent = n;
      num.style.animation = 'none';
      void num.offsetWidth;
      num.style.animation = 'pop 800ms cubic-bezier(.2,.8,.2,1)';
      playSound('count');
    }, 800);
  }

  // ---------------------------------------------------------------------------
  // Render: GAME
  // ---------------------------------------------------------------------------
  function renderGame() {
    root().innerHTML = '';
    const cat = AppState.selectedCategory;
    const team = AppState.mode === 'teams' ? AppState.teams[AppState.currentTeamIndex] : null;

    const screen = el('div', { class: 'game-screen', id: 'gameScreen' },
      el('div', { class: 'game-header' },
        el('button', {
          class: 'pause-btn pause-btn-labeled',
          'aria-label': 'Pausar',
          onClick: () => { tap(); pauseRound(); }
        }, '⏸ Pausar'),
        el('div', { class: 'game-category-pill', id: 'gameCategoryPill' },
          (team ? team.name + ' • ' : '') + (cat ? cat.name : '')
        ),
        AppState.bet
          ? el('div', {
              class: 'bet-pill',
              role: 'status',
              'aria-label': 'Apostou ' + AppState.bet + ' acertos'
            },
              el('span', { 'aria-hidden': 'true' }, '🎲 '), AppState.bet
            )
          : el('div', { style: { width: '0' } })
      ),
      el('div', { class: 'timer-bar-wrap' },
        el('div', { class: 'timer-bar-fill', id: 'timerBarFill', style: { transform: 'scaleX(1)' } })
      ),
      el('div', { id: 'timerText', class: 'timer-text' }, fmtTime(AppState.timeLeft)),

      el('div', { class: 'word-stage', id: 'wordStage' },
        renderProgressPill(),
        renderContextHint(),
        el('h2', { class: 'word-display', id: 'wordDisplay' }, AppState.currentWord || '—'),
        (AppState.settings.partyMode || AppState.mode === 'party') && AppState.currentChallenge
          ? el('div', { class: 'challenge-card' },
              el('span', { class: 'label' }, 'Desafio Festa'),
              AppState.currentChallenge
            )
          : null
      ),

      buildActionRow()
    );
    root().appendChild(screen);
  }

  // Botões PULAR/ACERTOU como uma fábrica isolada
  function buildActionRow() {
    return el('div', { class: 'action-row', id: 'actionRow' },
      el('button', {
        class: 'btn btn-warn',
        disabled: !AppState.settings.allowSkip || AppState.skipsLeft <= 0,
        onClick: () => { skipWord(); }
      }, AppState.skipsLeft <= 0 ? 'SEM PULOS' : 'PULAR'),
      el('button', {
        class: 'btn btn-success',
        onClick: () => { markCorrect(); }
      }, 'ACERTOU')
    );
  }

  // Re-renderiza apenas o palco da palavra e a faixa de ações (preserva timer)
  function renderGameContent() {
    const stage = $('#wordStage');
    if (stage) {
      stage.innerHTML = '';
      stage.appendChild(renderProgressPill());
      stage.appendChild(renderContextHint());
      stage.appendChild(el('h2', { class: 'word-display', id: 'wordDisplay' }, AppState.currentWord || '—'));
      if ((AppState.settings.partyMode || AppState.mode === 'party') && AppState.currentChallenge) {
        stage.appendChild(el('div', { class: 'challenge-card' },
          el('span', { class: 'label' }, 'Desafio Festa'),
          AppState.currentChallenge
        ));
      }
    }
    const oldActions = $('#actionRow');
    if (oldActions && oldActions.parentNode) {
      oldActions.parentNode.replaceChild(buildActionRow(), oldActions);
    }
  }

  function renderProgressPill() {
    const almost = AppState.score === AppState.targetScore - 1;
    return el('div', { class: 'progress-pill-row' },
      el('div', { class: 'progress-pill' + (almost ? ' almost' : '') },
        el('span', { class: 'frac' }, AppState.score + '/' + AppState.targetScore)
      ),
      renderSkipsIndicator(),
      AppState.combo >= 2 ? renderComboPill() : null
    );
  }

  function renderSkipsIndicator() {
    const max = AppState.settings.maxSkips;
    if (max === 0) {
      return el('div', { class: 'skips-indicator unlimited', role: 'status', 'aria-label': 'Pulos ilimitados' },
        el('span', {}, '∞ pulos')
      );
    }
    const left = AppState.skipsLeft;
    const display = Math.min(Math.max(left, max), 6);
    const dots = [];
    for (let i = 0; i < display; i++) {
      dots.push(el('span', { class: 'skip-dot' + (i < left ? ' on' : ''), 'aria-hidden': 'true' }, '🍳'));
    }
    return el('div', {
      class: 'skips-indicator' + (left === 0 ? ' empty' : ''),
      role: 'status',
      'aria-label': left + ' pulo' + (left === 1 ? '' : 's') + ' restante' + (left === 1 ? '' : 's')
    },
      el('span', { class: 'skips-label' }, left + ' pulo' + (left === 1 ? '' : 's')),
      el('div', { class: 'skips-dots' }, ...dots)
    );
  }

  function renderComboPill() {
    const need = AppState.settings.comboBonus || 3;
    const remainder = AppState.combo % need;
    const isReady = remainder === 0;
    return el('div', { class: 'combo-pill' + (isReady ? ' ready' : '') },
      el('span', { class: 'combo-flame' }, '🔥'),
      el('span', {}, 'Combo ' + AppState.combo)
    );
  }

  function renderContextHint() {
    const missing = AppState.targetScore - AppState.score;
    let text = '';
    let boom = false;
    if (missing === 1) { text = pick(MISSING_PHRASES[1]); boom = true; }
    else if (missing === 2) text = pick(MISSING_PHRASES[2]);
    else if (missing === 3) text = pick(MISSING_PHRASES[3]);
    else if (missing === 4) text = pick(MISSING_PHRASES[4]);
    else text = '';
    if (AppState.timeLeft <= 5 && AppState.timeLeft > 0) { text = pick(HEAT_PHRASES); boom = true; }
    return el('div', { class: 'context-hint' + (boom ? ' boom' : '') }, text);
  }

  function showPauseOverlay() {
    const gs = $('#gameScreen');
    if (!gs) return;
    if ($('#pauseOverlay')) return;
    const overlay = el('div', { class: 'pause-overlay', id: 'pauseOverlay' },
      el('h2', {}, 'Pausado'),
      el('p', {
        style: { color: 'var(--text-dim)', textAlign: 'center', margin: '0 0 4px', fontSize: '14px' }
      }, 'A palavra está escondida. Ninguém olha.'),
      el('button', {
        class: 'btn btn-primary', style: { minWidth: '260px', marginTop: '14px' },
        onClick: () => { tap(); resumeRound(); }
      }, '▶ Continuar'),
      el('button', {
        class: 'btn btn-secondary', style: { minWidth: '260px' },
        onClick: () => {
          if (confirm('Encerrar essa rodada agora?')) {
            tap(); endRound('manual');
          }
        }
      }, 'Encerrar rodada'),
      el('button', {
        class: 'btn btn-danger', style: { minWidth: '260px' },
        onClick: () => {
          if (confirm(AppState.mode === 'teams'
            ? 'Sair do jogo de times e voltar ao menu? Você perde o placar atual.'
            : 'Voltar ao menu principal?')) {
            tap();
            stopTimer();
            AppState.roundStatus = 'idle';
            // Se estava em modo times, encerra a sessão
            if (AppState.mode === 'teams') {
              AppState.teams = [];
              AppState.mode = 'quick';
            }
            navigate('home');
          }
        }
      }, '← Voltar ao menu')
    );
    gs.appendChild(overlay);
    const wd = $('#wordDisplay');
    if (wd) wd.style.visibility = 'hidden';
  }

  function hidePauseOverlay() {
    const o = $('#pauseOverlay');
    if (o) o.remove();
    const wd = $('#wordDisplay');
    if (wd) wd.style.visibility = '';
  }

  // ---------------------------------------------------------------------------
  // Render: RESULT
  // ---------------------------------------------------------------------------
  function renderResult() {
    root().innerHTML = '';
    const won = AppState.roundStatus === 'won';
    const cat = AppState.selectedCategory;
    const medal = won ? getPerformanceMedal(AppState.timeLeft) : null;
    const compMsg = getCompetitiveMessage(AppState.roundStatus, AppState.score, AppState.timeLeft);

    // 🎉 confete em vitórias gloriosas (Lendário OU faltou pouco no modo Times)
    if (won && (medal === 'Lendário' || medal === 'Ouro')) {
      setTimeout(() => triggerConfetti(medal === 'Lendário' ? 90 : 50), 200);
    }

    const screen = el('div', { class: 'screen' },
      topbar('', () => navigate('home'), true),

      el('div', { class: 'result-hero' },
        el('h1', { class: 'result-title ' + (won ? 'win' : 'lose') },
          won
            ? (AppState.timeLeft <= 3 ? 'No último suspiro!' : (AppState.timeLeft >= 30 ? 'LENDÁRIO!' : 'Fechamos!'))
            : (AppState.score >= 4 ? 'Faltou só uma!' : 'Vish…')
        ),
        el('p', { class: 'result-sub' },
          won
            ? `Fecharam ${AppState.targetScore}/${AppState.targetScore} com ${AppState.timeLeft}s sobrando.`
            : `Acertaram ${AppState.score}/${AppState.targetScore}. ${AppState.score >= 4 ? 'Essa dói.' : 'Faltaram ' + (AppState.targetScore - AppState.score) + '.'}`
        ),
        medal && el('div', { class: 'medal medal-' + medal.toLowerCase().replace('á', 'a').replace('ê', 'e').replace('é', 'e') },
          el('span', { class: 'star' }, '★'), medal
        )
      ),

      AppState.bet ? el('div', {
        class: 'bet-result-banner ' + (AppState.correctWords.length >= AppState.bet ? 'win' : 'lose')
      },
        AppState.correctWords.length >= AppState.bet
          ? '🎲 Aposta cumprida: ' + AppState.bet + '+. +2 pontos!'
          : '🎲 Aposta perdida: faltou ' + (AppState.bet - AppState.correctWords.length) + '. Zero ponto.'
      ) : null,

      el('div', { class: 'competitive-message' }, '"' + compMsg + '"'),

      el('div', { class: 'summary-grid' },
        el('div', { class: 'summary-tile' },
          el('div', { class: 'num' }, AppState.score),
          el('div', { class: 'lbl' }, 'Acertos')
        ),
        el('div', { class: 'summary-tile' },
          el('div', { class: 'num' }, AppState.skippedWords.length),
          el('div', { class: 'lbl' }, 'Pulos')
        ),
        el('div', { class: 'summary-tile' },
          el('div', { class: 'num' }, AppState.timeLeft + 's'),
          el('div', { class: 'lbl' }, 'Tempo restante')
        ),
        AppState.skipsEarned > 0
          ? el('div', { class: 'summary-tile' },
              el('div', { class: 'num' }, '+' + AppState.skipsEarned + ' 🔥'),
              el('div', { class: 'lbl' }, 'Pulos de combo')
            )
          : el('div', { class: 'summary-tile' },
              el('div', { class: 'num', style: { fontSize: '20px' } }, cat ? cat.name : '-'),
              el('div', { class: 'lbl' }, 'Categoria')
            )
      ),

      AppState.correctWords.length > 0 && el('div', {},
        el('div', { class: 'words-list-title' }, 'Acertaram:'),
        el('ul', { class: 'words-list win' },
          ...AppState.correctWords.map((w) => el('li', {}, w))
        )
      ),

      AppState.skippedWords.length > 0 && el('div', {},
        el('div', { class: 'words-list-title' }, 'Pularam:'),
        el('ul', { class: 'words-list skip' },
          ...AppState.skippedWords.map((w) => el('li', {}, w))
        )
      ),

      renderResultActions()
    );
    root().appendChild(screen);
  }

  function renderResultActions() {
    if (AppState.mode === 'teams') {
      return el('div', { class: 'result-actions' },
        el('button', { class: 'btn btn-primary', onClick: () => { tap(); advanceTeamTurn(); } },
          isTeamGameOver() ? 'Ver placar final' : 'Próximo turno'
        ),
        el('button', { class: 'btn btn-secondary', onClick: () => { tap(); shareResult(); } }, 'Compartilhar'),
        el('button', { class: 'btn btn-ghost', onClick: () => { tap(); confirmEndGame(); } }, 'Encerrar jogo')
      );
    }
    return el('div', { class: 'result-actions' },
      el('button', { class: 'btn btn-primary', onClick: () => { tap(); navigate('preparing'); } }, 'Revanche'),
      el('div', { class: 'btn-row' },
        el('button', { class: 'btn btn-secondary', onClick: () => { tap(); AppState.selectedCategory = window.GESTO_BUILD_RANDOM(); navigate('preparing'); } }, 'Aleatória'),
        el('button', { class: 'btn btn-secondary', onClick: () => { tap(); navigate('categorySelect'); } }, 'Trocar')
      ),
      el('div', { class: 'btn-row' },
        el('button', { class: 'btn btn-ghost', onClick: () => { tap(); shareResult(); } }, 'Compartilhar'),
        el('button', { class: 'btn btn-ghost', onClick: () => { tap(); navigate('home'); } }, 'Menu')
      )
    );
  }

  function confirmEndGame() {
    if (confirm('Encerrar o jogo de times agora?')) {
      finishTeamGame();
    }
  }

  // ---------------------------------------------------------------------------
  // Render: SCOREBOARD (entre rodadas modo times)
  // ---------------------------------------------------------------------------
  function renderScoreboard() {
    root().innerHTML = '';
    const sorted = AppState.teams
      .map((t, i) => ({ ...t, _idx: i }))
      .sort((a, b) => b.points - a.points);
    const leader = sorted[0];
    const fmt = ROUND_FORMATS.find((f) => f.id === AppState.roundFormat);

    const screen = el('div', { class: 'screen' },
      topbar(AppState.suddenDeath ? 'Morte súbita' : 'Placar', () => navigate('home')),

      AppState.suddenDeath && el('div', { class: 'sudden-death-banner' }, '⚡ MORTE SÚBITA ⚡'),

      el('div', { class: 'scoreboard' },
        ...sorted.map((t) =>
          el('div', {
            class: 'team-score-card'
              + (t.points === leader.points ? ' leader' : '')
              + (t._idx === AppState.currentTeamIndex ? ' current' : '')
          },
            el('div', { class: 'badge', style: { background: t.color } }, t.name.slice(0, 2).toUpperCase()),
            el('div', { class: 'info' },
              el('div', { class: 'name' }, t.name),
              el('div', { class: 'stat' },
                `${t.wins}V/${t.losses}D • ${t.played} rod • ${t.bestTimeLeft}s melhor`
              )
            ),
            el('div', { class: 'score-num' }, t.points)
          )
        )
      ),

      el('div', { class: 'narrative-banner' }, buildNarrative()),

      el('div', { style: { fontSize: '12px', color: 'var(--text-mute)', textAlign: 'center', margin: '6px 0' } },
        `Rodada ${AppState.currentRound}${fmt.total ? ' • ' + fmt.label : ' • Livre'}`
      ),

      el('div', { class: 'result-actions' },
        el('button', { class: 'btn btn-primary', onClick: () => { tap(); navigate('preparing'); } },
          `Próxima rodada — ${AppState.teams[AppState.currentTeamIndex].name}`
        ),
        el('div', { class: 'btn-row' },
          el('button', { class: 'btn btn-secondary', onClick: () => { tap(); navigate('categorySelect'); } }, 'Trocar categoria'),
          el('button', { class: 'btn btn-ghost', onClick: () => { tap(); finishTeamGame(); } }, 'Encerrar jogo')
        ),
        el('button', {
          class: 'btn btn-ghost',
          style: { fontSize: '13px', minHeight: '44px', marginTop: '4px' },
          onClick: () => {
            if (confirm('Voltar ao menu principal? Você perde o placar atual.')) {
              tap();
              AppState.teams = [];
              AppState.mode = 'quick';
              navigate('home');
            }
          }
        }, '← Voltar ao menu principal')
      )
    );
    root().appendChild(screen);
  }

  function buildNarrative() {
    const teams = AppState.teams;
    const sorted = teams.slice().sort((a, b) => b.points - a.points);
    const top = sorted[0].points;
    const allTied = sorted.every((t) => t.points === top);
    const lead = sorted[0];
    const last = sorted[sorted.length - 1];
    const fmt = ROUND_FORMATS.find((f) => f.id === AppState.roundFormat);
    if (AppState.suddenDeath) return 'Empate no topo. Decisão única, sem volta.';
    if (allTied && top > 0) return pick(TEAM_NARRATIVES.tied);
    if (fmt && fmt.total > 0) {
      const remaining = fmt.total - AppState.currentRound + 1;
      if (remaining === 1) return pick(TEAM_NARRATIVES.finalRound);
      if (top - last.points >= 2) return pick(TEAM_NARRATIVES.leadComfort).replace('{lead}', lead.name);
    }
    if (lead.points > 0 && top - last.points === 1) {
      return pick(TEAM_NARRATIVES.leadOpen).replace('{lead}', lead.name);
    }
    if (lead.points - last.points >= 2) {
      return pick(TEAM_NARRATIVES.needReact).replace('{last}', last.name);
    }
    return 'Tudo aberto. Próxima rodada decide.';
  }

  // ---------------------------------------------------------------------------
  // Render: GAME END
  // ---------------------------------------------------------------------------
  function renderGameEnd() {
    root().innerHTML = '';
    const sorted = AppState.teams.slice().sort((a, b) => b.points - a.points);
    const winner = sorted[0];

    // 🎉 confete grandioso pra vencedor do torneio
    setTimeout(() => triggerConfetti(120), 200);

    // melhor rodada da noite
    const bestRound = AppState.sessionHistory
      .filter((h) => h.result === 'won')
      .sort((a, b) => b.timeLeft - a.timeLeft)[0];
    const mostSkips = AppState.teams.slice().sort((a, b) => b.skips - a.skips)[0];
    const bestAvg = AppState.teams.slice()
      .filter((t) => t.played > 0)
      .sort((a, b) => (b.wins / b.played) - (a.wins / a.played))[0];

    // (D) MVP da panela: agrega histórico por nome de mímico
    const mimerAgg = {};
    AppState.sessionHistory.forEach((h) => {
      if (!h.mimer) return;
      const m = mimerAgg[h.mimer] = mimerAgg[h.mimer] || {
        name: h.mimer, rounds: 0, wins: 0, losses: 0, score: 0
      };
      m.rounds += 1;
      m.score += h.score || 0;
      if (h.result === 'won') m.wins += 1;
      else m.losses += 1;
    });
    const mimers = Object.values(mimerAgg);
    const mvpMimer = mimers.length
      ? mimers.slice().sort((a, b) => b.score - a.score || b.wins - a.wins)[0]
      : null;
    const vexameMimer = mimers.length > 1
      ? mimers.slice().sort((a, b) => b.losses - a.losses || a.score - b.score)[0]
      : null;

    // Atualiza melhor time global
    if (!stats.bestTeam || winner.wins > (stats.bestTeam.wins || 0)) {
      stats.bestTeam = { name: winner.name, wins: winner.wins, when: Date.now() };
      saveStats();
    }

    const screen = el('div', { class: 'screen' },
      topbar('Fim de jogo', () => navigate('home')),

      el('div', { class: 'result-hero' },
        el('h1', { class: 'result-title win' }, '🏆 ' + winner.name),
        el('p', { class: 'result-sub' }, 'Vencedor com ' + winner.points + ' rodada' + (winner.points !== 1 ? 's' : ''))
      ),

      el('div', { class: 'scoreboard' },
        ...sorted.map((t, i) =>
          el('div', { class: 'team-score-card' + (i === 0 ? ' leader' : '') },
            el('div', { class: 'badge', style: { background: t.color } }, t.name.slice(0, 2).toUpperCase()),
            el('div', { class: 'info' },
              el('div', { class: 'name' }, t.name),
              el('div', { class: 'stat' }, t.wins + 'V • ' + t.losses + 'D • ' + t.skips + ' pulos')
            ),
            el('div', { class: 'score-num' }, t.points)
          )
        )
      ),

      el('div', { class: 'card', style: { marginTop: '14px' } },
        bestRound && row('🥇 Melhor rodada', `${bestRound.teamName} — ${bestRound.score}/5 com ${bestRound.timeLeft}s sobrando`),
        bestAvg   && row('📈 Mais consistente', `${bestAvg.name} (${Math.round((bestAvg.wins / bestAvg.played) * 100)}% aproveitamento)`),
        mostSkips && mostSkips.skips > 0 && row('⏭ Mais pulou', `${mostSkips.name} (${mostSkips.skips} pulos)`)
      ),

      // (D) Cards MVP/Vexame da Panela
      mvpMimer && el('div', { style: { marginTop: '14px' } },
        el('div', { class: 'mvp-card' },
          el('div', { class: 'mvp-icon' }, '🏆'),
          el('div', { class: 'mvp-body' },
            el('div', { class: 'mvp-title' }, 'MVP da Panela'),
            el('div', { class: 'mvp-name' }, mvpMimer.name),
            el('div', { class: 'mvp-stat' }, mvpMimer.score + ' acertos em ' + mvpMimer.rounds + ' rodada' + (mvpMimer.rounds !== 1 ? 's' : '') + ' • ' + mvpMimer.wins + 'V')
          )
        ),
        vexameMimer && vexameMimer.name !== mvpMimer.name && vexameMimer.losses > 0 && el('div', { class: 'mvp-card' },
          el('div', { class: 'mvp-icon' }, '😬'),
          el('div', { class: 'mvp-body' },
            el('div', { class: 'mvp-title' }, 'Vexame da Noite'),
            el('div', { class: 'mvp-name' }, vexameMimer.name),
            el('div', { class: 'mvp-stat' }, vexameMimer.losses + ' derrota' + (vexameMimer.losses !== 1 ? 's' : '') + ' como mímico')
          )
        )
      ),

      el('div', { class: 'result-actions' },
        el('button', { class: 'btn btn-primary', onClick: () => { tap(); resetTeamSession(); navigate('roundSetup'); } }, 'Nova partida'),
        el('button', { class: 'btn btn-secondary', onClick: () => { tap(); shareResult(); } }, 'Compartilhar'),
        el('button', { class: 'btn btn-ghost', onClick: () => { tap(); AppState.teams = []; AppState.mode = 'quick'; navigate('home'); } }, 'Voltar ao menu')
      )
    );
    root().appendChild(screen);
  }

  function row(label, value) {
    return el('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' } },
      el('span', { style: { color: 'var(--text-dim)', fontSize: '14px' } }, label),
      el('span', { style: { color: 'var(--text)', fontWeight: '600', fontSize: '14px', textAlign: 'right', flex: '1', marginLeft: '10px' } }, value)
    );
  }

  function resetTeamSession() {
    AppState.teams.forEach((t) => {
      t.points = 0; t.wins = 0; t.losses = 0; t.played = 0;
      t.skips = 0; t.correctTotal = 0; t.bestTimeLeft = 0;
    });
    AppState.currentTeamIndex = 0;
    AppState.currentRound = 1;
    AppState.sessionHistory = [];
    AppState.suddenDeath = false;
  }

  // ---------------------------------------------------------------------------
  // Render: HOW TO
  // ---------------------------------------------------------------------------
  function renderHowTo() {
    root().innerHTML = '';
    const screen = el('div', { class: 'screen' },
      topbar('Como funciona', () => navigate('home')),
      el('div', { class: 'screen-scroll' },
        step(1, 'Escolha uma categoria.', '17 categorias, de Animais a Atualidades & Internet.'),
        step(2, 'Defina o tempo.', '45, 60, 90 ou 120 segundos.'),
        step(3, 'Uma pessoa faz mímica.', 'Sem falar e sem soletrar. O grupo adivinha.'),
        step(4, 'ACERTOU vs PULAR.', 'Botão verde soma 1 acerto. Amarelo troca a palavra.'),
        step(5, 'Meta: 5 acertos.', 'Antes do tempo acabar. Quem conseguir, vence a rodada.'),
        step(6, '🏆 Modo Times.', 'Crie 2 a 6 times. Melhor de 3, 5 ou 7. Empate vai pra morte súbita.'),
        step(7, '🎉 Modo Festa.', 'Cada palavra vem com um desafio: câmera lenta, sem mãos, dramático, etc. Tem botão direto na tela inicial.'),
        step(8, 'Medalhas.', 'Bronze (1–10s), Prata (11–20s), Ouro (21–29s), Lendário (30s+).'),
        el('p', { style: { color: 'var(--text-mute)', fontSize: '13px', textAlign: 'center', marginTop: '12px' } },
          'Tudo é salvo só no seu celular. Nada vai pra internet.'
        )
      )
    );
    root().appendChild(screen);
  }

  function step(n, title, desc) {
    return el('div', { class: 'howto-step' },
      el('div', { class: 'num' }, n),
      el('div', { class: 'body' },
        el('strong', {}, title),
        ' ',
        desc
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Render: STATS
  // ---------------------------------------------------------------------------
  function renderStats() {
    root().innerHTML = '';
    const total = stats.totalGames;
    const aprov = total > 0 ? Math.round((stats.totalWins / total) * 100) : 0;
    const favCatId = Object.entries(stats.categoryCount).sort((a, b) => b[1] - a[1])[0];
    const fav = favCatId ? findCategory(favCatId[0]) : null;

    const screen = el('div', { class: 'screen' },
      topbar('Estatísticas', () => navigate('home')),
      el('div', { class: 'screen-scroll' },
        el('div', { class: 'stats-grid' },
          tile(total, 'Partidas'),
          tile(stats.totalWins, 'Vitórias'),
          tile(stats.totalLosses, 'Derrotas'),
          tile(aprov + '%', 'Aproveitamento'),
          tile(stats.bestTimeLeft + 's', 'Melhor tempo'),
          tile(stats.longestStreak, 'Maior sequência'),
          tile(stats.totalCorrect, 'Acertos totais'),
          tile(stats.totalSkips, 'Pulos totais')
        ),

        fav && el('div', { class: 'card', style: { marginBottom: '14px' } },
          el('div', { style: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-mute)', marginBottom: '6px' } }, 'Categoria favorita'),
          el('div', { style: { fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px' } }, (fav.emoji || '') + ' ' + fav.name),
          el('div', { style: { fontSize: '12px', color: 'var(--text-mute)' } }, favCatId[1] + ' jogadas')
        ),

        el('div', { class: 'words-list-title' }, 'Medalhas'),
        el('div', { class: 'medals-row' },
          medalChip('Bronze', stats.medals.Bronze),
          medalChip('Prata', stats.medals.Prata),
          medalChip('Ouro', stats.medals.Ouro),
          medalChip('Lendário', stats.medals.Lendário)
        ),

        stats.history.length > 0 && el('div', {},
          el('div', { class: 'words-list-title' }, 'Últimas rodadas'),
          el('ul', { class: 'history-list' },
            ...stats.history.map((h) =>
              el('li', {},
                el('span', {}, h.category + ' • ' + h.score + '/5'),
                el('span', { class: 'result-pill ' + (h.result === 'won' ? 'win' : 'lose') },
                  h.result === 'won' ? 'venceu' : 'perdeu')
              )
            )
          )
        ),

        el('button', {
          class: 'btn btn-ghost btn-block',
          style: { marginTop: '18px' },
          onClick: () => {
            if (confirm('Apagar todas as estatísticas?')) {
              resetStats();
              renderStats();
            }
          }
        }, 'Limpar estatísticas')
      )
    );
    root().appendChild(screen);
  }

  function tile(big, lbl) {
    return el('div', { class: 'stat-tile' },
      el('div', { class: 'big' }, big),
      el('div', { class: 'lbl' }, lbl)
    );
  }
  function medalChip(name, count) {
    const has = count > 0;
    const cls = name.toLowerCase().replace('á', 'a').replace('é', 'e');
    return el('div', { class: 'medal-chip' + (has ? ' has medal-' + cls : '') },
      name + ' ' + (count || 0)
    );
  }

  // ---------------------------------------------------------------------------
  // Topbar helper
  // ---------------------------------------------------------------------------
  function topbar(title, onBack, hideBack = false) {
    return el('div', { class: 'topbar' },
      hideBack
        ? el('div', { class: 'topbar-spacer' })
        : el('button', { class: 'back-btn', 'aria-label': 'Voltar', onClick: () => { tap(); (onBack || (() => navigate('home')))(); } }, '←'),
      el('h2', { class: 'topbar-title' }, title || ''),
      el('div', { class: 'topbar-spacer' })
    );
  }

  function tap() { playSound('click'); vibrate('tap'); }

  // ---------------------------------------------------------------------------
  // Teclado (desktop)
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // Confete (F) — canvas leve, sem dependência
  // ---------------------------------------------------------------------------
  function triggerConfetti(count = 70) {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const old = document.getElementById('confettiCanvas');
    if (old) old.remove();

    const canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(canvas);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = window.innerWidth, H = window.innerHeight;
    const colors = AppState.settings.themePanela
      ? ['#f4b942', '#ef6a5e', '#4ec07a', '#fff8e7', '#1a5a82']
      : ['#7b3df0', '#34e89e', '#ffd166', '#ff7a3d', '#ff4d6d', '#9d6bff'];

    const parts = [];
    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.5,
        w: 6 + Math.random() * 6,
        h: 10 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        sway: Math.random() * Math.PI * 2
      });
    }

    const start = performance.now();
    const DURATION = 3000;
    function frame(now) {
      const elapsed = now - start;
      const fadeOut = elapsed > DURATION ? Math.max(0, 1 - (elapsed - DURATION) / 600) : 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = fadeOut;

      for (const p of parts) {
        p.sway += 0.05;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < DURATION + 700) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  function bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (AppState.roundStatus === 'playing') {
        if (e.code === 'ArrowRight' || e.code === 'Space') {
          e.preventDefault(); markCorrect();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault(); skipWord();
        } else if (e.code === 'Escape') {
          e.preventDefault(); pauseRound();
        }
      } else if (AppState.roundStatus === 'paused' && (e.code === 'Enter' || e.code === 'Escape')) {
        e.preventDefault(); resumeRound();
      } else if (e.code === 'Enter') {
        // continuar fluxo quando fizer sentido
        if (AppState.screen === 'preparing') navigate('countdown');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function initApp() {
    // destrava áudio no primeiro toque
    const unlock = () => { ensureAudio(); document.removeEventListener('touchstart', unlock); document.removeEventListener('click', unlock); };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });

    bindKeyboard();

    // Bloqueia gestos de zoom (iOS)
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('dblclick', (e) => e.preventDefault());

    // Recupera categorias se ainda não carregaram
    if (!window.GESTO_CATEGORIES) {
      console.warn('Gesto: categorias não carregadas.');
    }

    // Aplica tema Panela se persistido
    applyTheme();

    navigate('home');
  }

  // Expor algumas funções para debug, mas mantém o resto local
  window.Gesto = { state: AppState, stats, navigate };

  document.addEventListener('DOMContentLoaded', initApp);
})();

