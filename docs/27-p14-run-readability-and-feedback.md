# P14 - Run Readability and Feedback

Date:

- `2026-03-29`

Objective:

- Make the active run easier to read at a glance.
- Reduce reliance on text by reinforcing danger, nearby interactions, and departure state with visual feedback.
- Keep the HUD restrained while making the next correct action more obvious.

Implemented:

- `StationRunScene.ts`
  - Added a departure cue around the train when the run can end successfully.
  - Added a focus cue for the nearest relevant target:
    - resources
    - recruits
    - build nodes
    - merchant
    - crew command zone
    - train departure
  - Added threat cues:
    - side pressure indicators for west/east attackers
    - stronger train danger wash when integrity is low
    - red edge pressure when the line is under stress
  - Improved train integrity bar readability with segment markers and low-health emphasis.

- `HudController.ts`
  - Added run tone resolution for calm, merchant, danger, and ready states.
  - Status chip now prioritizes what matters most:
    - enemies on the line
    - critical integrity
    - merchant active
    - departure ready
  - Prompt title and prompt tags now react to run state before generic context text.
  - Main action button, build button, crew button, skill button, prompt panel, and top chips now expose visual tone state.

- `styles.css`
  - Added tone-aware variants for:
    - HUD chips
    - prompt panel
    - action buttons
    - prompt tags
  - Ready state is visually calmer and greener.
  - Danger state is warmer and more urgent without becoming noisy.

- `playtest-smoke.mjs`
  - Hardened overlay interaction steps in smoke automation to avoid false negatives in SPA/mobile flows.

Why this sprint matters:

- The run no longer depends on the player reading a full sentence before acting.
- Threat, extraction, and nearby interaction are now visible in the scene itself.
- The HUD now behaves more like a guide rail and less like a static information bar.

Definition of done:

- A player can tell whether the run is:
  - calm
  - under attack
  - protecting a merchant
  - ready to depart
- A nearby useful target receives a visible cue in the playfield.
- Low train integrity is immediately legible.
- Desktop and mobile smoke tests pass after the changes.

Validation:

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. `npm run test:smoke -- --url=http://127.0.0.1:4173`
5. `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`

Outcome:

- `P14` is complete and the project is ready to move into `P15`.
