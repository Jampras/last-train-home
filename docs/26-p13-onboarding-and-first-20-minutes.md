# 26 - P13 Onboarding and First 20 Minutes

## Goal

Make the first session easier to understand without adding heavier text burden.

## What Changed

- added a dedicated help overlay reachable from the HUD at any time
- help overlay now adapts by scene:
  - hub guidance
  - prologue basics
  - run survival loop
- the help overlay blocks gameplay input while open
- prompt copy in the run loop was simplified:
  - shorter departure instruction
  - clearer collection and rescue wording
  - clearer build wording
- the prompt panel now teaches with action tags instead of only prose:
  - move
  - interact
  - build
  - rescue
  - crew role swap
  - departure

## Files Updated

- `src/game/simulation/core/types.ts`
- `src/game/simulation/core/createGameStore.ts`
- `src/app/shell/createShell.ts`
- `src/ui/hud/HudController.ts`
- `src/styles.css`

## New Standard

- onboarding should teach by state and action, not by long explanation
- the next useful verb should be visible in one glance
- players should always be able to open a lightweight help surface from the HUD
- overlays that explain controls must pause the game cleanly

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
- targeted browser check:
  - help opens in hub and run
  - help text changes by scene
  - gameplay input stays blocked while help is open
