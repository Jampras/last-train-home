# Shell UX Polish and Publish

Date:

- `2026-03-29`

Objective:

- Finish the horizontal shell with cleaner UX.
- Make hub and action rails easier to parse.
- Keep controls simple on desktop and touch.

Implemented:

- `HudController.ts`
  - Reduced hub panel density.
  - Replaced the long route/status block with a compact command summary.
  - Shortened project and last-note text.
  - Simplified button labels:
    - `Projeto`
    - `Equipe`
    - `Poder`
    - `Partir`

- `createShell.ts`
  - Marked primary and focus actions in the bottom rail.
  - Refined touch labels to shorter action verbs.

- `styles.css`
  - Added stronger hierarchy for:
    - primary action
    - focus action
    - compact command panel
  - Refined touch dock groups with clearer visual separation.
  - Kept the shell outside the playfield while improving scan speed.

Validation:

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. `npm run test:smoke -- --url=http://127.0.0.1:4173`
5. `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`

Outcome:

- The shell is now simpler, more readable, and easier to use on both keyboard and touch.
- The project is ready to publish.
