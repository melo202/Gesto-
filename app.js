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
      partyMode: false
    }
  };

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

  function playSound(type) {
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
    AppState.timerId = setInterval(() => {
      if (AppState.roundStatus !== 'playing') return;
      AppState.timeLeft = Math.max(0, AppState.timeLeft - 1);
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

      if (AppState.timeLeft <= 5 && AppState.timeLeft > 0 && AppState.timeLeft !== lastTick) {
        playSound('tick');
      }
      lastTick = AppState.timeLeft;

      if (AppState.timeLeft <= 0) {
        endRound('time');
      }
    }, 1000);
  }

  function stopTimer() {
    if (AppState.timerId) {
      clearInterval(AppState.timerId);
      AppState.timerId = null;
    }
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
    playSound('correct');
    vibrate('correct');
    AppState.correctWords.push(AppState.currentWord);
    AppState.score += 1;
    flash('flash-win');

    if (AppState.score >= AppState.targetScore) {
      endRound('reached');
      return;
    }
    if (AppState.score === AppState.targetScore - 1) {
      playSound('lastone');
      vibrate('lastone');
    }
    advanceWord();
    renderGameContent();
  }

  function skipWord() {
    if (AppState.roundStatus !== 'playing') return;
    if (!AppState.settings.allowSkip) return;
    playSound('skip');
    vibrate('skip');
    AppState.skippedWords.push(AppState.currentWord);
    flash('flash-skip');
    advanceWord();
    renderGameContent();
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
    if (result === 'won') {
      team.wins += 1;
      team.points += 1;
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
      round: AppState.currentRound
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
    if (AppState.mode === 'teams') {
      const sorted = AppState.teams.slice().sort((a, b) => b.points - a.points);
      const placar = sorted.map((t) => `${t.name}: ${t.points}`).join(' | ');
      const winner = sorted[0];
      return `Gesto! 🎭\nVencedor: ${winner.name}\nPlacar: ${placar}\nQuem encara a revanche?`;
    }
    const result = AppState.roundStatus === 'won'
      ? `Resultado: ${AppState.score}/5\nTempo restante: ${AppState.timeLeft}s${medal ? `\nMedalha: ${medal}` : ''}`
      : `Resultado: ${AppState.score}/5 (faltaram ${AppState.targetScore - AppState.score})`;
    return `Joguei Gesto! 🎭\nCategoria: ${cat ? cat.name : '-'}\n${result}\nVocê conseguiria?`;
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
    switch (AppState.screen) {
      case 'home':          return renderHome();
      case 'modeSelect':    return renderModeSelect();
      case 'categorySelect':return renderCategorySelect();
      case 'roundSetup':    return renderRoundSetup();
      case 'teamSetup':     return renderTeamSetup();
      case 'preparing':     return renderPreparing();
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

    const hero = el('div', { class: 'hero' },
      el('h1', { class: 'logo' }, 'Gesto', el('span', { class: 'bang' }, '!')),
      el('p', { class: 'subtitle' }, 'Acerte 5 antes do tempo acabar.'),
      el('p', { class: 'hero-blurb' },
        'Escolha uma categoria, faça mímica e tente fechar 5 acertos. Rápido, divertido e perigoso pra quem não sabe atuar.'
      )
    );

    const actions = el('div', { class: 'home-actions' },
      el('button', { class: 'btn btn-primary btn-block', onClick: () => { tap(); AppState.mode = 'quick'; AppState.settings.partyMode = false; navigate('categorySelect'); } },
        'Jogar agora'
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
      topbar('Configuração', () =>
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
        el('label', { class: 'setup-label' }, 'Opções'),
        toggleRow('Som', 'Beeps e fanfarra.', AppState.settings.sound,
          () => { AppState.settings.sound = !AppState.settings.sound; tap(); renderRoundSetup(); }),
        toggleRow('Vibração', 'Feedback tátil no celular.', AppState.settings.vibration,
          () => { AppState.settings.vibration = !AppState.settings.vibration; tap(); renderRoundSetup(); }),
        toggleRow('Permitir pular', 'Trocar palavra quando travar.', AppState.settings.allowSkip,
          () => { AppState.settings.allowSkip = !AppState.settings.allowSkip; tap(); renderRoundSetup(); }),
        toggleRow('Modo Festa', 'Cada palavra vem com um desafio.', AppState.settings.partyMode,
          () => { AppState.settings.partyMode = !AppState.settings.partyMode; tap(); renderRoundSetup(); })
      ),

      el('button', { class: 'btn btn-primary btn-block', style: { marginTop: '8px' }, onClick: () => { tap(); navigate('preparing'); } },
        'Começar'
      )
    );
    root().appendChild(screen);
  }

  function toggleRow(label, sub, on, onClick) {
    return el('div', { class: 'toggle-row', onClick },
      el('div', { class: 'label-pair' },
        el('span', { class: 'lbl' }, label),
        el('span', { class: 'sub' }, sub)
      ),
      el('div', { class: 'switch' + (on ? ' on' : '') })
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
        el('h2', { class: 'prepare-title' }, 'Preparem-se'),
        el('p', { class: 'prepare-instructions' },
          'O objetivo é acertar ' + AppState.targetScore + ' palavras. ',
          el('br'),
          'Uma pessoa faz mímica. O grupo adivinha.'
        ),
        AppState.suddenDeath && el('div', { class: 'sudden-death-banner' }, '⚡ MORTE SÚBITA ⚡'),
        el('button', { class: 'btn btn-primary', style: { minWidth: '220px', marginTop: '12px' }, onClick: () => { tap(); navigate('countdown'); } },
          'Começar'
        )
      )
    );
    root().appendChild(screen);
  }

  // ---------------------------------------------------------------------------
  // Render: COUNTDOWN 3-2-1
  // ---------------------------------------------------------------------------
  function renderCountdown() {
    root().innerHTML = '';
    AppState.roundStatus = 'countdown';
    const screen = el('div', { class: 'screen' });
    const wrap = el('div', { class: 'prepare-wrap' });
    const num = el('div', { class: 'countdown-number' }, '3');
    wrap.appendChild(num);
    screen.appendChild(wrap);
    root().appendChild(screen);
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
        el('div', { class: 'game-category-pill' },
          (team ? team.name + ' • ' : '') + (cat ? cat.name : '')
        ),
        el('button', { class: 'pause-btn', onClick: () => { tap(); pauseRound(); } }, '⏸')
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

      el('div', { class: 'action-row' },
        el('button', {
          class: 'btn btn-warn',
          disabled: !AppState.settings.allowSkip,
          onClick: () => { skipWord(); }
        }, 'PULAR'),
        el('button', {
          class: 'btn btn-success',
          onClick: () => { markCorrect(); }
        }, 'ACERTOU')
      )
    );
    root().appendChild(screen);
  }

  function renderGameContent() {
    // Atualiza só o stage e progress (sem recriar a tela inteira)
    const stage = $('#wordStage');
    if (!stage) return;
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

  function renderProgressPill() {
    const almost = AppState.score === AppState.targetScore - 1;
    return el('div', { class: 'progress-pill' + (almost ? ' almost' : '') },
      el('span', { class: 'frac' }, AppState.score + '/' + AppState.targetScore)
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
      el('p', { style: { color: 'var(--text-dim)', textAlign: 'center', margin: '0 0 8px' } }, 'A palavra está escondida.'),
      el('button', { class: 'btn btn-primary', onClick: () => { tap(); resumeRound(); } }, 'Continuar'),
      el('button', { class: 'btn btn-secondary', onClick: () => { tap(); endRound('manual'); } }, 'Encerrar rodada'),
      el('button', { class: 'btn btn-ghost', onClick: () => { tap(); stopTimer(); AppState.roundStatus = 'idle'; navigate('home'); } }, 'Voltar ao menu')
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

    const screen = el('div', { class: 'screen' },
      topbar('', () => navigate('home'), true),

      el('div', { class: 'result-hero' },
        el('h1', { class: 'result-title ' + (won ? 'win' : 'lose') },
          won
            ? (AppState.timeLeft <= 3 ? 'No último suspiro!' : (AppState.timeLeft >= 30 ? 'LENDÁRIO!' : 'Missão cumprida!'))
            : (AppState.score >= 4 ? 'Faltou só uma!' : 'Quase!')
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
        el('div', { class: 'summary-tile' },
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
        )
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

    // melhor rodada da noite
    const bestRound = AppState.sessionHistory
      .filter((h) => h.result === 'won')
      .sort((a, b) => b.timeLeft - a.timeLeft)[0];
    const mostSkips = AppState.teams.slice().sort((a, b) => b.skips - a.skips)[0];
    const bestAvg = AppState.teams.slice()
      .filter((t) => t.played > 0)
      .sort((a, b) => (b.wins / b.played) - (a.wins / a.played))[0];

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

    navigate('home');
  }

  // Expor algumas funções para debug, mas mantém o resto local
  window.Gesto = { state: AppState, stats, navigate };

  document.addEventListener('DOMContentLoaded', initApp);
})();

