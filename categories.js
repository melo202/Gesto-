/**
 * GESTO! — Base de palavras (Fase 2)
 * 17 categorias em português brasileiro, todas pensadas para mímica em grupo.
 * Curadoria reforçada: palavras mimáveis, com cara de cena, sem juridiquês pesado.
 *
 * Proporção geral por categoria:
 *   ~60% fáceis/médias  ·  ~30% engraçadas/intermediárias  ·  ~10% desafiadoras
 *
 * Critério para palavra boa:
 *   1) dá pra fazer mímica?
 *   2) uma pessoa comum conhece?
 *   3) gera cena engraçada?
 *   4) o grupo consegue adivinhar em 45–90s sem sofrer demais?
 *
 * Para adicionar palavras: inclua strings no array `words`.
 * Para adicionar categoria: copie um objeto e adicione ao array.
 */

window.GESTO_CATEGORIES = [
  {
    id: "animais",
    name: "Animais",
    emoji: "🐾",
    difficulty: "Fácil",
    description: "Bichos clássicos para todo mundo imitar.",
    words: [
      "cachorro", "gato", "elefante", "leão", "tigre", "girafa", "macaco", "cavalo",
      "vaca", "porco", "galinha", "pato", "peixe", "tubarão", "baleia", "golfinho",
      "polvo", "caranguejo", "borboleta", "abelha", "formiga", "aranha", "cobra",
      "jacaré", "tartaruga", "sapo", "rato", "coelho", "ovelha", "cabra", "camelo",
      "urso", "panda", "canguru", "preguiça", "tatu", "tamanduá", "papagaio",
      "tucano", "águia", "coruja", "pinguim", "flamingo", "avestruz", "morcego",
      "raposa", "lobo", "hipopótamo", "rinoceronte", "zebra", "esquilo", "guaxinim",
      "lhama", "veado", "javali", "capivara", "onça", "tamanduá-bandeira",
      "tucano-toco", "porco-espinho", "cachorro latindo", "gato com medo",
      "galinha botando ovo", "macaco coçando", "cobra dando bote",
      "elefante tomando banho", "leão rugindo", "preguiça no galho",
      "cavalo selvagem", "pinguim andando"
    ]
  },

  {
    id: "profissoes",
    name: "Profissões",
    emoji: "💼",
    difficulty: "Médio",
    description: "Quem trabalha com o quê — sem dizer o quê.",
    words: [
      "médico", "professor", "advogado", "engenheiro", "arquiteto", "dentista",
      "veterinário", "enfermeiro", "policial", "bombeiro", "piloto", "motorista",
      "garçom", "cozinheiro", "padeiro", "açougueiro", "pescador", "agricultor",
      "jardineiro", "pedreiro", "eletricista", "encanador", "mecânico",
      "carpinteiro", "pintor", "fotógrafo", "jornalista", "escritor", "ator",
      "cantor", "dançarino", "DJ", "palhaço", "mágico", "barbeiro",
      "cabeleireiro", "manicure", "estilista", "modelo", "juiz", "delegado",
      "vendedor", "gerente", "programador", "designer", "youtuber", "influencer",
      "astronauta", "cientista", "psicólogo", "fisioterapeuta",
      "personal trainer", "motoboy", "entregador", "porteiro", "segurança",
      "caixa de mercado", "atendente de telemarketing", "salva-vidas",
      "balconista", "fiscal de prova", "guia turístico", "garçonete",
      "barista", "sushiman", "personal stylist", "professor nervoso",
      "motorista de aplicativo", "professor de educação física"
    ]
  },

  {
    id: "objetos",
    name: "Objetos",
    emoji: "📦",
    difficulty: "Fácil",
    description: "Coisas do dia a dia que estão por toda parte.",
    words: [
      "cadeira", "mesa", "sofá", "cama", "travesseiro", "cobertor", "geladeira",
      "fogão", "micro-ondas", "liquidificador", "panela", "frigideira", "garfo",
      "faca", "colher", "prato", "copo", "xícara", "garrafa", "celular",
      "computador", "notebook", "fone de ouvido", "carregador", "controle remoto",
      "televisão", "rádio", "espelho", "escova de dente", "pente", "secador",
      "máquina de lavar", "ferro de passar", "vassoura", "rodo", "balde",
      "chave", "cadeado", "carteira", "óculos", "relógio", "guarda-chuva",
      "mochila", "bolsa", "mala", "livro", "caderno", "caneta", "lápis",
      "borracha", "tesoura", "fita adesiva", "grampeador", "calculadora",
      "ventilador", "ar-condicionado", "abajur", "vela", "isqueiro", "chaveiro",
      "carrinho de mercado", "aspirador de pó", "ferro de cabelo", "câmera",
      "microfone", "tripé", "pen drive", "carregador portátil",
      "fone bluetooth", "smartwatch", "ventoinha", "garrafa térmica",
      "marmita", "squeeze"
    ]
  },

  {
    id: "filmes",
    name: "Filmes e TV",
    emoji: "🎬",
    difficulty: "Médio",
    description: "Cinema, blockbusters e clássicos para mimicar.",
    words: [
      "Titanic", "Matrix", "Vingadores", "Homem-Aranha", "Batman", "Superman",
      "Tubarão", "Jurassic Park", "Senhor dos Anéis", "Harry Potter",
      "Star Wars", "Indiana Jones", "Velozes e Furiosos", "Rocky", "Coringa",
      "Pantera Negra", "Capitão América", "Homem de Ferro", "Thor", "Hulk",
      "Frozen", "Rei Leão", "Moana", "Aladdin", "Mulan", "Branca de Neve",
      "Cinderela", "Bela e a Fera", "Pequena Sereia", "Toy Story",
      "Procurando Nemo", "Up Altas Aventuras", "Carros", "Shrek", "Madagascar",
      "Era do Gelo", "Esqueceram de Mim", "De Volta para o Futuro",
      "Os Caça-Fantasmas", "E.T.", "Forrest Gump", "Cidade de Deus",
      "Tropa de Elite", "O Auto da Compadecida", "Os Incríveis", "Wall-E",
      "Divertida Mente", "Kung Fu Panda", "Avatar", "Piratas do Caribe",
      "Barbie", "Oppenheimer", "Minions", "Bob Esponja", "Pica-Pau",
      "Chaves", "Padrinhos Mágicos", "Os Simpsons", "Família Adams",
      "filme de terror", "filme de zumbi", "filme romântico", "novela",
      "reality show", "apresentador de TV", "vilão da novela", "super-herói",
      "mocinha chorando", "cena de luta", "explosão", "perseguição de carro",
      "filme de faroeste"
    ]
  },

  {
    id: "esportes",
    name: "Esportes",
    emoji: "⚽",
    difficulty: "Médio",
    description: "Movimentos clássicos do mundo esportivo.",
    words: [
      "futebol", "vôlei", "basquete", "tênis", "natação", "ciclismo", "corrida",
      "maratona", "boxe", "judô", "karatê", "taekwondo", "jiu-jitsu", "MMA",
      "ginástica olímpica", "ginástica rítmica", "salto em altura",
      "salto em distância", "salto com vara", "arremesso de peso",
      "lançamento de dardo", "remo", "canoagem", "surfe", "skate", "patinação",
      "hóquei", "beisebol", "futebol americano", "rugby", "handebol",
      "badminton", "tênis de mesa", "sinuca", "boliche", "golfe", "xadrez",
      "escalada", "paraquedismo", "asa-delta", "rapel", "mergulho", "kitesurfe",
      "stand up paddle", "futsal", "futevôlei", "peteca", "queimada", "pebolim",
      "crossfit", "ioga", "pilates", "zumba", "goleiro defendendo pênalti",
      "atacante chutando", "zagueiro travando", "treinador gritando",
      "juiz apitando", "comemoração de gol", "drible de craque",
      "saque de vôlei", "enterrada de basquete", "rolinho de jiu-jitsu",
      "soco de boxe", "chute giratório", "treino de academia",
      "agachamento com peso", "supino reto", "corrida na esteira"
    ]
  },

  {
    id: "comidas",
    name: "Comidas",
    emoji: "🍕",
    difficulty: "Fácil",
    description: "Pratos, lanches e bebidas pra dar água na boca.",
    words: [
      "pizza", "hambúrguer", "cachorro-quente", "lasanha", "espaguete",
      "macarrão", "feijoada", "arroz com feijão", "churrasco", "picanha",
      "linguiça", "frango assado", "peixe frito", "sushi", "sashimi", "tempurá",
      "yakisoba", "tacos", "burrito", "salada", "sopa", "estrogonofe", "risoto",
      "polenta", "panqueca", "crepe", "waffle", "torrada", "ovo frito",
      "omelete", "queijo", "presunto", "salame", "bacon", "pipoca",
      "batata frita", "pastel", "coxinha", "esfiha", "empada", "kibe",
      "pão de queijo", "tapioca", "açaí", "milho", "pamonha", "brigadeiro",
      "beijinho", "bolo", "torta", "pudim", "sorvete", "milk-shake",
      "refrigerante", "café", "chá", "suco", "vitamina", "água de coco",
      "cerveja", "caipirinha", "rodízio de pizza", "rodízio de carne",
      "pão na chapa", "misto-quente", "X-tudo", "marmita", "lanche de padaria",
      "sobremesa", "salgadinho de festa", "pão francês", "biscoito", "cuscuz",
      "feijão tropeiro", "pão com manteiga"
    ]
  },

  {
    id: "acoes",
    name: "Ações",
    emoji: "🏃",
    difficulty: "Médio",
    description: "Verbos puros — o coração da mímica.",
    words: [
      "correr", "pular", "andar", "sentar", "deitar", "levantar", "dançar",
      "cantar", "rir", "chorar", "bocejar", "espirrar", "tossir", "dormir",
      "acordar atrasado", "tomar banho", "escovar os dentes", "pentear o cabelo",
      "comer", "beber", "mastigar", "engolir", "cozinhar", "lavar louça",
      "varrer", "passar pano", "lavar roupa", "passar roupa", "dobrar roupa",
      "abrir porta", "fechar janela", "trancar", "amarrar sapato",
      "vestir camisa", "tirar sapato", "abraçar", "beijar", "apertar a mão",
      "acenar", "apontar", "assobiar", "bater palma", "estalar os dedos",
      "piscar", "soluçar", "alongar", "agachar", "girar", "rastejar",
      "engatinhar", "escalar", "nadar", "mergulhar", "remar", "dirigir",
      "pedalar", "patinar", "esquiar", "escrever", "desenhar", "ler", "pensar",
      "cair", "tropeçar", "pedir desculpa", "fugir", "procurar algo",
      "fazer academia", "tirar selfie", "gravar vídeo", "atender o celular",
      "mandar áudio", "digitar rápido", "torcer pelo time",
      "comemorar vitória", "lamentar derrota", "ouvir música", "dirigir bêbado",
      "fingir trabalhar"
    ]
  },

  {
    id: "brasilidades",
    name: "Brasilidades",
    emoji: "🇧🇷",
    difficulty: "Médio",
    description: "Coisas e cenas muito do Brasil.",
    words: [
      "carnaval", "samba", "frevo", "axé", "forró", "sertanejo", "funk carioca",
      "pagode", "capoeira", "berimbau", "pandeiro", "violão", "cuíca",
      "Cristo Redentor", "Pão de Açúcar", "Maracanã", "Copacabana", "Ipanema",
      "Amazônia", "Pantanal", "Cataratas do Iguaçu", "Lençóis Maranhenses",
      "Chapada Diamantina", "feijoada", "moqueca", "acarajé", "tapioca",
      "brigadeiro", "açaí", "guaraná", "caipirinha", "cachaça", "pé de moleque",
      "paçoca", "cocada", "rapadura", "pamonha", "canjica", "quentão",
      "festa junina", "quadrilha", "fogueira", "bandeirinha", "balão", "pipa",
      "futebol de várzea", "pelada", "Seleção Brasileira", "boi-bumbá",
      "jangada", "chinelo de dedo", "bermuda", "regata", "rede de dormir",
      "água de coco", "Réveillon na praia", "roupa branca", "pulinho na onda",
      "trio elétrico", "bloco de rua", "abadá", "marchinha", "fila de banco",
      "ônibus cheio", "motoboy", "feira", "caldo de cana", "rodízio",
      "barulho de obra", "churrasco de domingo", "boteco com a galera",
      "praia lotada", "carnaval de rua", "festa do peão"
    ]
  },

  {
    id: "festa",
    name: "Festa",
    emoji: "🎉",
    difficulty: "Médio",
    description: "Cenas de festa, embaraço e perrengue social.",
    words: [
      "karaokê desafinado", "primeiro beijo", "DJ animado", "DJ ruim",
      "dançarina constrangida", "salto que quebra", "vestido apertado",
      "selfie em grupo", "garrafa que vira", "rolha de champanhe estourando",
      "brinde exagerado", "tio dançando", "tia falando alto", "casamento chorando",
      "noivo nervoso", "bouquet voando", "dança da cadeira", "dança da garrafa",
      "estátua", "limbo", "garrafa girando", "verdade ou desafio",
      "amigo que dorme na festa", "amigo que sumiu", "fila do banheiro",
      "fila gigante", "porteiro chato", "boate cheia", "balada vazia",
      "ressaca brutal", "stories bêbado", "ligação errada",
      "mensagem que não devia mandar", "ex aparecendo", "crush ignorando",
      "esquecer o nome de alguém", "pisar no pé", "derramar bebida",
      "queimar comida", "bolo desabando", "vela apagando sozinha",
      "música parando do nada", "pista vazia", "última música", "fim de festa",
      "Uber surge", "preço subindo", "perdeu o celular", "achou o celular",
      "foto desfocada", "vídeo viral", "amigo emocionado", "dançar mal",
      "cantar no karaokê", "chegar atrasado", "tirar foto em grupo",
      "contar fofoca", "fingir que sabe dançar", "procurar celular perdido",
      "disputar truco", "tropeçar na pista", "amigo cantando alto",
      "festa surpresa", "primeira vez no rolê"
    ]
  },

  {
    id: "infantil",
    name: "Infantil",
    emoji: "🧸",
    difficulty: "Fácil",
    description: "Mímica segura e divertida para crianças.",
    words: [
      "bola", "boneca", "carrinho", "ursinho", "pipa", "bicicleta", "patinete",
      "balanço", "escorregador", "gangorra", "pula-pula", "amarelinha",
      "esconde-esconde", "pega-pega", "elástico", "queimada", "bambolê",
      "corda", "peteca", "pião", "ioiô", "bola de gude", "lápis de cor",
      "giz de cera", "massinha", "casinha", "pega-varetas", "quebra-cabeça",
      "blocos de montar", "trenzinho", "soldadinho", "dinossauro", "robô",
      "fantasia", "máscara", "capa de super-herói", "varinha mágica",
      "princesa", "rei", "rainha", "dragão", "fada", "duende", "papai noel",
      "coelho da páscoa", "professora", "merenda", "recreio", "sino da escola",
      "ônibus escolar", "lousa", "giz", "globo terrestre", "calendário",
      "estrelinha de bom aluno", "palhaço", "circo", "mágico", "astronauta",
      "sereia", "unicórnio", "pirata", "tesouro", "mapa do tesouro",
      "castelo", "balão colorido"
    ]
  },

  {
    id: "casais",
    name: "Casais",
    emoji: "💞",
    difficulty: "Médio",
    description: "Cenas a dois para noite de jogo do casal.",
    words: [
      "jantar à luz de velas", "primeiro encontro", "pedido de casamento",
      "aliança", "lua de mel", "passeio de mãos dadas", "selfie do casal",
      "filme romântico", "maratona de série", "pipoca no sofá", "abraço apertado",
      "beijo na testa", "café da manhã na cama", "flor surpresa",
      "cartinha de amor", "playlist do casal", "música que toca sempre",
      "dança lenta na sala", "viagem a dois", "pôr do sol na praia",
      "mochilão", "presente caro", "presente caseiro", "ciúme bobo",
      "briga boba", "fazer as pazes", "namoro à distância", "videochamada longa",
      "saudade", "sogra chegando", "encontro com a família", "morar junto",
      "dividir o controle remoto", "cobertor curto", "ronco alto",
      "esquecer aniversário", "lembrar a tempo", "comprar flor no posto",
      "treta no Whatsapp", "responder com ponto final", "deixar no vácuo",
      "indireta no story", "stalker mode", "tag em foto", "biografia combinada",
      "anel no quarto dedo", "buquê da noiva", "padrinhos chorando",
      "alianças trocadas", "dança dos noivos", "bolo de casamento",
      "lua cheia", "namoro escondido", "encontro às escuras", "match no app",
      "swipe pra direita", "DR", "discutir o controle", "dividir sobremesa",
      "dormir abraçado", "ronco do parceiro", "escolher filme juntos",
      "encontro no shopping", "mensagem visualizada", "ciúmes do colega",
      "presente de aniversário", "almoço com a sogra"
    ]
  },

  {
    id: "juridico",
    name: "Mundo jurídico leve",
    emoji: "⚖️",
    difficulty: "Médio",
    description: "Cenas do Direito sem juridiquês pesado.",
    words: [
      "advogado", "juiz", "audiência", "processo", "contrato", "testemunha",
      "tribunal", "assinatura", "multa", "herança", "inventário", "delegado",
      "prisão", "acordo", "cartório", "martelo do juiz", "toga", "júri",
      "petição", "cliente nervoso", "promotor", "réu", "sentença", "recurso",
      "procuração", "divórcio", "guarda dos filhos", "pensão alimentícia",
      "escritura", "leilão", "condomínio", "cobrança", "indenização", "fiança",
      "prova", "documento", "perícia", "oficial de justiça", "fórum",
      "advogado nervoso", "cliente atrasado", "audiência online",
      "contrato gigante", "juiz sério", "testemunha esquecida",
      "réu confessando", "vítima emocionada", "advogado de defesa",
      "advogado de acusação", "balança da Justiça", "tornozeleira eletrônica",
      "intimação", "carimbo", "carteirinha da OAB", "estagiário perdido",
      "secretária do fórum", "advogada de salto alto", "juiz dormindo",
      "promotor gritando", "cliente devendo honorários", "prazo vencendo",
      "advogado tomando café", "cliente mandando áudio enorme",
      "processo sumiu", "advogado correndo no fórum",
      "audiência atrasada", "cliente chorando", "sustentação oral"
    ]
  },

  {
    id: "atualidades",
    name: "Atualidades & Internet",
    emoji: "📱",
    difficulty: "Médio",
    description: "Cultura digital, memes e comportamento atual.",
    words: [
      "inteligência artificial", "chatbot", "influenciador", "live", "trend",
      "dancinha viral", "podcast", "stories", "reels", "filtro de beleza",
      "delivery", "Pix", "golpe do Pix", "home office", "reunião online",
      "câmera desligada", "áudio acelerado", "grupo do WhatsApp",
      "meme", "cancelamento", "algoritmo", "celular sem bateria",
      "Wi-Fi caindo", "Wi-Fi ruim", "compra online", "review de produto",
      "unboxing", "academia às 6 da manhã", "coach motivacional", "skincare",
      "harmonização facial", "foto no espelho", "aplicativo travando",
      "tela rachada", "comprar no boleto", "boleto vencido",
      "dieta começando amanhã", "entrevista de emprego",
      "reunião que podia ser e-mail", "segunda-feira", "ansiedade",
      "procrastinação", "vergonha alheia", "ressaca moral", "nostalgia",
      "crise existencial", "stalker no Instagram", "deixar no vácuo",
      "indireta no story", "selfie no espelho", "TikTok", "Instagram",
      "Twitter", "YouTube", "stories sumindo", "tela dividida",
      "videochamada congelando", "headset", "ring light", "selfie stick",
      "drone", "smartwatch", "robô aspirador", "alexa", "cabo enrolado",
      "celular descarregando", "powerbank salvando vida", "QR code",
      "leitor de QR code", "fone caindo no chão"
    ]
  },

  {
    id: "viagem",
    name: "Viagem & Mundo",
    emoji: "✈️",
    difficulty: "Médio",
    description: "Aeroporto, perrengue de turista e cenas de viagem.",
    words: [
      "aeroporto", "mala perdida", "turista perdido", "passaporte", "imigração",
      "hotel", "praia", "neve", "metrô lotado", "pedir informação",
      "falar inglês enrolado", "tirar foto de monumento", "comer comida estranha",
      "guia turístico", "viagem em família", "voo atrasado", "turbulência",
      "taxista", "ônibus de excursão", "fila do check-in", "raio-x do aeroporto",
      "esteira de bagagem", "porta de embarque", "cinto de segurança",
      "máscara no avião", "cobertor do avião", "comissário de bordo",
      "lanchinho do voo", "câmera do turista", "selfie na Torre Eiffel",
      "selfie no Cristo Redentor", "selfie na Estátua da Liberdade",
      "Paris", "Nova York", "Tóquio", "Roma", "Londres", "Dubai",
      "Disneylândia", "Cataratas", "Machu Picchu", "Buenos Aires",
      "Cancun", "Bali", "Las Vegas", "geladeira do hotel", "café da manhã do hotel",
      "piscina lotada", "spa", "passeio de barco", "passeio de helicóptero",
      "alugar carro", "GPS errando o caminho", "fila gigante no museu",
      "souvenir caro", "moeda estrangeira", "ímã de geladeira",
      "casinha de praia", "chalé na serra", "rodoviária movimentada",
      "viajante atrasado", "tour de 3 horas", "guia falando alto",
      "trekking pesado", "mochila gigante"
    ]
  },

  {
    id: "fitness",
    name: "Academia & Fitness",
    emoji: "💪",
    difficulty: "Médio",
    description: "Treino, marombeiro e dieta começando amanhã.",
    words: [
      "levantamento de peso", "esteira", "agachamento", "personal trainer",
      "yoga", "alongamento", "dieta", "marmita fitness", "whey protein",
      "frango com batata doce", "pessoa quebrada depois do treino",
      "abdominal", "flexão", "spinning", "musculação", "treino de perna",
      "foto no espelho da academia", "halteres", "barra", "anilha",
      "supino reto", "leg press", "remada", "rosca direta", "tríceps testa",
      "polichinelo", "burpee", "prancha", "abdominal infinito",
      "corda naval", "kettlebell", "fita elástica", "elíptico", "bicicleta ergométrica",
      "tatame", "ringue de luta", "saco de pancada", "luva de boxe",
      "monitor cardíaco", "academia lotada", "academia vazia",
      "vestiário", "balança", "espelho da academia", "tomar shake",
      "treino de glúteo", "marombeiro", "boy magia da academia",
      "treinador gritando", "alunos cansados", "treino HIIT", "Crossfit",
      "funcional", "mat de yoga", "garrafinha de água", "toalha no pescoço",
      "headphone do treino", "playlist motivacional", "selfie pós-treino",
      "dia da panturrilha", "dia da perna", "dia do braço",
      "cara que só treina peito", "cara que só treina bíceps",
      "alongar antes do treino", "esticar depois do treino",
      "academia às 5 da manhã", "academia depois do trabalho"
    ]
  },

  {
    id: "dificil",
    name: "Difícil",
    emoji: "🧠",
    difficulty: "Difícil",
    description: "Cenas e sentimentos abstratos — pros corajosos.",
    words: [
      "procrastinação", "vergonha alheia", "ressaca moral",
      "reunião que podia ser e-mail", "segunda-feira", "ansiedade",
      "Wi-Fi ruim", "dieta começando amanhã", "boleto vencido",
      "entrevista de emprego", "ciúmes", "blefe", "nostalgia",
      "crise existencial", "saudade", "esperança", "ironia", "inveja",
      "déjà vu", "tédio", "euforia", "melancolia", "frustração",
      "gratidão", "empatia", "indiferença", "perdão", "remorso",
      "orgulho", "humildade", "covardia", "coragem", "lealdade",
      "traição", "tentação", "intuição", "paciência", "impaciência",
      "tolerância", "obsessão", "liberdade", "burnout",
      "síndrome do impostor", "energia ruim", "energia boa",
      "sexta-feira chegando", "domingo à tarde", "domingo deprê",
      "amizade colorida", "ficar no vácuo", "deixar no vácuo",
      "sair na surdina", "fingir que está bem", "rir pra não chorar",
      "dor de cotovelo", "vontade de sumir", "pensar na vida",
      "decisão difícil", "primeiro dia de aula", "último dia de férias",
      "domingo de chuva", "manhã de feriado"
    ]
  }
  /* "Aleatório" é gerado dinamicamente em app.js juntando todas as categorias acima. */
];

/**
 * Helper: retorna a "categoria virtual" Aleatório combinando todas as palavras.
 * Chamado em app.js quando o usuário escolhe "Misturar tudo".
 *
 * Curva de dificuldade: peso por categoria-mãe.
 *   Fácil/Médio:  peso 1.0
 *   Difícil:      peso 0.50
 *   Insano:       peso 0.25
 * Palavras de categorias mais difíceis aparecem menos no aleatório — resolve o
 * "às vezes fica hardcore" sem precisar taggar as 1.112 palavras individualmente.
 *
 * Aceita opts:
 *   { includeHard: false }  → ignora categorias Difícil/Insano
 *   { weighted: false }     → mistura tudo na mesma proporção (comportamento antigo)
 */
window.GESTO_BUILD_RANDOM = function (opts) {
  opts = opts || {};
  var includeHard = opts.includeHard !== false;
  var weighted    = opts.weighted    !== false;

  var weights = { 'Fácil': 1.0, 'Médio': 1.0, 'Difícil': 0.50, 'Insano': 0.25 };
  var all = [];
  var sourceMap = Object.create(null);
  window.GESTO_CATEGORIES.forEach(function (cat) {
    if (!includeHard && (cat.difficulty === 'Difícil' || cat.difficulty === 'Insano')) return;
    var w = weighted ? (weights[cat.difficulty] || 1.0) : 1.0;
    cat.words.forEach(function (word) {
      if (Math.random() < w) {
        all.push(word);
        if (!sourceMap[word]) sourceMap[word] = cat.id;
      }
    });
  });
  // Fallback de segurança — se peso filtrar tudo, devolve todas as palavras
  if (all.length < 30) {
    all = [];
    sourceMap = Object.create(null);
    window.GESTO_CATEGORIES.forEach(function (cat) {
      if (!includeHard && (cat.difficulty === 'Difícil' || cat.difficulty === 'Insano')) return;
      cat.words.forEach(function (w) {
        all.push(w);
        if (!sourceMap[w]) sourceMap[w] = cat.id;
      });
    });
  }
  return {
    id: 'aleatorio',
    name: 'Aleatório',
    emoji: '🎲',
    difficulty: 'Variado',
    description: 'Sorteia de todas as categorias.',
    words: all,
    _sourceMap: sourceMap
  };
};

/**
 * Constrói uma "categoria virtual" a partir de uma lista de IDs de categorias reais.
 * Usado pela tela de multi-seleção e pelos presets.
 */
window.GESTO_BUILD_MIX = function (catIds, displayName) {
  var cats = (catIds || [])
    .map(function (id) { return window.GESTO_CATEGORIES.find(function (c) { return c.id === id; }); })
    .filter(Boolean);
  if (cats.length === 0) return null;
  if (cats.length === 1) {
    // 1 categoria só → devolve a própria, sem virar mix
    return cats[0];
  }
  var dedup = [];
  var seen = Object.create(null);
  var sourceMap = Object.create(null);
  cats.forEach(function (c) {
    c.words.forEach(function (w) {
      if (!seen[w]) {
        seen[w] = 1;
        dedup.push(w);
        sourceMap[w] = c.id;
      }
    });
  });
  var order = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3, 'Insano': 4 };
  var worst = cats.reduce(function (acc, c) {
    return (order[c.difficulty] || 2) > (order[acc] || 0) ? c.difficulty : acc;
  }, 'Fácil');
  return {
    id: 'mix:' + cats.map(function (c) { return c.id; }).sort().join('+'),
    name: displayName || ('Mix (' + cats.length + ' categorias)'),
    emoji: '🍳',
    difficulty: worst,
    description: cats.map(function (c) { return c.name; }).join(' + '),
    words: dedup,
    _mixIds: cats.map(function (c) { return c.id; }),
    _sourceMap: sourceMap
  };
};

/**
 * Presets sugeridos para o usuário não ter que escolher categoria por categoria.
 */
window.GESTO_MIX_PRESETS = [
  { id: 'familia',   label: '👨‍👩‍👧 Família',  ids: ['animais', 'comidas', 'brasilidades', 'infantil'] },
  { id: 'role',      label: '🍻 Rolê pesado',  ids: ['festa', 'casais', 'atualidades', 'dificil'] },
  { id: 'cultura',   label: '🎬 Cultura pop',  ids: ['filmes', 'atualidades', 'esportes'] },
  { id: 'brpuro',    label: '🇧🇷 BR puro',     ids: ['brasilidades', 'comidas', 'festa', 'juridico'] },
  { id: 'suave',     label: '⚡ Suave',         ids: ['animais', 'objetos', 'profissoes', 'acoes'] },
  { id: 'corajosos', label: '🧠 Pros corajosos', ids: ['dificil', 'atualidades', 'juridico'] }
];
