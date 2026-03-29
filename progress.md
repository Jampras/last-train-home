Original prompt: Criar um jogo web inspirado em Kingdom Two Crowns e Risk of Rain, com protagonistas gatos, progressao forte entre runs, prologo jogavel, suporte a teclado e touch com swipe, e deploy na Vercel.

2026-03-29

- Sprint 9 em andamento.
- Escopo desta rodada: migracao segura de save, tuning de `aconchegante` e `jornada`, resumo de run mais claro, correcoes de maestria incoerente e validacao final.
- Ajustes aplicados ate agora:
  - `profileStorage.ts` agora sanitiza save antigo/corrompido e filtra ids invalidos.
  - `createGameStore.ts` recebeu rebalanceamento inicial de recursos, ritmo do relogio, ondas e recompensas.
  - `leaders.ts` teve textos de maestria alinhados ao que a simulacao realmente mede.
  - `HudController.ts` mostra resumo mais forte de progressao.
- TODO antes de fechar o sprint:
  - nenhum bloqueio aberto do Sprint 9

Resultados da rodada:

- `npm run build` passou.
- `npm run lint` passou.
- `npm run test` passou com 14 testes.
- Playtest local validou:
  - hub apos prologo
  - run com preparacao visual
  - resumo de run com banco de progresso
  - campanha completa ate o desfecho
  - sem `pageerror` e sem `console error`
- Release candidate publicado na Vercel:
  - `https://gameweb-xi.vercel.app`

Observacoes:

- O deploy criou `.vercel/` e atualizou `.gitignore` via `vercel link`.
- Screenshots e relatorios desta rodada estao em `output/playwright/`.

2026-03-29 - Auditoria geral e hardening

- Auditoria completa executada em codigo, runtime e documentacao.
- Bugs reais encontrados e corrigidos:
  - run seguia avancando atras do painel de ajustes
  - input seguia aceitando movimento atras do painel de ajustes
  - modal de memoria/resumo podia ficar abaixo da HUD no mobile
  - listeners de `resize` sobreviviam ao shutdown das cenas e quebravam transicao mobile
- Entregas novas:
  - `scripts/playtest-smoke.mjs`
  - `README.md` na raiz
  - `docs/11-hardening-and-ops.md`
- Validacao final desta rodada:
  - `npm run lint`
  - `npm run test`
  - `npm run test:smoke -- --url=http://127.0.0.1:4173`
  - `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
  - `npm run build`
- Pontos fracos mantidos como conhecidos:
  - bundle do Phaser ainda e o maior custo de payload
  - arte ainda e de placeholder
  - smoke depende do hook `__LTH_DEBUG` em dev

2026-03-29 - Roadmap visual

- Documento novo criado: `docs/12-visual-roadmap.md`
- Roadmap visual separado do roadmap geral para conduzir a elevacao de qualidade estetica.
- Foco recomendado para a proxima fase:
  - V1 Direcao Visual Lock
  - V2 HUD Restraint and Layout Pass
  - V3 Prologue Environment Pass

2026-03-29 - V1 Direcao Visual Lock

- V1 executado.
- Entregas criadas:
  - `docs/13-visual-direction-lock-v1.md`
  - `docs/mockups/v1-prologue-target.svg`
  - `docs/mockups/v1-hub-target.svg`
  - `docs/mockups/v1-run-target.svg`
- Lock aplicado no codigo:
  - dupla tipografica definida em `index.html`
  - tokens visuais base definidos em `src/styles.css`
  - fontes das cenas Phaser alinhadas ao direction lock
- V2 agora pode atacar layout/HUD sem reabrir tipografia ou paleta.

2026-03-29 - V2 HUD Restraint and Layout Pass

- V2 executado.
- HUD de gameplay simplificada:
  - painel grande removido de prologo e run
  - prompt contextual compacto adicionado ao centro da composicao
  - chips superiores encurtados
  - dock de acoes ficou mais leve durante gameplay
- Hub mantido como superficie de progresso detalhada.
- Documentacao nova:
  - `docs/14-v2-hud-layout-pass.md`

2026-03-29 - V3 Prologue Environment Pass

- V3 executado.
- O prologo recebeu novo pass de ambiente:
  - ceu em camadas
  - silhuetas de estacao ao fundo
  - trem redesenhado com mais peso visual
  - props recompostos em pilhas, poste, barricada e compartimento
  - leitura de trilho e solo separada por bandas
  - estado de desastre com luz de intrusao, cerca pressionada e atmosfera mais pesada
- O texto dentro do canvas foi reduzido para legenda cinematografica, deixando a HUD cuidar do prompt.
- Documentacao nova:
  - `docs/15-v3-prologue-environment-pass.md`

2026-03-29 - V4 Character Silhouette Pass

- V4 executado.
- Novo renderer compartilhado de silhuetas criado em `src/phaser/render/drawSilhouettes.ts`.
- Aplicado no prologo:
  - protagonista
  - pai
  - gatinha perdida
- Aplicado na primeira run:
  - lider
  - recrutas
  - tripulacao
  - humanos
  - caes
  - mercador
- Smoke de Playwright endurecido com timeout maior e `animations: 'disabled'` no screenshot para evitar flake.
- Documentacao nova:
  - `docs/16-v4-character-silhouette-pass.md`

2026-03-29 - V5 Prologue Animation and Acting Pass

- V5 executado.
- Silhuetas de gato agora aceitam pose procedural:
  - bob
  - stretch
  - tail lift
  - head lift
  - crouch
- O prologo ganhou:
  - respiracao e peso no protagonista
  - acting mais firme no pai
  - tremor na gatinha sob ameaca
  - lampiao e fumaca mais vivos
  - flash mais claro no rompimento
  - timeskip com fade e drift
  - letterbox cinematografico
- Smoke ajustado com limite maior de simulacao de run para evitar falso negativo.
- Documentacao nova:
  - `docs/17-v5-prologue-animation-acting-pass.md`

2026-03-29 - V6 Hub Visual Pass

- V6 executado.
- O hub foi redesenhado para parecer base viva em vez de fundo tecnico:
  - ceu em camadas
  - trilho e plataforma com mais estrutura
  - trem com mais peso, fumaca, janelas quentes e crescimento fisico
  - brilho extra em vagoes evoluidos
  - lider em silhueta heroica junto ao trem
  - mapa de rotas enquadrado como parte do mundo
- Bug real de runtime corrigido:
  - labels do mapa de rotas podiam atualizar durante o shutdown da cena e quebrar o smoke
- Documentacao nova:
  - `docs/18-v6-hub-visual-pass.md`

2026-03-29 - V7 First Run Environment Pass

- V7 executado.
- A `Plataforma Silenciosa` foi reconstruida como cena autoral:
  - ceu em camadas
  - skyline de estacao ao fundo
  - solo, ballast e trilho mais legiveis
  - trem com mais peso e calor
  - pickups redesenhados por material
  - marcos redesenhados por funcao
  - mercador com barraca e luz propria
- feedback visual de integridade do trem melhorado
- Documentacao nova:
  - `docs/19-v7-first-run-environment-pass.md`

2026-03-29 - V8 Biome Identity Pass

- V8 executado.
- As rotas ganharam assinatura visual mais forte:
  - `Patio de Carga` com massa industrial, containers e linha de guindaste
  - `Travessia Inundada` com reflexo, madeira molhada e leitura de agua
  - `Borda do Canil` com repeticao de cerca, luz de alerta e blocos de canil
- O ceu, a faixa de solo e a nevoa agora respondem ao bioma, e nao so ao horario.
- Documentacao nova:
  - `docs/20-v8-biome-identity-pass.md`

2026-03-29 - V9 FX and Lighting Pass

- V9 executado.
- A primeira run recebeu camada dedicada de FX e iluminacao:
  - vinheta suave nas bordas
  - pools quentes ao redor do trem
  - spill de luz mais forte em postes ativos
  - glow do mercador
  - glow hostil dos `lanternists`
  - faixa noturna mais pesada para leitura de pressao
- O prologo recebeu pass leve de iluminacao para alinhar staging:
  - lampiao mais legivel
  - trem mais quente como ancora segura
  - wash hostil vermelho durante o rompimento
- Texto quebrado no hub normalizado para ASCII-safe.
- Documentacao nova:
  - `docs/21-v9-fx-and-lighting-pass.md`
