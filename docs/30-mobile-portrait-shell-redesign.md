# Mobile Portrait Shell Redesign

Date:

- `2026-03-29`

Objective:

- Fix portrait-mobile readability after the horizontal shell pass.
- Keep the game horizontally framed without rotating the entire UI.
- Make the mobile HUD understandable and playable again.

Implemented:

- Removed full-shell rotation in portrait mode.
- Replaced it with a portrait mobile layout:
  - horizontal playfield in a letterboxed `16:9` stage
  - readable top rail
  - compact bottom rail
  - simplified prompt surface
  - touch dock grouped and resized for portrait use
- Hid low-value prompt chrome in portrait:
  - prompt eyebrow
  - prompt tags
  - event body
- Reduced chip, panel, stat, and button density for portrait screens.

Files:

- `src/styles.css`

Validation:

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. `npm run test:smoke -- --url=http://127.0.0.1:4173`
5. `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`

Outcome:

- Portrait mobile is now legible.
- The stage remains horizontal without rotating all HUD text.
- Desktop behavior stays intact.
