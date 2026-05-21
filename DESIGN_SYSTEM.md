# Gesto! — Design System

Documentação do sistema visual do app Gesto! (Panela Inc.). Versão 1.8.

Este documento cobre os **tokens** (variáveis fundamentais), os **componentes reutilizáveis**, os **padrões** de composição e os **temas** disponíveis.

---

## 1. Filosofia

- **Mobile-first**: cada decisão começa no iPhone, depois escala.
- **Glass dark**: fundos profundos (azul ou violeta) com cards em vidro fosco (`backdrop-filter: blur(12px)`).
- **Texto sempre legível**: contraste mínimo 4.5:1 para texto pequeno, 3:1 para texto grande/UI.
- **Áreas de toque ≥ 44×44px** (WCAG 2.5.5).
- **Animações com propósito** — entrada de palavra, pulso de combo, troca de tela. Nunca decorativas vazias.
- **Reduced motion respeitado** — `@media (prefers-reduced-motion: reduce)` zera animações.

---

## 2. Design Tokens

### 2.1 Paleta — Tema Clássico (default)

| Token | Hex | Uso |
|---|---|---|
| `--bg-deep` | `#08031a` | Fundo mais profundo (gradiente top) |
| `--bg-mid` | `#0e0530` | Fundo intermediário |
| `--bg-soft` | `#1a0a4d` | Fundo próximo à base |
| `--violet` | `#7b3df0` | Cor de marca primária |
| `--violet-hi` | `#9d6bff` | Realce / hover |
| `--violet-lo` | `#4a1fb0` | Sombras de marca |
| `--blue-deep` | `#2436c7` | Gradient pair com violet |
| `--green-neon` | `#34e89e` | ACERTOU / combo / sucesso |
| `--green-soft` | `#0f9b6e` | Acento verde escuro |
| `--amber` | `#ffb429` | Aviso (timer 15-5s) |
| `--orange` | `#ff7a3d` | PULAR / aviso forte |
| `--coral` | `#ff4d6d` | Derrota / morte súbita |
| `--rose` | `#ff7a99` | Acento rosa pulsante |
| `--gold` | `#ffd166` | "FALTA SÓ UMA" / medalha Ouro |
| `--text` | `#f7f5ff` | Texto principal (17.5:1 sobre bg-deep) |
| `--text-dim` | `#c3b9e6` | Texto secundário (9.4:1) |
| `--text-mute` | `#9d92c4` | Texto terciário (5.1:1) |

### 2.2 Paleta — Tema Panela Inc.

Aplicado via classe `body.theme-panela`, sobrescreve os tokens acima.

| Token | Hex | Uso |
|---|---|---|
| `--bg-deep` | `#062236` | Azul lago profundo |
| `--bg-mid` | `#0c3e5e` | Azul lago meio |
| `--bg-soft` | `#1a5a82` | Azul lago raso |
| `--violet` → coral | `#ef6a5e` | Cor de marca primária (acerola) |
| `--violet-hi` → dourado | `#f4b942` | Realce dourado (sol) |
| `--gold` | `#f4b942` | Mesmo dourado |
| `--coral` | `#ef6a5e` | Mesmo coral |
| `--green-neon` | `#4ec07a` | Verde palmeira |
| `--text` | `#fff8e7` | Texto principal (creme) |
| `--text-dim` | `#e8d5a3` | Texto secundário (areia) |
| `--text-mute` | `#b89d6e` | Texto terciário (bege escuro) |

### 2.3 Cores semânticas (não-temáticas)

| Token | Tema Classic | Tema Panela | Uso |
|---|---|---|---|
| Success | `--green-neon` | `--green-neon` | ACERTOU, vitória |
| Warning | `--amber/orange` | `--gold/orange` | PULAR, timer baixo |
| Danger | `--coral` | `--coral` | Derrota, sem pulos |
| Info | `--blue-deep` | `#1c4a73` | Bet pill |

### 2.4 Tipografia

| Token | Família | Pesos | Uso |
|---|---|---|---|
| `--font-display` | Bricolage Grotesque | 700, 800 | Logo, títulos, números grandes, botões |
| `--font-body` | Manrope | 400–800 | Texto corrido, labels, descrições |

**Escala de tamanho:**

| Uso | Tamanho | Peso |
|---|---|---|
| Logo home | `clamp(64px, 18vw, 96px)` | 800 |
| Result title | 44px | 800 |
| Prepare title | 44px | 800 |
| Word display | `clamp(36px, 9vw, 64px)` | 800 |
| Countdown | 180px | 800 |
| Subtitle | 17px | 500 |
| Body | 16px | 400 |
| Botão | 17px | 700 |
| Botão action-row | 19px | 800 |
| Microcopy | 12–14px | 600 |
| Label setup | 13px uppercase | 600 |

### 2.5 Espaçamento

| Token | Valor | Uso |
|---|---|---|
| `--radius-lg` | 22px | Cards principais, hero |
| `--radius-md` | 16px | Botões, cards menores, inputs |
| `--radius-sm` | 10px | Items de histórico, listinhas |
| Padding screen | 18px lateral, 22px bottom | `.screen` |
| Gap action-row | 12px | Entre PULAR e ACERTOU |
| Padding card | 18px | `.card` interior |

### 2.6 Alturas mínimas (WCAG)

| Token / Componente | Altura mínima | Justificativa |
|---|---|---|
| `--btn-h` | 60px | Botões padrão (`.btn`) |
| Action row btn | 72px (64px em SE) | Botões críticos da rodada |
| `.chip` | 44px | WCAG 2.5.5 |
| `.pause-btn` | 44px | WCAG 2.5.5 |
| `.team-remove` | 44px | WCAG 2.5.5 |
| `.theme-toggle-btn` | 44px | WCAG 2.5.5 |

### 2.7 Sombras

| Nome | Valor |
|---|---|
| `--shadow-card` | `0 16px 48px rgba(0,0,0,0.45), 0 2px 8px rgba(123,61,240,0.18)` |
| Botão primário | `0 14px 32px rgba(123,61,240,0.42), inset 0 1px 0 rgba(255,255,255,0.18)` |
| Botão success | `0 14px 32px rgba(52,232,158,0.32), inset 0 1px 0 rgba(255,255,255,0.25)` |
| Botão warn | `0 14px 32px rgba(255,122,61,0.34)` |

### 2.8 Motion

| Token / Animação | Duração | Easing |
|---|---|---|
| Screen in | 320ms | `cubic-bezier(.2,.8,.2,1)` |
| Word in/out | 180–280ms | `cubic-bezier(.2,.8,.2,1)` |
| Countdown pop | 800ms | `cubic-bezier(.2,.8,.2,1)` |
| Button press | 90ms | `ease` |
| Combo pulse | 700ms loop | `ease-in-out` |
| Almost pulse | 900ms loop | `ease-in-out` |
| Sudden death pulse | 1.5s loop | `ease-in-out` |
| Heat breathe | 1.2s loop | `ease-in-out` |
| Title pop (result) | 480ms | `cubic-bezier(.2,.8,.2,1)` |

### 2.9 Áudio

- **Procedural** (Web Audio): beeps curtos, sempre disponíveis. Default sem assets.
- **Pacote Panela** (5 WAV + 1 MP3): SFX longos + música ambiente. Toca quando `soundPack === 'panela'`.
- **Audio ducking**: SFX importantes (victory, defeat, sudden) abaixam música ambiente pra ~4% por 2-3s.
- **Ambient music**: ~28% volume, fade in/out 1.2s/600ms, para em telas `countdown` e `playing`.

---

## 3. Componentes

### 3.1 Button (`.btn`)

Base reutilizável para todas ações.

**Variantes:**

| Classe | Uso |
|---|---|
| `.btn-primary` | Ação principal (gradient violet→blue) |
| `.btn-secondary` | Ação secundária (vidro fosco) |
| `.btn-ghost` | Ação terciária (borda fraca) |
| `.btn-success` | ACERTOU |
| `.btn-warn` | PULAR |
| `.btn-danger` | Voltar ao menu / destrutivo |
| `.party-cta` | Botão Festa (gradient coral→orange→amber) |

**Modificadores:**
- `.btn-block` — width 100%
- Dentro de `.btn-row` — flex: 1 lado a lado

**Estados:**
- Default: gradient da variante
- Active (toque): `scale(0.97)` + sombra reduzida
- Disabled: opacity 0.55 + saturação 0.7
- Focus-visible: outline dourado 3px (`--gold`)

**Acessibilidade:**
- Min-height 60px (action-row: 72px)
- Texto sempre legível (contraste ≥ 4.5:1)
- `:focus-visible` global ativa outline

### 3.2 Card (`.card`)

Glass card base. Fundo `rgba(255,255,255,0.06)` + `backdrop-filter: blur(12px)`.

**Variações:**
- `.card-stack` — agrupa múltiplos cards verticalmente
- Cards específicos: `.category-card`, `.team-score-card`, `.mvp-card`, `.summary-tile`, `.bet-card`

**Token usado:** `--card`, `--card-strong`, `--card-border`, `--radius-lg`.

### 3.3 Chip (`.chip`)

Opção selecionável em grupos (tempo, pulos, formato, pacote de som, bet).

**Estados:**
- Default: vidro fosco
- Active: gradient violet→blue + sombra (no Classic) ou coral→dourado (Panela)
- Pressed: `scale(0.96)`

**Layout:** dentro de `.chip-row` (flex wrap, gap 8px).

**Min-height:** 44px (WCAG).

### 3.4 Toggle (`.toggle-row` + `.switch`)

Liga/desliga binário com label + sublabel.

**Estados:**
- Off: switch cinza
- On: switch gradient violet→blue, ponto desliza pra direita

**Acessibilidade:**
- `role="switch"`, `aria-checked`, `aria-label`
- `tabindex="0"` + Space/Enter funcionais
- Switch interno tem `aria-hidden="true"` (visual only)

### 3.5 Input (`.team-name-input`, `.mimer-input`)

Texto livre. Fundo transparente ou vidro fosco. Border 1px.

**Estados:**
- Default: border `--card-border`
- Focus: border `--violet-hi`
- Focus-visible: outline dourado adicional

**Acessibilidade:** sempre tem `aria-label` (placeholders não bastam).

### 3.6 Progress Pill (`.progress-pill`)

Mostra "X/5" na rodada.

**Modificador:**
- `.almost` — quando faltam 1 acerto. Gradient gold→orange→coral, animação pulsante.

### 3.7 Combo Pill (`.combo-pill`)

Aparece a partir de 2 acertos seguidos.

**Estados:**
- Default: verde-neon translúcido, pulsando
- `.ready` (a cada múltiplo do bônus): verde-neon sólido, mais intenso

**Diferenciado** visualmente do `.progress-pill.almost` para evitar colisão semântica.

### 3.8 Bet Card (`.bet-card`)

Card de aposta no modo Times.

**Variantes:**
- `.bet-safe` — sem aposta (cinza)
- `.bet-risk-3` — verde (seguro)
- `.bet-risk-4` — dourado (médio)
- `.bet-risk-5` — coral (all-in)

Cada variante usa cor de fundo + cor do número grande proporcional ao risco.

### 3.9 Bet Pill (`.bet-pill`)

Pill no header da rodada quando há aposta. Azul-marinho (cor de "info"), distinta do combo (verde) e almost (dourado).

### 3.10 Bet Result Banner (`.bet-result-banner`)

Aparece no resultado. Variantes `.win` (verde) e `.lose` (coral).

### 3.11 Medal (`.medal`)

Mostrada na vitória.

**Variantes (por tempo restante):**
- `.medal-bronze` (1-10s) — gradient marrom
- `.medal-prata` (11-20s) — gradient prata
- `.medal-ouro` (21-29s) — gradient dourado
- `.medal-lendario` (30s+) — gradient rosa→violet→verde + confete

### 3.12 Skips Indicator

Mostra pulos restantes durante a rodada.

**Componentes internos:**
- `.skips-indicator` (container, `role="status"`)
- `.skip-dot` (ícone 🍳, `aria-hidden`) — `.on` quando disponível
- `.skips-indicator.empty` (zero pulos): fundo coral
- `.skips-indicator.unlimited`: mostra "∞ pulos"

### 3.13 Toast (`.toast`)

Mensagem efêmera no canto inferior. Pill com glass + sombra. `aria-live="polite"`.

### 3.14 Pause Overlay (`.pause-overlay`)

Overlay full-screen durante pausa. Backdrop blur + 3 botões: Continuar (primary), Encerrar rodada (secondary), Voltar ao menu (danger).

### 3.15 Surprise Overlay (`.surprise-overlay`)

Overlay full-screen na troca de categoria. 🌀 girando + label "CATEGORIA SURPRESA" + nome da nova. Dura 1.6s.

### 3.16 Topbar (`.topbar`)

Header com botão voltar (44×44 redondo) + título centrado + spacer.

---

## 4. Padrões de Composição

### 4.1 Tela padrão

```
.screen
├── .topbar                  ← Voltar + Título
├── [conteúdo principal]
└── [botões de ação]
```

Padding 18px lateral, 22px bottom (safe-area-inset).

### 4.2 Game header (rodada)

```
.game-header
├── .pause-btn-labeled       ⏸ Pausar (esquerda)
├── .game-category-pill      Nome do time • Categoria (centro)
└── .bet-pill OR spacer      🎲 4 (direita)
```

### 4.3 Stage de palavra

```
.word-stage
├── .progress-pill-row       Pills horizontais
│   ├── .progress-pill       X/5
│   ├── .skips-indicator     N pulos 🍳🍳🍳
│   └── .combo-pill          🔥 Combo X (condicional)
├── .context-hint            "FALTA SÓ UMA" / "Faltam 3"
├── .word-display            PALAVRA GIGANTE
└── .challenge-card          Desafio festa (condicional)
```

### 4.4 Result hero

```
.result-hero
├── .result-title            Missão cumprida! / Quase!
├── .result-sub              Detalhes
└── .medal                   Medalha (vitória)

.bet-result-banner           Banner aposta (condicional)
.competitive-message         Frase competitiva
.summary-grid                4 tiles 2x2
.words-list                  Acertos / Pulos
.result-actions              Botões finais
```

### 4.5 Scoreboard (modo Times)

```
.scoreboard
└── .team-score-card[]       Cards de times (sorted)
    ├── .badge (cor)
    ├── .info (nome + stats)
    └── .score-num

.narrative-banner            Frase competitiva da partida
.result-actions              Botões
```

---

## 5. Temas

### Como funciona

Tema **Classic** é o default (sem classe).
Tema **Panela Inc.** é ativado por `body.theme-panela` (via JS, persistido em localStorage).

Tema Panela sobrescreve:
- **CSS variables** (paleta inteira)
- **Logo** com gradient quente
- **Background** com watermark da frigideira centralizada
- **Edição Zoeira** badge no canto
- **Hashtag** no rodapé
- **Botão primário** vira gradient coral→dourado

### Como adicionar um tema novo

1. Criar uma classe `body.theme-NOME`.
2. Sobrescrever as CSS variables relevantes.
3. (Opcional) Adicionar regras para componentes específicos.
4. Expor toggle em `renderRoundSetup`.

---

## 6. Acessibilidade (resumo)

- **Contraste AA**: ≥ 4.5:1 para texto pequeno, ≥ 3:1 para grande/UI.
- **Touch targets**: ≥ 44×44 px em tudo interativo.
- **Foco visível**: outline dourado 3px em `:focus-visible`.
- **ARIA**: `role="switch"` em toggles, `role="status"` em indicadores, `aria-label` em botões de ícone e inputs, `aria-hidden` em emojis decorativos.
- **Reduced motion**: media query global zera animações a 0.01ms. Funções JS (`triggerConfetti`, `animateWordTransition`) checam antes de animar.
- **Keyboard**: atalhos no game (Space/→ acertou, ← pulou, Esc pausa). Botões custom com Space/Enter equivalentes.

---

## 7. Como evoluir o sistema

### Adicionar componente

1. Definir uso e necessidade no `app.js`.
2. Reaproveitar tokens existentes (não criar valores hardcoded).
3. Documentar variantes, estados, acessibilidade neste arquivo.
4. Testar em ambos os temas (Classic + Panela).
5. Bumpar `VERSION` em `sw.js`.

### Modificar token

1. Atualizar `:root` (Classic) e `body.theme-panela` (Panela) se aplicável.
2. Buscar usos diretos (hardcoded) com Grep e substituir por variável.
3. Verificar contraste pós-mudança.
4. Bumpar `VERSION`.

### Deprecar componente

1. Marcar como deprecado neste arquivo (manter docs).
2. Remover do app.js apenas após confirmar não-uso.
3. Limpar CSS associado.

---

## 8. Anti-padrões a evitar

- ❌ Hardcoded hex em vez de var(--token)
- ❌ Botão < 44px de altura
- ❌ Texto pequeno com contraste < 4.5:1
- ❌ Animação infinita sem `prefers-reduced-motion` check
- ❌ Input sem `aria-label`
- ❌ Toggle sem `role="switch"`
- ❌ Emoji decorativo sem `aria-hidden`
- ❌ Sobreposição de pills com cores quase iguais (semântica confusa)
- ❌ Áudio que toca em cima de outro sem ducking

---

## 9. Versionamento

| Versão | Mudanças |
|---|---|
| v1.0 | Sistema inicial — paleta violet, tema único |
| v1.1 | Adicionado tema Panela Inc. |
| v1.5 | Combo + pulos limitados, aposta, MVP, categoria surpresa, confete |
| v1.7 | Auditoria de acessibilidade — touch targets, focus-visible, contraste |
| v1.8 | Combo verde-neon, bet pill azul, edição zoeira mais discreto, testar sons movido |

---

Este documento vive em sincronia com `styles.css` e `app.js`. Quando mexer no visual, atualize aqui.
