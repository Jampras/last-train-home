# Responsive Landscape Shell Pass

Date:

- `2026-03-29`

Objective:

- Keep gameplay clear on any screen size.
- Remove non-modal HUD from the playfield.
- Force the game to run in a landscape frame, including portrait mobile devices.

Implemented:

- `createShell.ts`
  - Rebuilt the app shell into a real landscape frame.
  - Moved HUD rails outside the playfield:
    - top rail for chips and event banner
    - bottom rail for prompt, hub panel, actions, and touch controls
  - Kept only modal overlays above gameplay:
    - settings
    - help
    - summary and memory

- `styles.css`
  - Added a centered `landscape-frame` shell.
  - Forced portrait devices into a rotated horizontal frame.
  - Separated the playfield from HUD rails so normal gameplay UI no longer covers the canvas.
  - Reworked hub action dock and panel sizing to keep primary actions visible.
  - Improved low-height and narrow-screen behavior.

- `createGameConfig.ts`
  - Switched Phaser renderer to `Canvas` for stability on mobile orientation/resizing.

- `startApp.ts`
  - Added `ResizeObserver`-driven resizing tied to the actual playfield container.

- `playtest-smoke.mjs`
  - Updated HUD-button triggering to remain stable with transformed landscape layouts.

Validation:

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. `npm run test:smoke -- --url=http://127.0.0.1:4173`
5. `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`

Outcome:

- The game now runs inside a horizontal shell on desktop and portrait mobile.
- Normal HUD no longer sits on top of the active playfield.
- Desktop and mobile smoke flows both pass on the new layout.
