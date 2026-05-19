# Gesto! 🎭

> **Acerte 5 antes do tempo acabar.**

Gesto! é um party game de mímica em grupos, mobile-first, jogável direto no navegador do iPhone, sem instalação obrigatória e sem custos.

Funciona apenas com HTML, CSS e JavaScript puro. Sem build, sem npm, sem backend. Hospedagem grátis no GitHub Pages em 30 segundos.

---

## 1. O que é o Gesto!

Um time escolhe uma categoria, inicia uma rodada e precisa acertar **5 palavras antes do tempo acabar**.

- Uma pessoa faz mímica.
- O grupo tenta adivinhar.
- Acertou → toca em **ACERTOU**.
- Travou → toca em **PULAR**.
- Ao acertar 5, vitória.
- Tempo acabou antes? Derrota dolorida e revanche imediata.

Modos disponíveis:
- **Modo Rápido** — um grupo, uma rodada, direto ao ponto.
- **Modo Times** — 2 a 6 times, melhor de 3/5/7 ou livre, com morte súbita em caso de empate.
- **Modo Festa** — cada palavra vem com um desafio absurdo (câmera lenta, sem mãos, dramático, etc). Botão direto na tela inicial.

Banco de palavras (Fase 2): **16 categorias, mais de 1.100 palavras**, todas curadas para mímica — com cara de cena, sem juridiquês pesado nem termos abstratos demais.

---

## 2. Como jogar

1. Abra o app no celular.
2. Toque em **Jogar agora** (rápido), **🏆 Times** (competitivo) ou **🎉 Festa** (caótico).
3. Escolha uma categoria (16 opções + Misturar tudo).
4. Configure tempo (45/60/90/120s), som, vibração e modo festa.
5. Toque em **Começar**, prepare-se na contagem 3-2-1, e jogue.
6. Veja o resultado, ganhe medalha e parta pra revanche.

Durante a rodada o jogo te avisa do "FALTA SÓ UMA" com efeito dourado, e nos últimos 5s aparece uma vinheta vermelha pulsando para criar tensão.

Atalhos de teclado (desktop):
- **Seta direita** ou **Espaço** = ACERTOU
- **Seta esquerda** = PULAR
- **Esc** = pausar
- **Enter** = continuar

---

## 3. Como rodar localmente

Basta abrir o `index.html` no navegador. Sem instalação.

Se quiser servidor local (recomendado para testar PWA e service worker):

```bash
# Python 3
python -m http.server 8000

# Node (sem instalação extra)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Depois abra `http://localhost:8000`.

---

## 4. Como hospedar grátis no GitHub Pages

1. Crie um repositório novo no GitHub (ex.: `gesto`).
2. Suba os arquivos do projeto (todos da raiz: `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `data/`).
3. Vá em **Settings** → **Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch `main` e a pasta `/ (root)`.
6. Salve.
7. Aguarde 1 minuto. A URL pública vai aparecer em **Settings → Pages** (algo como `https://seu-user.github.io/gesto/`).

---

## 5. Como jogar no iPhone

1. Abra a URL do GitHub Pages no **Safari**.
2. (Opcional) Toque no botão de compartilhar → **Adicionar à Tela de Início**. Isso instala como app, com ícone próprio e modo standalone.
3. Permita som ao primeiro toque (Safari pede uma interação antes de tocar áudio — o jogo já faz isso automaticamente).

O jogo é totalmente jogável só por toque. Não precisa de teclado, sensor ou conexão depois do primeiro carregamento (o service worker faz cache).

---

## 6. Como adicionar categorias e palavras

Edite `categories.js` (na raiz do projeto). Cada categoria é um objeto:

```js
{
  id: "minha-categoria",          // único, sem espaços
  name: "Minha categoria",
  emoji: "🌟",
  difficulty: "Médio",            // Fácil | Médio | Difícil | Insano
  description: "Descrição curta.",
  words: [
    "palavra1",
    "palavra2",
    "palavra3"
    // mínimo recomendado: 50 palavras
  ]
}
```

Adicione palavras simplesmente incluindo novas strings no array `words` de qualquer categoria.

A categoria **Aleatório** é gerada automaticamente em runtime juntando todas as outras — não precisa editá-la.

---

## 7. Como personalizar tempo e meta

- **Tempo**: alterável na tela de configuração (45/60/90/120s). Pra mudar as opções, edite a constante `TIME_OPTIONS` em `app.js`.
- **Meta de acertos**: por padrão **5**. Pra mudar, ajuste `AppState.targetScore` em `app.js`. As regras de "Faltam X" e medalhas continuam funcionando.

---

## 8. Como funciona o modo Times

- Crie de **2 a 6 times** na tela de setup.
- Edite os nomes inline (toque no campo).
- Cada time joga **uma rodada por vez**.
- Cada rodada ganha vale **1 ponto** se o time acertar 5 palavras dentro do tempo.
- Escolha o formato:
  - **Melhor de 3 / 5 / 7** — encerra quando alguém alcançar a maioria.
  - **Livre** — joga até cansar; encerre manualmente em "Encerrar jogo".
- O placar narra a competição automaticamente: "X abriu vantagem", "tudo igual", "última rodada".

---

## 9. Como funciona o modo Festa

Ativado no toggle "Modo Festa" do setup, ou pelo card direto na tela de modos.

Cada palavra vem com um **desafio extra** sorteado: câmera lenta, sem mãos, dramático, em silêncio absoluto, como vilão, etc. Todos os ~28 desafios estão em `app.js` na constante `PARTY_CHALLENGES` (fácil de adicionar mais).

---

## 10. Como funciona a morte súbita

Quando o jogo de times termina em **empate no topo do placar**, ativa automaticamente:
- Rodada extra de **30 segundos**.
- Meta de 5 acertos.
- Vence quem fizer mais acertos. Se empatar de novo, vence quem terminou com mais tempo restante.
- Se ainda empatar, **repete** a morte súbita até alguém abrir vantagem.

Aparece com banner pulsante de "⚡ MORTE SÚBITA ⚡" pra criar tensão.

---

## 11. Como funcionam as medalhas

Atribuídas ao vencer uma rodada, baseadas no tempo que **sobrou** quando você fechou os 5 acertos:

| Tempo restante | Medalha     |
|----------------|-------------|
| 30s ou mais    | 🏅 Lendário |
| 21 a 29s       | 🥇 Ouro     |
| 11 a 20s       | 🥈 Prata    |
|  1 a 10s       | 🥉 Bronze   |

Todas ficam contabilizadas na tela de Estatísticas.

---

## 12. Limitações conhecidas

- **iOS Safari**: a primeira vez que abrir, pode pedir um toque pra liberar áudio (Web Audio API exige interação). Já tratado no código.
- **Vibração**: nem todo iPhone suporta `navigator.vibrate` no Safari. Quando não suporta, é ignorado silenciosamente.
- **Web Share API**: se o navegador não suportar, o resultado é copiado pra área de transferência como fallback.
- **localStorage privado**: em janela anônima ou se o usuário bloquear, estatísticas não são persistidas. O app continua funcionando.
- **Sem backend**: estatísticas e times são por dispositivo; não há ranking global.
- **Ícones**: gerados via SVG inline no manifest. Ficam ok no iOS, mas pra Android Maskable Icon máximo, recomenda-se gerar PNGs 192/512.

---

## 13. Categorias incluídas (Fase 2)

| Categoria              | Emoji | Palavras |
|------------------------|-------|----------|
| Animais                | 🐾    | 70       |
| Profissões             | 💼    | 69       |
| Objetos                | 📦    | 74       |
| Filmes e TV            | 🎬    | 72       |
| Esportes               | ⚽    | 69       |
| Comidas                | 🍕    | 75       |
| Ações                  | 🏃    | 79       |
| Brasilidades           | 🇧🇷    | 74       |
| Festa                  | 🎉    | 64       |
| Infantil               | 🧸    | 66       |
| Casais                 | 💞    | 67       |
| Mundo jurídico leve    | ⚖️    | 68       |
| Atualidades & Internet | 📱    | 70       |
| Viagem & Mundo         | ✈️    | 65       |
| Academia & Fitness     | 💪    | 68       |
| Difícil                | 🧠    | 62       |
| **Aleatório**          | 🎲    | 1.112    |

Total: **1.112 palavras únicas**, todas curadas para mímica em festa, casais, família e grupos de amigos.

---

## 14. Próximas melhorias

- [ ] Controle por inclinação (tilt forward = acertou, tilt back = pular), com permissão iOS e calibração.
- [ ] Cronômetro circular em vez de barra.
- [ ] Sons de fanfarra mais ricos com envelope ADSR.
- [ ] Tema claro opcional.
- [ ] Edição de categorias direto na UI.
- [ ] Atalhos de jogo para Apple Watch / smartwatch.
- [ ] Compartilhar como imagem (canvas → blob).
- [ ] Ranking local persistido por time/sessão.

---

## Estrutura de arquivos

```
.
├── index.html
├── styles.css
├── app.js
├── sw.js
├── manifest.webmanifest
├── categories.js
└── README.md
```

Tudo carrega direto. Nenhum build step.

---

## Stack

- HTML semântico
- CSS moderno (variáveis, gradientes, animações, safe-area)
- JavaScript puro (sem React, sem Vue, sem build)
- Web Audio API (sons procedurais — sem arquivos externos)
- Web Share API + clipboard fallback
- localStorage para estatísticas
- Service Worker para offline
- PWA manifest

Tipografia: Bricolage Grotesque (display) + Manrope (UI), via Google Fonts. Cacheadas no primeiro load. Se preferir totalmente offline desde o início, troque por system-ui no `styles.css`.

---

## Licença

Uso livre, modifique como quiser. Categoria "Mundo jurídico leve" feita com carinho pra advogados rirem do próprio cotidiano.

Boa rodada. 🎭
