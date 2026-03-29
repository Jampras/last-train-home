# Last Train Home - Documentation Index

This folder contains the full pre-production and execution package for a web game inspired by:

- `Kingdom Two Crowns` for side-view settlement defense and indirect control
- `Risk of Rain` for run-based progression and permanent unlock variety
- `Spiritfarer` for warmth, silhouette readability, hand-crafted tone, and character-driven atmosphere

Working title:

- `Last Train Home`

Core fantasy:

- Lead a moving sanctuary of cats across a hostile human world
- Build a temporary refuge at each station
- Survive the night
- Rescue more cats
- Return to the train with new unlocks, memories, and construction options

Target platform:

- Web
- Desktop keyboard-first
- Mobile and tablet touch-first
- Deployable to Vercel

Recommended implementation stack:

- Phaser
- TypeScript
- Vite
- DOM HUD and menus layered above the Phaser canvas

Current implementation status:

- prologue jogavel completo
- hub persistente com rotas, vagoes e desfecho v1
- 4 rotas ativas na campanha
- smoke test desktop e mobile automatizado
- release candidate publicado em [https://gameweb-xi.vercel.app](https://gameweb-xi.vercel.app)
- codigo publicado em [https://github.com/Jampras/last-train-home](https://github.com/Jampras/last-train-home)

Reading order:

1. `01-game-vision.md`
2. `02-narrative-and-world.md`
3. `10-art-and-audio-bible.md`
4. `03-core-loop-and-systems.md`
5. `04-meta-progression-and-content.md`
6. `05-web-ux-and-input.md`
7. `06-technical-architecture.md`
8. `07-production-roadmap.md`
9. `08-sprint-plan.md`
10. `09-qa-and-definition-of-done.md`
11. `11-hardening-and-ops.md`
12. `12-visual-roadmap.md`
13. `13-visual-direction-lock-v1.md`
14. `14-v2-hud-layout-pass.md`
15. `15-v3-prologue-environment-pass.md`
16. `16-v4-character-silhouette-pass.md`
17. `17-v5-prologue-animation-acting-pass.md`
18. `18-v6-hub-visual-pass.md`
19. `19-v7-first-run-environment-pass.md`
20. `20-v8-biome-identity-pass.md`
21. `21-v9-fx-and-lighting-pass.md`

Daily commands:

1. `npm run dev`
2. `npm run lint`
3. `npm run test`
4. `npm run test:smoke -- --url=http://127.0.0.1:4173`
5. `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
6. `npm run build`

Production principles:

- Progression must feel strong from the first hour
- Failure must still grant permanent value
- Easy and medium modes must teach rather than punish
- Staying longer in a run must feel rewarding before it feels dangerous
- The train must evolve visually and functionally between runs
- Story delivery must create suspense without slowing the game down

Mandatory game promises:

- Safe playable tutorial in the prologue
- Father-leader death in the first night disaster
- Time skip of 3 years before the main game begins
- Multiple cat leaders with unique train improvements
- Mastery challenges per cat that unlock advanced versions of those improvements
- Day/night cycle with clock-driven event windows and unique sound cues
- Human and dog enemies that threaten capture, sabotage, and station pressure
- Keyboard and touch support, including horizontal swipe controls inspired by `Kingdom`
