# Last Train Home

Jogo web 2D em `Phaser + TypeScript + Vite` com foco em:

- progressao forte entre runs
- hub persistente no trem
- lideres felinos com maestria
- eventos por horario
- suporte a teclado e touch com swipe

Build atual:

- release candidate publicado em [https://gameweb-xi.vercel.app](https://gameweb-xi.vercel.app)
- codigo publicado em [https://github.com/Jampras/last-train-home](https://github.com/Jampras/last-train-home)

## Comandos

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`

## Fluxo recomendado

1. subir `npm run dev`
2. rodar `npm run lint`
3. rodar `npm run test`
4. rodar smoke desktop
5. rodar smoke mobile
6. gerar `npm run build`

## Estrutura

- [src/app/bootstrap/startApp.ts](C:\Users\Jotape\Documents\gameweb\src\app\bootstrap\startApp.ts): bootstrap da aplicacao, HUD, input e integracao Phaser
- [src/game/simulation/core/createGameStore.ts](C:\Users\Jotape\Documents\gameweb\src\game\simulation\core\createGameStore.ts): simulacao principal e progressao
- [src/phaser/scenes/PrologueScene.ts](C:\Users\Jotape\Documents\gameweb\src\phaser\scenes\PrologueScene.ts): prologo jogavel
- [src/phaser/scenes/TrainHubScene.ts](C:\Users\Jotape\Documents\gameweb\src\phaser\scenes\TrainHubScene.ts): hub do trem
- [src/phaser/scenes/StationRunScene.ts](C:\Users\Jotape\Documents\gameweb\src\phaser\scenes\StationRunScene.ts): run lateral
- [scripts/playtest-smoke.mjs](C:\Users\Jotape\Documents\gameweb\scripts\playtest-smoke.mjs): smoke test automatizado desktop/mobile

## Documentacao

- [docs/00-current-status.md](C:\Users\Jotape\Documents\gameweb\docs\00-current-status.md)
- [docs/README.md](C:\Users\Jotape\Documents\gameweb\docs\README.md)
- [docs/09-qa-and-definition-of-done.md](C:\Users\Jotape\Documents\gameweb\docs\09-qa-and-definition-of-done.md)
- [docs/11-hardening-and-ops.md](C:\Users\Jotape\Documents\gameweb\docs\11-hardening-and-ops.md)
